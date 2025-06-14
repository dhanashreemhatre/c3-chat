"use client";

import ChatInterface from "@/components/chat/ChatInterface";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, LogIn } from "lucide-react";

export default function ChatPage() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // Redirect to home if not authenticated
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center mx-auto mb-4 backdrop-blur-sm border border-white/10">
            <Sparkles className="w-8 h-8 text-blue-400 animate-pulse" />
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading your chat...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-slate-900/50 border-slate-700 backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center mx-auto mb-6 backdrop-blur-sm border border-white/10">
              <Sparkles className="w-8 h-8 text-blue-400" />
            </div>

            <h1 className="text-2xl font-bold text-slate-100 mb-2">
              Authentication Required
            </h1>

            <p className="text-slate-400 mb-6">
              Please sign in to access the chat interface and start
              conversations with AI assistants.
            </p>

            <Button
              onClick={() => router.push("/")}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <LogIn className="w-4 h-4 mr-2" />
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <ChatInterface />;
}
