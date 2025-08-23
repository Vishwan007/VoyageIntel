import { useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import ChatInterface from "@/components/chat/chat-interface";
import type { Conversation, Message } from "@shared/schema";

export default function Chat() {
  const params = useParams();
  const [location, setLocation] = useLocation();
  const conversationId = params.conversationId;

  const { data: conversations } = useQuery<Conversation[]>({
    queryKey: ["/api/conversations"]
  });

  const { data: conversation } = useQuery<Conversation>({
    queryKey: ["/api/conversations", conversationId],
    enabled: !!conversationId
  });

  const { data: messages } = useQuery<Message[]>({
    queryKey: ["/api/conversations", conversationId, "messages"],
    enabled: !!conversationId
  });

  // If no conversation ID and we have conversations, redirect to the first one
  useEffect(() => {
    if (!conversationId && conversations && conversations.length > 0) {
      setLocation(`/chat/${conversations[0].id}`);
    }
  }, [conversationId, conversations, setLocation]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <div className="flex">
        <Sidebar 
          conversations={conversations || []}
          currentConversationId={conversationId}
        />
        <main className="flex-1 flex flex-col min-h-[calc(100vh-4rem)]">
          <ChatInterface 
            conversationId={conversationId}
            conversation={conversation}
            messages={messages || []}
          />
        </main>
      </div>
    </div>
  );
}
