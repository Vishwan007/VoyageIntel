import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import fs from "fs";
import path from "path";
import { 
  insertConversationSchema, 
  insertMessageSchema, 
  insertDocumentSchema 
} from "@shared/schema";
import { 
  analyzeMaritimeQuery, 
  generateMaritimeResponse, 
  summarizeDocument, 
  extractDocumentType 
} from "./services/openai";
import { 
  calculateLaytime, 
  calculateDistance, 
  getWeatherConditions, 
  interpretCPClause,
  searchMaritimeKnowledge 
} from "./services/maritime-knowledge";

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file type'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Conversations
  app.get("/api/conversations", async (req, res) => {
    try {
      const conversations = await storage.getConversations();
      res.json(conversations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch conversations" });
    }
  });

  app.post("/api/conversations", async (req, res) => {
    try {
      const validatedData = insertConversationSchema.parse(req.body);
      const conversation = await storage.createConversation(validatedData);
      res.json(conversation);
    } catch (error) {
      res.status(400).json({ message: "Invalid conversation data" });
    }
  });

  app.get("/api/conversations/:id", async (req, res) => {
    try {
      const conversation = await storage.getConversation(req.params.id);
      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }
      res.json(conversation);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch conversation" });
    }
  });

  app.delete("/api/conversations/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteConversation(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Conversation not found" });
      }
      res.json({ message: "Conversation deleted" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete conversation" });
    }
  });

  // Messages
  app.get("/api/conversations/:conversationId/messages", async (req, res) => {
    try {
      const messages = await storage.getMessagesByConversation(req.params.conversationId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post("/api/conversations/:conversationId/messages", async (req, res) => {
    try {
      const validatedData = insertMessageSchema.parse({
        ...req.body,
        conversationId: req.params.conversationId
      });

      // Create user message
      const userMessage = await storage.createMessage(validatedData);

      // Analyze query and generate AI response
      const analysis = await analyzeMaritimeQuery(validatedData.content);
      
      // Get relevant context
      const knowledgeBase = await searchMaritimeKnowledge(validatedData.content, analysis.category);
      const conversationHistory = await storage.getMessagesByConversation(req.params.conversationId);
      
      // For certain categories, perform actual calculations instead of AI
      let aiResponse: string;
      
      if (analysis.category === 'laytime' && validatedData.content.toLowerCase().includes('calculate')) {
        // Try to extract time information and calculate directly
        const content = validatedData.content.toLowerCase();
        
        // Simple pattern matching for common time formats
        const arrivalMatch = content.match(/arrived.*?(\d{1,2}):(\d{2})|(\d{1,2}):(\d{2}).*?arrived/);
        const completionMatch = content.match(/completed.*?(\d{1,2}):(\d{2})|finished.*?(\d{1,2}):(\d{2})|(\d{1,2}):(\d{2}).*?completed|(\d{1,2}):(\d{2}).*?finished/);
        
        if (arrivalMatch && completionMatch) {
          // Extract times and assume today/tomorrow based on context
          const arrivalHour = parseInt(arrivalMatch[1] || arrivalMatch[3]);
          const arrivalMin = parseInt(arrivalMatch[2] || arrivalMatch[4]);
          const completionHour = parseInt(completionMatch[1] || completionMatch[3] || completionMatch[5] || completionMatch[7]);
          const completionMin = parseInt(completionMatch[2] || completionMatch[4] || completionMatch[6] || completionMatch[8]);
          
          // Create dates (assuming next day if mentioned)
          const today = new Date();
          const arrivalTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), arrivalHour, arrivalMin);
          let completionTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), completionHour, completionMin);
          
          // If completion is before arrival, assume next day
          if (completionTime <= arrivalTime || content.includes('next day')) {
            completionTime.setDate(completionTime.getDate() + 1);
          }
          
          const totalMs = completionTime.getTime() - arrivalTime.getTime();
          const totalHours = Math.round((totalMs / (1000 * 60 * 60)) * 100) / 100;
          const totalDays = Math.round((totalHours / 24) * 100) / 100;
          
          aiResponse = `**Laytime Calculation Results:**\n\n• **Arrival Time:** ${arrivalTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}\n• **Completion Time:** ${completionTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} (+1 day)\n• **Total Laytime:** ${totalHours} hours (${totalDays} days)\n• **Working Days:** ${totalDays} days (excluding any weather delays)\n\n**Maritime Industry Notes:**\n• This calculation assumes continuous operations without weather interruptions\n• For Weather Working Days (WWD), deduct time when cargo operations were suspended due to weather\n• Demurrage applies if this exceeds your charter party's allowed laytime\n• Document all delays with proper notices for accurate settlement`;
        } else {
          aiResponse = `I can help calculate laytime, but I need specific times. Please provide:\n\n• **Arrival time** (when vessel tendered Notice of Readiness)\n• **Completion time** (when cargo operations finished)\n\nExample: "Vessel arrived at 14:30 and completed loading at 08:15 the next day"\n\nOnce you provide the times, I'll calculate the exact laytime in hours and days, plus provide guidance on demurrage and charter party implications.`;
        }
      } else if (analysis.category === 'distance') {
        // Extract port names and calculate distance
        const content = validatedData.content.toLowerCase();
        const fromPortMatch = content.match(/from\s+([a-zA-Z\s]+?)(?:\s+to|\s+and)/i);
        const toPortMatch = content.match(/to\s+([a-zA-Z\s]+?)(?:\s|$|[?.])/i);
        
        if (fromPortMatch && toPortMatch) {
          const fromPort = fromPortMatch[1].trim();
          const toPort = toPortMatch[1].trim();
          
          try {
            const result = calculateDistance(fromPort, toPort);
            aiResponse = `**Distance Calculation: ${result.fromPort} ↔ ${result.toPort}**\n\n• **Distance:** ${result.distanceNM} nautical miles\n• **Estimated Transit Time:** ${result.estimatedDays} days (at 14 knots average)\n• **Estimated Fuel Consumption:** ${result.fuelConsumption} MT\n\n**Voyage Planning Notes:**\n• Great circle distance calculation\n• Add 10-15% for weather routing and port approach\n• Consider seasonal weather patterns for route optimization\n• Budget additional time for port congestion and pilotage`;
          } catch (error) {
            aiResponse = `I can calculate distances between major ports. The ports "${fromPort}" and "${toPort}" might not be in my database. \n\nI have distances for major ports including:\n• **Europe:** Hamburg, Rotterdam, Antwerp, Felixstowe\n• **Asia:** Singapore, Shanghai, Tokyo, Mumbai\n• **Americas:** New York, Santos\n• **Middle East:** Dubai\n\nPlease specify major ports, or use the Distance tool in the sidebar for manual calculations.`;
          }
        } else {
          aiResponse = `I can calculate distances between ports. Please specify both ports clearly:\n\nExample: "What's the distance from Singapore to Dubai?"\n\nI'll provide:\n• Nautical mile distance\n• Estimated voyage time\n• Fuel consumption estimates\n• Route recommendations`;
        }
      } else if (analysis.category === 'weather') {
        // Extract location and provide weather info
        const content = validatedData.content.toLowerCase();
        const locationMatch = content.match(/in\s+([a-zA-Z\s]+?)(?:\s|$|[?.])/i) || 
                             content.match(/at\s+([a-zA-Z\s]+?)(?:\s|$|[?.])/i) ||
                             content.match(/weather.*?([a-zA-Z\s]+?)(?:\s|$|[?.])/i);
        
        if (locationMatch) {
          const location = locationMatch[1].trim();
          const weather = getWeatherConditions(location);
          
          aiResponse = `**Weather Conditions - ${location}**\n\n• **Current Condition:** ${weather.condition}\n• **Temperature:** ${weather.temperature}°C\n• **Wind Speed:** ${weather.windSpeed} knots\n• **Visibility:** ${weather.visibility} nautical miles\n\n**Operational Recommendation:**\n${weather.recommendation}\n\n**Maritime Operations Impact:**\n• Container operations: ${weather.windSpeed > 25 ? 'Suspended' : 'Normal'} (limit: 25 knots)\n• Bulk cargo loading: ${weather.condition.includes('Rain') ? 'Weather hold advised' : 'Proceeding normally'}\n• Pilot boarding: ${weather.visibility < 2 ? 'Delayed' : 'Normal'} (minimum: 2 NM visibility)`;
        } else {
          aiResponse = `I can provide weather conditions for maritime operations. Please specify a location:\n\nExample: "What's the weather in Hamburg?" or "Weather conditions at Rotterdam"\n\nI'll provide current conditions, operational impacts, and safety recommendations for cargo operations.`;
        }
      } else if (analysis.category === 'cp_clause') {
        // Extract clause text and interpret
        const content = validatedData.content;
        const clauseMatch = content.match(/["'](.*?)["']/) || content.match(/clause[:\s]+(.*?)(?:\.|$)/i);
        
        if (clauseMatch) {
          const clauseText = clauseMatch[1];
          const interpretation = interpretCPClause(clauseText);
          
          aiResponse = `**Charter Party Clause Analysis**\n\n**Clause Type:** ${interpretation.clauseType}\n\n**Interpretation:**\n${interpretation.interpretation}\n\n**Key Implications:**\n${interpretation.implications.map(imp => `• ${imp}`).join('\n')}\n\n**Recommendations:**\n${interpretation.recommendations.map(rec => `• ${rec}`).join('\n')}\n\n**Legal Notes:**\n• Ensure compliance with local port customs and regulations\n• Document all relevant circumstances for potential disputes\n• Consider seeking legal advice for complex interpretations`;
        } else {
          aiResponse = `I can interpret charter party clauses and provide legal implications. Please provide the specific clause text:\n\nExample: "Interpret this clause: 'Weather Working Days means days when weather permits normal cargo operations'"\n\nI'll analyze:\n• Clause type and meaning\n• Legal implications for both parties\n• Practical recommendations\n• Industry best practices`;
        }
      } else {
        // For general queries, try AI first, fallback to knowledge base
        aiResponse = await generateMaritimeResponse(validatedData.content, {
          knowledgeBase,
          conversationHistory: conversationHistory.map(m => ({
            role: m.role,
            content: m.content
          }))
        });
      }

      // Create AI response message
      const aiMessage = await storage.createMessage({
        conversationId: req.params.conversationId,
        role: "assistant",
        content: aiResponse,
        metadata: { analysis }
      });

      res.json({ userMessage, aiMessage });
    } catch (error) {
      console.error("Failed to process message:", error);
      res.status(400).json({ message: "Failed to process message" });
    }
  });

  // Documents
  app.get("/api/documents", async (req, res) => {
    try {
      const documents = await storage.getDocuments();
      res.json(documents);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch documents" });
    }
  });

  app.post("/api/documents/upload", upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      // Read file content
      const content = fs.readFileSync(req.file.path, 'utf-8');
      
      // Create document record
      const documentData = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size.toString(),
        content
      };

      const document = await storage.createDocument(documentData);

      // Process document asynchronously
      processDocumentAsync(document.id, content);

      res.json(document);
    } catch (error) {
      console.error("Failed to upload document:", error);
      res.status(500).json({ message: "Failed to upload document" });
    }
  });

  app.get("/api/documents/:id", async (req, res) => {
    try {
      const document = await storage.getDocument(req.params.id);
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      res.json(document);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch document" });
    }
  });

  app.delete("/api/documents/:id", async (req, res) => {
    try {
      const document = await storage.getDocument(req.params.id);
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }

      // Delete file from filesystem
      const filePath = path.join('uploads', document.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      const deleted = await storage.deleteDocument(req.params.id);
      res.json({ message: "Document deleted" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete document" });
    }
  });

  app.get("/api/documents/search", async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({ message: "Search query required" });
      }
      
      const documents = await storage.searchDocuments(query);
      res.json(documents);
    } catch (error) {
      res.status(500).json({ message: "Failed to search documents" });
    }
  });

  // Maritime tools
  app.post("/api/maritime/laytime", async (req, res) => {
    try {
      const { arrivalTime, completionTime, excludeWeekends } = req.body;
      
      if (!arrivalTime || !completionTime) {
        return res.status(400).json({ message: "Arrival and completion times required" });
      }

      const result = calculateLaytime(
        new Date(arrivalTime),
        new Date(completionTime),
        { excludeWeekends }
      );

      res.json(result);
    } catch (error) {
      res.status(400).json({ message: "Invalid date format" });
    }
  });

  app.post("/api/maritime/distance", async (req, res) => {
    try {
      const { fromPort, toPort } = req.body;
      
      if (!fromPort || !toPort) {
        return res.status(400).json({ message: "From and to ports required" });
      }

      const result = calculateDistance(fromPort, toPort);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Failed to calculate distance" });
    }
  });

  app.get("/api/maritime/weather", async (req, res) => {
    try {
      const location = req.query.location as string;
      if (!location) {
        return res.status(400).json({ message: "Location required" });
      }

      const weather = getWeatherConditions(location);
      res.json(weather);
    } catch (error) {
      res.status(500).json({ message: "Failed to get weather conditions" });
    }
  });

  app.post("/api/maritime/cp-clause", async (req, res) => {
    try {
      const { clauseText } = req.body;
      
      if (!clauseText) {
        return res.status(400).json({ message: "Clause text required" });
      }

      const result = interpretCPClause(clauseText);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Failed to interpret clause" });
    }
  });

  // Maritime knowledge base
  app.get("/api/maritime/knowledge", async (req, res) => {
    try {
      const category = req.query.category as string;
      const knowledge = await storage.getMaritimeKnowledge(category);
      res.json(knowledge);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch knowledge base" });
    }
  });

  app.get("/api/maritime/knowledge/search", async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({ message: "Search query required" });
      }
      
      const knowledge = await storage.searchMaritimeKnowledge(query);
      res.json(knowledge);
    } catch (error) {
      res.status(500).json({ message: "Failed to search knowledge base" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Helper function to process documents asynchronously
async function processDocumentAsync(documentId: string, content: string) {
  try {
    const document = await storage.getDocument(documentId);
    if (!document) return;

    const documentType = await extractDocumentType(document.originalName, content);
    const summary = await summarizeDocument(content, documentType);

    await storage.updateDocument(documentId, {
      documentType,
      summary,
      processed: true
    });
  } catch (error) {
    console.error("Failed to process document:", error);
  }
}
