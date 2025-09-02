import fs from 'fs';
import path from 'path';

export interface ProcessedDocument {
  id: string;
  filename: string;
  originalName: string;
  content: string;
  summary: string;
  documentType: string;
  metadata: {
    pages: number;
    size: number;
    uploadedAt: Date;
    processedAt: Date;
  };
  keywords: string[];
  sections: DocumentSection[];
}

export interface DocumentSection {
  title: string;
  content: string;
  page: number;
  type: 'header' | 'paragraph' | 'clause' | 'table' | 'footer';
}

export interface KnowledgeBaseEntry {
  id: string;
  documentId: string;
  title: string;
  content: string;
  category: 'laytime' | 'weather' | 'distance' | 'cp_clause' | 'voyage_guidance' | 'general';
  relevanceScore: number;
  tags: string[];
}

export class PDFProcessor {
  private uploadPath: string;

  constructor(uploadPath = './uploads') {
    this.uploadPath = uploadPath;
    this.ensureUploadDirectory();
  }

  private ensureUploadDirectory() {
    if (!fs.existsSync(this.uploadPath)) {
      fs.mkdirSync(this.uploadPath, { recursive: true });
    }
  }

  async processPDFBuffer(buffer: Buffer, filename: string): Promise<ProcessedDocument> {
    try {
      // Dynamic import for pdf-parse
      const pdfParse = (await import('pdf-parse')).default;
      
      // Parse PDF content
      const pdfData = await pdfParse(buffer);
      const content = pdfData.text;
      
      // Extract metadata
      const metadata = {
        pages: pdfData.numpages,
        size: buffer.length,
        uploadedAt: new Date(),
        processedAt: new Date()
      };

      // Generate document sections
      const sections = this.extractSections(content);
      
      // Extract keywords
      const keywords = this.extractKeywords(content);
      
      // Determine document type
      const documentType = this.classifyDocument(content, filename);
      
      // Generate summary (this will use OpenAI if available)
      const summary = await this.generateSummary(content, documentType);

      const processedDoc: ProcessedDocument = {
        id: this.generateDocumentId(),
        filename: `${Date.now()}_${filename}`,
        originalName: filename,
        content,
        summary,
        documentType,
        metadata,
        keywords,
        sections
      };

      // Save processed document
      await this.saveProcessedDocument(processedDoc);
      
      return processedDoc;

    } catch (error) {
      console.error('PDF processing failed:', error);
      throw new Error(`Failed to process PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private extractSections(content: string): DocumentSection[] {
    const sections: DocumentSection[] = [];
    const lines = content.split('\n').filter(line => line.trim());
    
    let currentSection: DocumentSection | null = null;
    let pageNumber = 1;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Skip empty lines
      if (!line) continue;

      // Detect headers (lines that are all caps or start with numbers/bullets)
      const isHeader = this.isHeaderLine(line);
      const isClause = this.isClauseLine(line);
      
      if (isHeader || isClause) {
        // Save previous section
        if (currentSection) {
          sections.push(currentSection);
        }
        
        // Start new section
        currentSection = {
          title: line,
          content: '',
          page: pageNumber,
          type: isClause ? 'clause' : 'header'
        };
      } else if (currentSection) {
        // Add content to current section
        currentSection.content += (currentSection.content ? '\n' : '') + line;
      } else {
        // Create a general paragraph section
        sections.push({
          title: 'General Content',
          content: line,
          page: pageNumber,
          type: 'paragraph'
        });
      }

      // Estimate page breaks (rough approximation)
      if (i > 0 && i % 50 === 0) {
        pageNumber++;
      }
    }

    // Add the last section
    if (currentSection) {
      sections.push(currentSection);
    }

    return sections;
  }

  private isHeaderLine(line: string): boolean {
    // Check if line is likely a header
    return (
      line.length > 3 && 
      line.length < 80 && 
      (
        line === line.toUpperCase() ||
        /^\d+\.?\s/.test(line) ||
        /^[A-Z][A-Z\s]{5,}$/.test(line)
      )
    );
  }

  private isClauseLine(line: string): boolean {
    // Check if line is likely a clause (common in maritime contracts)
    return /^(\d+\.|\([a-z]\)|\([0-9]+\))\s/.test(line) ||
           /^(CLAUSE|ARTICLE|SECTION)\s+\d+/i.test(line);
  }

  private extractKeywords(content: string): string[] {
    // Maritime-specific keywords
    const maritimeTerms = [
      'laytime', 'demurrage', 'despatch', 'charter party', 'bill of lading',
      'vessel', 'cargo', 'port', 'loading', 'discharge', 'weather',
      'routing', 'voyage', 'freight', 'bunkers', 'ballast', 'draught',
      'tonnage', 'berth', 'anchorage', 'pilot', 'tug', 'mooring'
    ];

    const words = content.toLowerCase().split(/\W+/);
    const keywords = new Set<string>();

    // Add maritime terms found in document
    maritimeTerms.forEach(term => {
      if (content.toLowerCase().includes(term)) {
        keywords.add(term);
      }
    });

    // Add frequently occurring words (simple frequency analysis)
    const wordFreq: { [key: string]: number } = {};
    words.forEach(word => {
      if (word.length > 3) {
        wordFreq[word] = (wordFreq[word] || 0) + 1;
      }
    });

    // Get top 10 most frequent words
    Object.entries(wordFreq)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .forEach(([word]) => keywords.add(word));

    return Array.from(keywords).slice(0, 20); // Limit to 20 keywords
  }

  private classifyDocument(content: string, filename: string): string {
    const contentLower = content.toLowerCase();
    const filenameLower = filename.toLowerCase();

    if (contentLower.includes('charter party') || filenameLower.includes('charter')) {
      return 'charter_party';
    } else if (contentLower.includes('bill of lading') || filenameLower.includes('bl')) {
      return 'bill_of_lading';
    } else if (contentLower.includes('weather') || filenameLower.includes('weather')) {
      return 'weather_report';
    } else if (contentLower.includes('voyage') || filenameLower.includes('voyage')) {
      return 'voyage_instructions';
    } else if (contentLower.includes('laytime') || contentLower.includes('demurrage')) {
      return 'laytime_calculation';
    } else {
      return 'general_maritime';
    }
  }

  private async generateSummary(content: string, documentType: string): Promise<string> {
    // This will use the existing OpenAI service if available
    try {
      const { summarizeDocument } = await import('./openai.js');
      return await summarizeDocument(content, documentType);
    } catch (error) {
      console.log('OpenAI summarization not available, using fallback');
      
      // Fallback: Simple extractive summary
      const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 20);
      const summary = sentences.slice(0, 3).join('. ').trim();
      return summary ? summary + '.' : 'Document processed successfully.';
    }
  }

  private generateDocumentId(): string {
    return `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async saveProcessedDocument(doc: ProcessedDocument): Promise<void> {
    const docPath = path.join(this.uploadPath, `${doc.id}.json`);
    await fs.promises.writeFile(docPath, JSON.stringify(doc, null, 2));
  }

  async getProcessedDocument(id: string): Promise<ProcessedDocument | null> {
    try {
      const docPath = path.join(this.uploadPath, `${id}.json`);
      const content = await fs.promises.readFile(docPath, 'utf8');
      return JSON.parse(content);
    } catch (error) {
      return null;
    }
  }

  async listProcessedDocuments(): Promise<ProcessedDocument[]> {
    try {
      const files = await fs.promises.readdir(this.uploadPath);
      const jsonFiles = files.filter(f => f.endsWith('.json') && f !== 'knowledge_base.json');
      
      const documents: ProcessedDocument[] = [];
      
      for (const file of jsonFiles) {
        try {
          const content = await fs.promises.readFile(
            path.join(this.uploadPath, file), 
            'utf8'
          );
          const doc = JSON.parse(content);
          
          // Convert date strings back to Date objects
          if (doc.metadata) {
            if (doc.metadata.uploadedAt) {
              doc.metadata.uploadedAt = new Date(doc.metadata.uploadedAt);
            }
            if (doc.metadata.processedAt) {
              doc.metadata.processedAt = new Date(doc.metadata.processedAt);
            }
          }
          
          documents.push(doc);
        } catch (error) {
          console.error(`Failed to load document ${file}:`, error);
        }
      }
      
      return documents.sort((a, b) => {
        const aTime = a.metadata?.uploadedAt instanceof Date ? a.metadata.uploadedAt.getTime() : 0;
        const bTime = b.metadata?.uploadedAt instanceof Date ? b.metadata.uploadedAt.getTime() : 0;
        return bTime - aTime;
      });
    } catch (error) {
      console.error('Failed to list documents:', error);
      return [];
    }
  }

  async createKnowledgeBaseEntries(doc: ProcessedDocument): Promise<KnowledgeBaseEntry[]> {
    const entries: KnowledgeBaseEntry[] = [];

    // Create entries from document sections
    doc.sections.forEach((section, index) => {
      if (section.content && section.content.length > 50) {
        const category = this.categorizeSection(section.content);
        const entry: KnowledgeBaseEntry = {
          id: `kb_${doc.id}_${index}`,
          documentId: doc.id,
          title: section.title || `Section ${index + 1}`,
          content: section.content,
          category,
          relevanceScore: this.calculateRelevanceScore(section.content, category),
          tags: this.extractSectionTags(section.content)
        };
        entries.push(entry);
      }
    });

    return entries;
  }

  private categorizeSection(content: string): KnowledgeBaseEntry['category'] {
    const contentLower = content.toLowerCase();
    
    if (contentLower.includes('laytime') || contentLower.includes('demurrage')) {
      return 'laytime';
    } else if (contentLower.includes('weather') || contentLower.includes('wind')) {
      return 'weather';
    } else if (contentLower.includes('distance') || contentLower.includes('route')) {
      return 'distance';
    } else if (contentLower.includes('charter') || contentLower.includes('clause')) {
      return 'cp_clause';
    } else if (contentLower.includes('voyage') || contentLower.includes('port')) {
      return 'voyage_guidance';
    } else {
      return 'general';
    }
  }

  private calculateRelevanceScore(content: string, category: string): number {
    // Simple relevance scoring based on content length and category-specific keywords
    const baseScore = Math.min(content.length / 1000, 1); // Length factor
    
    const categoryKeywords = {
      laytime: ['laytime', 'demurrage', 'despatch', 'loading', 'discharge'],
      weather: ['weather', 'wind', 'storm', 'forecast', 'routing'],
      distance: ['distance', 'nautical', 'route', 'passage', 'voyage'],
      cp_clause: ['clause', 'charter', 'party', 'terms', 'conditions'],
      voyage_guidance: ['port', 'berth', 'pilot', 'tug', 'mooring'],
      general: []
    };

    const keywords = categoryKeywords[category] || [];
    const keywordMatches = keywords.filter(kw => 
      content.toLowerCase().includes(kw)
    ).length;

    const keywordScore = keywords.length > 0 ? keywordMatches / keywords.length : 0.5;
    
    return Math.round((baseScore * 0.6 + keywordScore * 0.4) * 100) / 100;
  }

  private extractSectionTags(content: string): string[] {
    const commonTags = [
      'maritime', 'shipping', 'vessel', 'cargo', 'port', 'navigation',
      'contract', 'legal', 'operations', 'logistics', 'commercial'
    ];
    
    return commonTags.filter(tag => 
      content.toLowerCase().includes(tag)
    ).slice(0, 5);
  }

  async deleteDocument(id: string): Promise<boolean> {
    try {
      const docPath = path.join(this.uploadPath, `${id}.json`);
      await fs.promises.unlink(docPath);
      return true;
    } catch (error) {
      console.error(`Failed to delete document ${id}:`, error);
      return false;
    }
  }

  async searchDocuments(query: string): Promise<ProcessedDocument[]> {
    const allDocs = await this.listProcessedDocuments();
    const queryLower = query.toLowerCase();
    
    return allDocs.filter(doc => 
      doc.content.toLowerCase().includes(queryLower) ||
      doc.originalName.toLowerCase().includes(queryLower) ||
      doc.keywords.some(keyword => keyword.includes(queryLower)) ||
      doc.summary.toLowerCase().includes(queryLower)
    );
  }
}

// Export singleton instance
export const pdfProcessor = new PDFProcessor();
