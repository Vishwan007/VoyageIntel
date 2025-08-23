import { type Conversation, type InsertConversation, type Message, type InsertMessage, type Document, type InsertDocument, type MaritimeKnowledge, type InsertMaritimeKnowledge } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Conversations
  getConversations(): Promise<Conversation[]>;
  getConversation(id: string): Promise<Conversation | undefined>;
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  updateConversation(id: string, updates: Partial<Conversation>): Promise<Conversation | undefined>;
  deleteConversation(id: string): Promise<boolean>;

  // Messages
  getMessagesByConversation(conversationId: string): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;

  // Documents
  getDocuments(): Promise<Document[]>;
  getDocument(id: string): Promise<Document | undefined>;
  createDocument(document: InsertDocument): Promise<Document>;
  updateDocument(id: string, updates: Partial<Document>): Promise<Document | undefined>;
  deleteDocument(id: string): Promise<boolean>;
  searchDocuments(query: string): Promise<Document[]>;

  // Maritime Knowledge
  getMaritimeKnowledge(category?: string): Promise<MaritimeKnowledge[]>;
  createMaritimeKnowledge(knowledge: InsertMaritimeKnowledge): Promise<MaritimeKnowledge>;
  searchMaritimeKnowledge(query: string): Promise<MaritimeKnowledge[]>;
}

export class MemStorage implements IStorage {
  private conversations: Map<string, Conversation>;
  private messages: Map<string, Message>;
  private documents: Map<string, Document>;
  private maritimeKnowledge: Map<string, MaritimeKnowledge>;

  constructor() {
    this.conversations = new Map();
    this.messages = new Map();
    this.documents = new Map();
    this.maritimeKnowledge = new Map();
    this.initializeMaritimeKnowledge();
  }

  private initializeMaritimeKnowledge() {
    const knowledgeItems: InsertMaritimeKnowledge[] = [
      {
        category: "laytime",
        title: "Laytime Calculation Basics",
        content: "Laytime is the time allowed for loading and discharging cargo. It begins when the vessel tenders Notice of Readiness (NOR) and ends when cargo operations are completed.",
        keywords: ["laytime", "loading", "discharging", "NOR", "notice of readiness"]
      },
      {
        category: "cp_clause",
        title: "Weather Working Days",
        content: "Weather Working Days (WWD) exclude time when weather conditions prevent cargo operations. This clause protects charterers from delays due to adverse weather.",
        keywords: ["weather working days", "WWD", "weather", "cargo operations"]
      },
      {
        category: "cp_clause",
        title: "Demurrage and Dispatch",
        content: "Demurrage is compensation paid when laytime is exceeded. Dispatch is a reward for completing operations ahead of schedule.",
        keywords: ["demurrage", "dispatch", "laytime", "compensation"]
      },
      {
        category: "distance",
        title: "Great Circle Distance",
        content: "Great circle distance is the shortest distance between two points on a sphere, commonly used for voyage planning and fuel calculations.",
        keywords: ["great circle", "distance", "voyage planning", "fuel"]
      }
    ];

    knowledgeItems.forEach(item => {
      const knowledge: MaritimeKnowledge = {
        ...item,
        id: randomUUID(),
        createdAt: new Date(),
        keywords: item.keywords || null
      };
      this.maritimeKnowledge.set(knowledge.id, knowledge);
    });
  }

  // Conversations
  async getConversations(): Promise<Conversation[]> {
    return Array.from(this.conversations.values()).sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  async getConversation(id: string): Promise<Conversation | undefined> {
    return this.conversations.get(id);
  }

  async createConversation(insertConversation: InsertConversation): Promise<Conversation> {
    const id = randomUUID();
    const now = new Date();
    const conversation: Conversation = { 
      ...insertConversation, 
      id, 
      createdAt: now,
      updatedAt: now
    };
    this.conversations.set(id, conversation);
    return conversation;
  }

  async updateConversation(id: string, updates: Partial<Conversation>): Promise<Conversation | undefined> {
    const conversation = this.conversations.get(id);
    if (!conversation) return undefined;
    
    const updated = { ...conversation, ...updates, updatedAt: new Date() };
    this.conversations.set(id, updated);
    return updated;
  }

  async deleteConversation(id: string): Promise<boolean> {
    // Delete associated messages
    const messages = Array.from(this.messages.values()).filter(m => m.conversationId === id);
    messages.forEach(m => this.messages.delete(m.id));
    
    return this.conversations.delete(id);
  }

  // Messages
  async getMessagesByConversation(conversationId: string): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(m => m.conversationId === conversationId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = randomUUID();
    const message: Message = { 
      ...insertMessage, 
      id, 
      createdAt: new Date(),
      metadata: insertMessage.metadata || null
    };
    this.messages.set(id, message);
    
    // Update conversation timestamp
    await this.updateConversation(message.conversationId, { updatedAt: new Date() });
    
    return message;
  }

  // Documents
  async getDocuments(): Promise<Document[]> {
    return Array.from(this.documents.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getDocument(id: string): Promise<Document | undefined> {
    return this.documents.get(id);
  }

  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const id = randomUUID();
    const document: Document = { 
      ...insertDocument, 
      id, 
      processed: false,
      createdAt: new Date(),
      content: insertDocument.content || null,
      summary: insertDocument.summary || null,
      documentType: insertDocument.documentType || null
    };
    this.documents.set(id, document);
    return document;
  }

  async updateDocument(id: string, updates: Partial<Document>): Promise<Document | undefined> {
    const document = this.documents.get(id);
    if (!document) return undefined;
    
    const updated = { ...document, ...updates };
    this.documents.set(id, updated);
    return updated;
  }

  async deleteDocument(id: string): Promise<boolean> {
    return this.documents.delete(id);
  }

  async searchDocuments(query: string): Promise<Document[]> {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.documents.values()).filter(doc => 
      doc.originalName.toLowerCase().includes(lowerQuery) ||
      doc.content?.toLowerCase().includes(lowerQuery) ||
      doc.summary?.toLowerCase().includes(lowerQuery)
    );
  }

  // Maritime Knowledge
  async getMaritimeKnowledge(category?: string): Promise<MaritimeKnowledge[]> {
    const knowledge = Array.from(this.maritimeKnowledge.values());
    if (category) {
      return knowledge.filter(k => k.category === category);
    }
    return knowledge;
  }

  async createMaritimeKnowledge(insertKnowledge: InsertMaritimeKnowledge): Promise<MaritimeKnowledge> {
    const id = randomUUID();
    const knowledge: MaritimeKnowledge = { 
      ...insertKnowledge, 
      id, 
      createdAt: new Date(),
      keywords: insertKnowledge.keywords || null
    };
    this.maritimeKnowledge.set(id, knowledge);
    return knowledge;
  }

  async searchMaritimeKnowledge(query: string): Promise<MaritimeKnowledge[]> {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.maritimeKnowledge.values()).filter(knowledge => 
      knowledge.title.toLowerCase().includes(lowerQuery) ||
      knowledge.content.toLowerCase().includes(lowerQuery) ||
      knowledge.keywords?.some(keyword => keyword.toLowerCase().includes(lowerQuery))
    );
  }
}

export const storage = new MemStorage();
