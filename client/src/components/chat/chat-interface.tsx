import { useState } from "react";
import { Mic, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import MessageList from "./message-list";
import ChatInput from "./chat-input";
import DocumentUpload from "@/components/document/document-upload";
import type { Conversation, Message } from "@shared/schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface ChatInterfaceProps {
  conversationId?: string;
  conversation?: Conversation;
  messages: Message[];
}

export default function ChatInterface({ conversationId, conversation, messages }: ChatInterfaceProps) {
  const [showDocumentUpload, setShowDocumentUpload] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleVoiceMode = () => {
    toast({
      title: "Voice Mode",
      description: "Voice input is available in the chat input area. Click the microphone icon to start speaking.",
    });
  };

  const handleChatOptions = () => {
    toast({
      title: "Chat Options",
      description: "Additional chat settings and options coming soon!",
    });
  };

  const handleStartChat = () => {
    toast({
      title: "Getting Started",
      description: "Click 'New Chat' in the sidebar or ask any maritime question to begin!",
    });
  };

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!conversationId) return null;
      
      return await apiRequest(`/api/conversations/${conversationId}/messages`, {
        method: "POST",
        data: {
          role: "user",
          content
        }
      });
    },
    onSuccess: () => {
      if (conversationId) {
        queryClient.invalidateQueries({ queryKey: ["/api/conversations", conversationId, "messages"] });
        queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleDocumentProcessed = (documentId: string, documentName: string) => {
    // Send a message to the chat about the uploaded document
    if (conversationId) {
      const message = `I've uploaded a document: ${documentName}. Please analyze it and help me understand its contents.`;
      sendMessageMutation.mutate(message);
      
      toast({
        title: "Document Ready",
        description: "Your document has been processed. You can now ask questions about it in the chat.",
      });
    }
  };

  if (!conversationId) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-maritime-blue/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-8 bg-maritime-blue rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">AI</span>
            </div>
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">Welcome to MaritimeAI</h2>
          <p className="text-muted-foreground mb-4">Start a new conversation to begin chatting with your maritime assistant.</p>
          <Button onClick={handleStartChat} data-testid="button-start-chat">Start New Chat</Button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Chat Header */}
      <div className="bg-background border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <h2 className="text-lg font-semibold text-foreground">Maritime AI Assistant</h2>
            <span className="text-sm text-muted-foreground">Ready to help with maritime queries</span>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              className="text-muted-foreground hover:text-maritime-blue border-border hover:border-maritime-blue"
              onClick={handleVoiceMode}
              data-testid="button-voice-mode"
            >
              <Mic className="w-4 h-4 mr-2" />
              Voice Mode
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleChatOptions}
              data-testid="button-chat-options"
            >
              <MoreHorizontal className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <MessageList messages={messages} />

      {/* Chat Input */}
      <ChatInput 
        conversationId={conversationId}
        onUploadClick={() => setShowDocumentUpload(true)}
      />

      {/* Document Upload Modal */}
      <DocumentUpload 
        open={showDocumentUpload}
        onOpenChange={setShowDocumentUpload}
        onDocumentProcessed={handleDocumentProcessed}
      />
    </>
  );
}
