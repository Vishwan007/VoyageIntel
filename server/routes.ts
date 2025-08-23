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
      
      const aiResponse = await generateMaritimeResponse(validatedData.content, {
        knowledgeBase,
        conversationHistory: conversationHistory.map(m => ({
          role: m.role,
          content: m.content
        }))
      });

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
