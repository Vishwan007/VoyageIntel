import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  FileText, 
  Upload, 
  Search, 
  Filter, 
  Download, 
  Trash2, 
  Eye,
  Clock,
  Tag,
  BarChart3,
  FileUp,
  BookOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import DocumentUpload from "@/components/document/document-upload";

interface ProcessedDocument {
  id: string;
  filename: string;
  originalName: string;
  content: string;
  summary: string;
  documentType: string;
  metadata: {
    pages: number;
    size: number;
    uploadedAt: string;
    processedAt: string;
  };
  keywords: string[];
  sections: any[];
}

interface KnowledgeBaseEntry {
  id: string;
  documentId: string;
  title: string;
  content: string;
  category: 'laytime' | 'weather' | 'distance' | 'cp_clause' | 'voyage_guidance' | 'general';
  relevanceScore: number;
  tags: string[];
}

export default function KnowledgeBase() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [activeTab, setActiveTab] = useState("documents");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch PDF documents
  const { data: documents, isLoading: documentsLoading } = useQuery<ProcessedDocument[]>({
    queryKey: ["/api/pdf-documents"],
  });

  // Fetch knowledge base entries
  const { data: knowledgeEntries, isLoading: entriesLoading } = useQuery<KnowledgeBaseEntry[]>({
    queryKey: ["/api/knowledge-base"],
  });

  // Search functionality
  const { data: searchResults, refetch: searchDocuments } = useQuery<ProcessedDocument[]>({
    queryKey: ["/api/pdf-documents/search", searchQuery],
    enabled: false,
  });

  const { data: searchEntries, refetch: searchKnowledge } = useQuery<KnowledgeBaseEntry[]>({
    queryKey: ["/api/knowledge-base/search", searchQuery, selectedCategory],
    enabled: false,
  });

  // Delete document mutation
  const deleteDocumentMutation = useMutation({
    mutationFn: async (documentId: string) => {
      const response = await fetch(`/api/pdf-documents/${documentId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete document');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Document Deleted",
        description: "The document has been removed from the knowledge base.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/pdf-documents"] });
      queryClient.invalidateQueries({ queryKey: ["/api/knowledge-base"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete document. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleSearch = () => {
    if (activeTab === "documents") {
      searchDocuments();
    } else {
      searchKnowledge();
    }
  };

  const formatFileSize = (bytes: number) => {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      laytime: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
      weather: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
      distance: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300',
      cp_clause: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300',
      voyage_guidance: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-300',
      general: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300',
    };
    return colors[category] || colors.general;
  };

  const getDocumentTypeIcon = (documentType: string) => {
    switch (documentType) {
      case 'charter_party': return <FileText className="w-4 h-4 text-blue-600" />;
      case 'bill_of_lading': return <FileText className="w-4 h-4 text-green-600" />;
      case 'weather_report': return <FileText className="w-4 h-4 text-yellow-600" />;
      case 'voyage_instructions': return <FileText className="w-4 h-4 text-purple-600" />;
      default: return <FileText className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const documentsToDisplay = searchQuery && searchResults ? searchResults : (documents || []);
  const entriesToDisplay = searchQuery && searchEntries ? searchEntries : (knowledgeEntries || []);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Knowledge Base</h1>
              <p className="text-muted-foreground">Manage your maritime document library and knowledge base</p>
            </div>
            <Button 
              onClick={() => setShowUploadModal(true)}
              className="bg-maritime-blue hover:bg-blue-700"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Document
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <FileText className="w-5 h-5 text-blue-600 mr-2" />
                <span className="text-2xl font-bold">{documents?.length || 0}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Knowledge Entries</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <BookOpen className="w-5 h-5 text-green-600 mr-2" />
                <span className="text-2xl font-bold">{knowledgeEntries?.length || 0}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Storage Used</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <BarChart3 className="w-5 h-5 text-purple-600 mr-2" />
                <span className="text-2xl font-bold">
                  {formatFileSize(documents?.reduce((acc, doc) => acc + doc.metadata.size, 0) || 0)}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Last Updated</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Clock className="w-5 h-5 text-orange-600 mr-2" />
                <span className="text-sm font-semibold">
                  {documents?.[0]?.metadata.processedAt ? 
                    new Date(documents[0].metadata.processedAt).toLocaleDateString() : 
                    'N/A'
                  }
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search documents or knowledge base..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-40">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Categories</SelectItem>
                    <SelectItem value="laytime">Laytime</SelectItem>
                    <SelectItem value="weather">Weather</SelectItem>
                    <SelectItem value="distance">Distance</SelectItem>
                    <SelectItem value="cp_clause">CP Clauses</SelectItem>
                    <SelectItem value="voyage_guidance">Voyage Guidance</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={handleSearch}>
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="documents">Documents ({documents?.length || 0})</TabsTrigger>
            <TabsTrigger value="knowledge">Knowledge Base ({knowledgeEntries?.length || 0})</TabsTrigger>
          </TabsList>

          <TabsContent value="documents" className="mt-6">
            {documentsLoading ? (
              <div className="text-center py-8">Loading documents...</div>
            ) : documentsToDisplay.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <FileUp className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No documents found</h3>
                  <p className="text-muted-foreground mb-4">
                    Upload your first maritime document to start building your knowledge base.
                  </p>
                  <Button onClick={() => setShowUploadModal(true)}>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Document
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {documentsToDisplay.map((doc) => (
                  <Card key={doc.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          {getDocumentTypeIcon(doc.documentType)}
                          <div className="flex-1">
                            <CardTitle className="text-lg font-medium truncate">
                              {doc.originalName}
                            </CardTitle>
                            <CardDescription className="mt-1">
                              {doc.documentType.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())} • {doc.metadata.pages} pages
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex space-x-1">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => deleteDocumentMutation.mutate(doc.id)}
                            disabled={deleteDocumentMutation.isPending}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {doc.summary}
                        </p>
                        
                        {/* Keywords */}
                        <div className="flex flex-wrap gap-1">
                          {doc.keywords.slice(0, 4).map((keyword, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {keyword}
                            </Badge>
                          ))}
                          {doc.keywords.length > 4 && (
                            <Badge variant="outline" className="text-xs">
                              +{doc.keywords.length - 4} more
                            </Badge>
                          )}
                        </div>

                        {/* Metadata */}
                        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border">
                          <span>Uploaded: {new Date(doc.metadata.uploadedAt).toLocaleDateString()}</span>
                          <span>{formatFileSize(doc.metadata.size)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="knowledge" className="mt-6">
            {entriesLoading ? (
              <div className="text-center py-8">Loading knowledge base...</div>
            ) : entriesToDisplay.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No knowledge entries found</h3>
                  <p className="text-muted-foreground mb-4">
                    Upload documents to automatically generate knowledge base entries.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {entriesToDisplay.map((entry) => (
                  <Card key={entry.id} className="hover:shadow-sm transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-lg font-medium text-foreground mb-2">
                            {entry.title}
                          </h3>
                          <div className="flex items-center space-x-3">
                            <Badge className={getCategoryColor(entry.category)}>
                              {entry.category.replace('_', ' ')}
                            </Badge>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <BarChart3 className="w-3 h-3 mr-1" />
                              {Math.round(entry.relevanceScore * 100)}% relevance
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                        {entry.content}
                      </p>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1">
                        {entry.tags.map((tag, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            <Tag className="w-3 h-3 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Document Upload Modal */}
        <DocumentUpload 
          open={showUploadModal}
          onOpenChange={setShowUploadModal}
        />
      </div>
    </div>
  );
}
