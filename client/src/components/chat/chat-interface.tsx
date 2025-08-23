import { useState } from "react";
import { Mic, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import MessageList from "./message-list";
import ChatInput from "./chat-input";
import DocumentUpload from "@/components/document/document-upload";
import type { Conversation, Message } from "@shared/schema";

interface ChatInterfaceProps {
  conversationId?: string;
  conversation?: Conversation;
  messages: Message[];
}

export default function ChatInterface({ conversationId, conversation, messages }: ChatInterfaceProps) {
  const [showDocumentUpload, setShowDocumentUpload] = useState(false);

  if (!conversationId) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-maritime-blue/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-8 bg-maritime-blue rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">AI</span>
            </div>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Welcome to MaritimeAI</h2>
          <p className="text-gray-600 mb-4">Start a new conversation to begin chatting with your maritime assistant.</p>
          <Button data-testid="button-start-chat">Start New Chat</Button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Chat Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <h2 className="text-lg font-semibold text-gray-900">Maritime AI Assistant</h2>
            <span className="text-sm text-gray-500">Ready to help with maritime queries</span>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              className="text-gray-600 hover:text-maritime-blue border-gray-300 hover:border-maritime-blue"
              data-testid="button-voice-mode"
            >
              <Mic className="w-4 h-4 mr-2" />
              Voice Mode
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
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
      />
    </>
  );
}
