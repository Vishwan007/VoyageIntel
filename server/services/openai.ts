import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here' 
  ? new OpenAI({ 
      apiKey: process.env.OPENAI_API_KEY
    })
  : null;

export interface MaritimeQueryAnalysis {
  category: 'laytime' | 'weather' | 'distance' | 'cp_clause' | 'document_analysis' | 'voyage_guidance' | 'general';
  confidence: number;
  suggestedActions: string[];
  requiresDocuments: boolean;
}

export async function analyzeMaritimeQuery(query: string): Promise<MaritimeQueryAnalysis> {
  try {
    if (!openai) {
      throw new Error("OpenAI API key not configured");
    }
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a maritime domain expert. Analyze the user's query and categorize it. Respond with JSON in this exact format:
          {
            "category": "laytime|weather|distance|cp_clause|document_analysis|voyage_guidance|general",
            "confidence": 0.0-1.0,
            "suggestedActions": ["action1", "action2"],
            "requiresDocuments": true|false
          }
          
          Categories:
          - laytime: Time calculations, loading/discharging operations
          - weather: Weather conditions, forecasts, weather routing
          - distance: Port distances, voyage planning, fuel calculations
          - cp_clause: Charter party clauses, contract terms
          - document_analysis: Requests to analyze uploaded documents
          - voyage_guidance: Voyage planning, port procedures, regulations
          - general: Other maritime-related questions`
        },
        {
          role: "user",
          content: query
        }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return {
      category: result.category || 'general',
      confidence: Math.max(0, Math.min(1, result.confidence || 0.5)),
      suggestedActions: result.suggestedActions || [],
      requiresDocuments: result.requiresDocuments || false
    };
  } catch (error: any) {
    console.error("Failed to analyze maritime query:", error);
    
    // Provide better categorization based on keywords even without AI
    const queryLower = query.toLowerCase();
    let category: any = 'general';
    let confidence = 0.7;
    let suggestedActions: string[] = [];
    
    if (queryLower.includes('laytime') || queryLower.includes('loading') || queryLower.includes('discharge')) {
      category = 'laytime';
      suggestedActions = ['Calculate precise laytime', 'Review charter party terms'];
    } else if (queryLower.includes('weather') || queryLower.includes('wind') || queryLower.includes('rain')) {
      category = 'weather';
      suggestedActions = ['Check weather conditions', 'Review operational guidelines'];
    } else if (queryLower.includes('distance') || queryLower.includes('route') || queryLower.includes('voyage')) {
      category = 'distance';
      suggestedActions = ['Calculate voyage distance', 'Estimate fuel consumption'];
    } else if (queryLower.includes('charter') || queryLower.includes('clause') || queryLower.includes('cp')) {
      category = 'cp_clause';
      suggestedActions = ['Interpret charter terms', 'Review legal implications'];
    }
    
    return {
      category,
      confidence,
      suggestedActions,
      requiresDocuments: false
    };
  }
}

export async function generateMaritimeResponse(
  query: string, 
  context: {
    knowledgeBase?: any[];
    documents?: any[];
    conversationHistory?: any[];
  }
): Promise<string> {
  try {
    if (!openai) {
      throw new Error("OpenAI API key not configured");
    }
    
    const systemPrompt = `You are MaritimeAI, an expert maritime assistant specializing in:
    - Laytime calculations and charterparty terms
    - Weather analysis and routing
    - Port distances and voyage planning
    - Maritime regulations and procedures
    - Document analysis and interpretation

    Provide accurate, professional responses based on maritime industry standards.
    If you need additional information, ask specific questions.
    Always cite relevant regulations or industry practices when applicable.`;

    const contextInfo = [];
    if (context.knowledgeBase?.length) {
      contextInfo.push("Relevant knowledge base entries:");
      context.knowledgeBase.forEach(kb => {
        contextInfo.push(`- ${kb.title}: ${kb.content}`);
      });
    }

    if (context.documents?.length) {
      contextInfo.push("Referenced documents:");
      context.documents.forEach(doc => {
        contextInfo.push(`- ${doc.originalName}: ${doc.summary || doc.content?.substring(0, 200)}`);
      });
    }

    const messages: any[] = [
      { role: "system", content: systemPrompt }
    ];

    if (context.conversationHistory?.length) {
      messages.push(...context.conversationHistory.slice(-6)); // Last 6 messages for context
    }

    if (contextInfo.length > 0) {
      messages.push({
        role: "system",
        content: `Additional context:\n${contextInfo.join('\n')}`
      });
    }

    messages.push({ role: "user", content: query });

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages,
      max_tokens: 1000
    });

    return response.choices[0].message.content || "I apologize, but I couldn't generate a response. Please try rephrasing your question.";
  } catch (error: any) {
    console.error("Failed to generate maritime response:", error);
    
    // Check if it's a quota error and provide helpful message
    if (error?.code === 'insufficient_quota' || error?.status === 429) {
      return `I'm currently unable to access the AI service due to quota limits. However, I can still help you with:\n\n• Maritime calculations (laytime, distance, weather)\n• Charter party clause analysis\n• Document uploads and basic processing\n• Access to our maritime knowledge base\n\nPlease use the maritime tools in the sidebar or ask specific calculation questions, and I'll provide expert maritime guidance using our built-in systems.`;
    }
    
    return "I'm experiencing temporary connectivity issues with the AI service, but all maritime calculation tools are working perfectly. Please try using the maritime tools in the sidebar for laytime, distance, weather, and CP clause analysis.";
  }
}

export async function summarizeDocument(content: string, documentType?: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a maritime document expert. Summarize this ${documentType || 'document'} focusing on key maritime terms, dates, parties, and important clauses. Keep the summary concise but comprehensive.`
        },
        {
          role: "user",
          content: `Please summarize this document:\n\n${content}`
        }
      ],
      max_tokens: 500
    });

    return response.choices[0].message.content || "Unable to generate summary.";
  } catch (error) {
    console.error("Failed to summarize document:", error);
    return "Failed to generate document summary.";
  }
}

export async function extractDocumentType(filename: string, content: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `Analyze this maritime document and classify it. Respond with JSON in this format:
          {
            "documentType": "charter_party|bill_of_lading|weather_report|voyage_instructions|other"
          }`
        },
        {
          role: "user",
          content: `Filename: ${filename}\n\nContent preview:\n${content.substring(0, 1000)}`
        }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result.documentType || 'other';
  } catch (error) {
    console.error("Failed to extract document type:", error);
    return 'other';
  }
}
