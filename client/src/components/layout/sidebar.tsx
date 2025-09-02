import { useState } from "react";
import { Plus, Upload, Clock, MapPin, FileText, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Conversation } from "@shared/schema";
import MaritimeTools from "@/components/maritime/maritime-tools";
import DocumentUpload from "@/components/document/document-upload";

interface SidebarProps {
  conversations: Conversation[];
  currentConversationId?: string;
}

export default function Sidebar({ conversations, currentConversationId }: SidebarProps) {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createConversationMutation = useMutation({
    mutationFn: async () => {
      return apiRequest<Conversation>("/api/conversations", {
        method: "POST",
        data: { title: "New Conversation" }
      });
    },
    onSuccess: (newConversation) => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      setLocation(`/chat/${newConversation.id}`);
    }
  });

  const handleNewChat = () => {
    createConversationMutation.mutate();
  };

  const [showUploadModal, setShowUploadModal] = useState(false);

  const handleUploadDocument = () => {
    setShowUploadModal(true);
  };

  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return new Date(date).toLocaleDateString();
  };

  return (
    <aside className="w-80 bg-background border-r border-border hidden lg:block">
      <div className="p-6">
        <div className="space-y-6">
          {/* Quick Actions */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Quick Actions</h3>
            <div className="space-y-2">

              <Button
                variant="ghost"
                className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-accent transition-colors justify-start h-auto"
                onClick={handleUploadDocument}
                data-testid="button-upload-document"
              >
                <div className="w-8 h-8 bg-warm-amber/10 rounded-lg flex items-center justify-center">
                  <Upload className="w-4 h-4 text-warm-amber" />
                </div>
                <div className="text-left">
                  <div className="text-sm font-medium text-foreground">Upload Document</div>
                  <div className="text-xs text-muted-foreground">Add to knowledge base</div>
                </div>
              </Button>
            </div>
          </div>

          {/* Recent Conversations */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Recent Conversations</h3>
            <div className="space-y-1">
              {conversations.length === 0 ? (
                <div className="text-sm text-muted-foreground text-center py-4">
                  No conversations yet
                </div>
              ) : (
                conversations.slice(0, 10).map((conversation) => (
                  <Link
                    key={conversation.id}
                    href={`/chat/${conversation.id}`}
                    className={`block p-3 rounded-lg hover:bg-accent cursor-pointer transition-colors ${
                      currentConversationId === conversation.id ? 'bg-maritime-blue/5 border border-maritime-blue/20' : ''
                    }`}
                    data-testid={`conversation-${conversation.id}`}
                  >
                    <div className="text-sm font-medium text-foreground truncate">
                      {conversation.title}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {formatRelativeTime(conversation.updatedAt)}
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Maritime Tools */}
          <MaritimeTools />
        </div>
      </div>

      {/* Document Upload Modal */}
      <DocumentUpload 
        open={showUploadModal}
        onOpenChange={setShowUploadModal}
      />
    </aside>
  );
}
