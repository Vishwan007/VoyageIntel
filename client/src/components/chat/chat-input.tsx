import { useState } from "react";
import { Send, Paperclip, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ChatInputProps {
  conversationId: string;
  onUploadClick: () => void;
}

export default function ChatInput({ conversationId, onUploadClick }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await apiRequest("POST", `/api/conversations/${conversationId}/messages`, {
        role: "user",
        content
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations", conversationId, "messages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      setMessage("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !sendMessageMutation.isPending) {
      sendMessageMutation.mutate(message.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="bg-white border-t border-gray-200 p-6">
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="flex items-end space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about laytime, weather, distances, CP clauses, or upload documents for analysis..."
                className="min-h-[80px] max-h-[200px] resize-none border-gray-300 focus:ring-2 focus:ring-maritime-blue focus:border-transparent"
                disabled={sendMessageMutation.isPending}
                data-testid="input-message"
              />
              <div className="absolute bottom-3 right-3 flex items-center space-x-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="p-1.5 h-auto text-gray-400 hover:text-gray-600"
                  onClick={onUploadClick}
                  data-testid="button-attach-document"
                >
                  <Paperclip className="w-4 h-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="p-1.5 h-auto text-gray-400 hover:text-gray-600"
                  data-testid="button-voice-input"
                >
                  <Mic className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center space-x-4 text-xs text-gray-500">
                <span>Shift + Enter for new line</span>
                <span>•</span>
                <span>Supports file upload up to 10MB</span>
              </div>
              <div className="text-xs text-gray-500">
                <span data-testid="character-count">{message.length}</span>/2000 characters
              </div>
            </div>
          </div>
          <Button
            type="submit"
            disabled={!message.trim() || sendMessageMutation.isPending}
            className="px-6 py-3 bg-maritime-blue text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-maritime-blue focus:ring-offset-2 transition-colors flex items-center space-x-2"
            data-testid="button-send-message"
          >
            <span>{sendMessageMutation.isPending ? "Sending..." : "Send"}</span>
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
