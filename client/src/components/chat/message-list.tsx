import { useEffect, useRef } from "react";
import { Zap, User, Download, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Message } from "@shared/schema";

interface MessageListProps {
  messages: Message[];
}

export default function MessageList({ messages }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto p-6">
        <WelcomeMessage />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6" data-testid="messages-container">
      <WelcomeMessage />
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}

function WelcomeMessage() {
  return (
    <div className="flex items-start space-x-3">
      <div className="w-8 h-8 bg-maritime-blue rounded-full flex items-center justify-center flex-shrink-0">
        <Zap className="w-4 h-4 text-white" />
      </div>
      <div className="bg-white rounded-lg border border-gray-200 p-4 max-w-2xl">
        <div className="text-sm font-medium text-gray-900 mb-2">Welcome to MaritimeAI!</div>
        <div className="text-sm text-gray-700 mb-3">
          I'm your maritime assistant, ready to help with:
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          <div className="flex items-center space-x-2 text-gray-600">
            <div className="w-1.5 h-1.5 bg-ocean-teal rounded-full"></div>
            <span>Laytime calculations</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-600">
            <div className="w-1.5 h-1.5 bg-ocean-teal rounded-full"></div>
            <span>Weather information</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-600">
            <div className="w-1.5 h-1.5 bg-ocean-teal rounded-full"></div>
            <span>Distance calculations</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-600">
            <div className="w-1.5 h-1.5 bg-ocean-teal rounded-full"></div>
            <span>CP clause interpretation</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-600">
            <div className="w-1.5 h-1.5 bg-ocean-teal rounded-full"></div>
            <span>Document analysis</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-600">
            <div className="w-1.5 h-1.5 bg-ocean-teal rounded-full"></div>
            <span>Voyage guidance</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";
  const metadata = message.metadata as any;

  return (
    <div className={`flex items-start space-x-3 ${isUser ? 'justify-end' : ''}`}>
      {!isUser && (
        <div className="w-8 h-8 bg-maritime-blue rounded-full flex items-center justify-center flex-shrink-0">
          <Zap className="w-4 h-4 text-white" />
        </div>
      )}
      
      <div className={`rounded-lg p-4 max-w-2xl ${
        isUser 
          ? 'bg-maritime-blue text-white' 
          : 'bg-white border border-gray-200'
      }`}>
        <div className={`text-sm whitespace-pre-wrap ${isUser ? 'text-white' : 'text-gray-900'}`}>
          {message.content}
        </div>
        
        {metadata?.analysis && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                Query Analysis
              </span>
              <span className="text-xs text-gray-500">
                {Math.round(metadata.analysis.confidence * 100)}% confidence
              </span>
            </div>
            <div className="text-xs text-gray-600 mb-2">
              Category: <span className="font-medium">{metadata.analysis.category}</span>
            </div>
            {metadata.analysis.suggestedActions?.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {metadata.analysis.suggestedActions.map((action: string, index: number) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="h-6 px-2 text-xs"
                    data-testid={`action-${action.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    {action}
                  </Button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      
      {isUser && (
        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
          <User className="w-4 h-4 text-gray-600" />
        </div>
      )}
    </div>
  );
}
