import { useState, useCallback } from "react";
import { X, Upload, FileText, File } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface DocumentUploadProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function DocumentUpload({ open, onOpenChange }: DocumentUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Document uploaded successfully and is being processed.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      setSelectedFile(null);
      onOpenChange(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to upload document. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      uploadMutation.mutate(selectedFile);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const isValidFileType = (file: File) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    return allowedTypes.includes(file.type);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Upload Maritime Documents</DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              data-testid="button-close-upload"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="p-6">
          {!selectedFile ? (
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive 
                  ? 'border-maritime-blue bg-maritime-blue/5' 
                  : 'border-gray-300 hover:border-maritime-blue'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              data-testid="upload-dropzone"
            >
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <div className="text-lg font-medium text-gray-900 mb-2">
                Drag and drop your files here
              </div>
              <div className="text-sm text-gray-600 mb-4">
                or click to browse from your computer
              </div>
              <Button 
                onClick={() => document.getElementById('file-input')?.click()}
                data-testid="button-browse-files"
              >
                Browse Files
              </Button>
              <input
                id="file-input"
                type="file"
                className="hidden"
                accept=".pdf,.doc,.docx,.txt"
                onChange={handleFileSelect}
              />
            </div>
          ) : (
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  {selectedFile.type === 'application/pdf' ? (
                    <FileText className="w-5 h-5 text-red-500" />
                  ) : (
                    <File className="w-5 h-5 text-blue-500" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">
                    {selectedFile.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatFileSize(selectedFile.size)}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedFile(null)}
                  data-testid="button-remove-file"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              {!isValidFileType(selectedFile) && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="text-sm text-red-700">
                    Unsupported file type. Please upload PDF, DOC, DOCX, or TXT files.
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Supported Document Types</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center space-x-2 text-gray-600">
                <FileText className="w-4 h-4 text-red-500" />
                <span>Charter Parties (.pdf)</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <FileText className="w-4 h-4 text-blue-500" />
                <span>Bills of Lading (.pdf)</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <File className="w-4 h-4 text-green-500" />
                <span>Weather Reports (.pdf, .doc)</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <File className="w-4 h-4 text-purple-500" />
                <span>Voyage Instructions (.pdf, .doc)</span>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 rounded-b-xl">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">Maximum file size: 10MB</div>
            <div className="flex space-x-3">
              <Button 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                data-testid="button-cancel-upload"
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpload}
                disabled={!selectedFile || !isValidFileType(selectedFile) || uploadMutation.isPending}
                data-testid="button-upload-analyze"
              >
                {uploadMutation.isPending ? "Uploading..." : "Upload & Analyze"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
