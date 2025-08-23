import { Plus, Upload, Clock, MapPin, FileText, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Conversation } from "@shared/schema";
import MaritimeTools from "@/components/maritime/maritime-tools";

interface SidebarProps {
  conversations: Conversation[];
  currentConversationId?: string;
}

export default function Sidebar({ conversations, currentConversationId }: SidebarProps) {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const createConversationMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/conversations", {
        title: "New Conversation"
      });
      return response.json();
    },
    onSuccess: (newConversation) => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      setLocation(`/chat/${newConversation.id}`);
    }
  });

  const handleNewChat = () => {
    createConversationMutation.mutate();
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
    <aside className="w-80 bg-white border-r border-gray-200 hidden lg:block">
      <div className="p-6">
        <div className="space-y-6">
          {/* Quick Actions */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <Button
                variant="ghost"
                className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors justify-start h-auto"
                onClick={handleNewChat}
                disabled={createConversationMutation.isPending}
                data-testid="button-new-chat"
              >
                <div className="w-8 h-8 bg-ocean-teal/10 rounded-lg flex items-center justify-center">
                  <Plus className="w-4 h-4 text-ocean-teal" />
                </div>
                <div className="text-left">
                  <div className="text-sm font-medium text-gray-900">New Chat</div>
                  <div className="text-xs text-gray-500">Start a conversation</div>
                </div>
              </Button>
              <Button
                variant="ghost"
                className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors justify-start h-auto"
                data-testid="button-upload-document"
              >
                <div className="w-8 h-8 bg-warm-amber/10 rounded-lg flex items-center justify-center">
                  <Upload className="w-4 h-4 text-warm-amber" />
                </div>
                <div className="text-left">
                  <div className="text-sm font-medium text-gray-900">Upload Document</div>
                  <div className="text-xs text-gray-500">Add to knowledge base</div>
                </div>
              </Button>
            </div>
          </div>

          {/* Recent Conversations */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Recent Conversations</h3>
            <div className="space-y-1">
              {conversations.length === 0 ? (
                <div className="text-sm text-gray-500 text-center py-4">
                  No conversations yet
                </div>
              ) : (
                conversations.slice(0, 10).map((conversation) => (
                  <Link
                    key={conversation.id}
                    href={`/chat/${conversation.id}`}
                    className={`block p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors ${
                      currentConversationId === conversation.id ? 'bg-maritime-blue/5 border border-maritime-blue/20' : ''
                    }`}
                    data-testid={`conversation-${conversation.id}`}
                  >
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {conversation.title}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
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
    </aside>
  );
}
