import type { Metadata } from "next";
import { Suspense } from "react";
import ChatClient from "@/components/chat/ChatClient";
import { Loader2 } from "lucide-react";

export const metadata: Metadata = { title: "AI Chat" };

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 text-orange-400 animate-spin" /></div>}>
      <ChatClient />
    </Suspense>
  );
}
