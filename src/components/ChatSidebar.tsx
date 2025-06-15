"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import {
  MessageSquare,
  Trash2,
  Share2,
  AlertCircle,
  Search,
  PanelLeftOpen,
  PanelRightOpen,
} from "lucide-react";
import { useChatContext } from "../contexts/ChatContext";
import { Chat } from "../services/chatService";

interface ChatSidebarProps {
  isOpen: boolean;
  onToggleAction: () => void;
}

export default function ChatSidebar({
  isOpen,
  onToggleAction,
}: ChatSidebarProps) {
  const {
    state,
    createNewChat,
    deleteChat,
    shareChat,
    switchToChat,
    saveApiKey,
  } = useChatContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [, setShowApiKeyForm] = useState(false);
  const [apiKeyProvider, setApiKeyProvider] = useState("");
  const [apiKeyValue, setApiKeyValue] = useState("");
  const [shareToken, setShareToken] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(false); // <-- Add this line

  const filteredChats = state.chats.filter((chat) =>
    chat.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleNewChat = () => {
    createNewChat();
    if (window.innerWidth < 768) {
      onToggleAction(); // Close sidebar on mobile
    }
  };

  const handleChatClick = async (chatId: string) => {
    await switchToChat(chatId);
    if (window.innerWidth < 768) {
      onToggleAction(); // Close sidebar on mobile
    }
  };

  const handleDeleteChat = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this chat?")) {
      setIsDeleting(chatId);
      try {
        await deleteChat(chatId);
      } catch (error) {
        console.error("Failed to delete chat:", error);
      } finally {
        setIsDeleting(null);
      }
    }
  };

  // const handleDeleteAllChats = async () => {
  //   if (
  //     confirm(
  //       "Are you sure you want to delete all chats? This action cannot be undone.",
  //     )
  //   ) {
  //     try {
  //       await deleteAllChats();
  //     } catch (error) {
  //       console.error("Failed to delete all chats:", error);
  //     }
  //   }
  // };

  const handleShareChat = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const token = await shareChat(chatId);
      setShareToken(token);
      navigator.clipboard.writeText(
        `${window.location.origin}/shared/${token}`,
      );
    } catch (error) {
      console.error("Failed to share chat:", error);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleSaveApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await saveApiKey(apiKeyProvider, apiKeyValue);
      setApiKeyValue("");
      setApiKeyProvider("");
      setShowApiKeyForm(false);
    } catch (error) {
      console.error("Failed to save API key:", error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "Today";
    if (diffDays === 2) return "Yesterday";
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return date.toLocaleDateString();
  };

  const groupChatsByDate = (chats: Chat[]) => {
    const groups: { [key: string]: Chat[] } = {};
    chats.forEach((chat) => {
      const dateKey = formatDate(chat.createdAt);
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(chat);
    });
    return groups;
  };

  const chatGroups = groupChatsByDate(filteredChats);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onToggleAction}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed inset-y-0 left-0 z-50
          ${collapsed ? "w-16" : "w-67"}
          bg-background border-r border-border
          transform transition-all duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          md:relative md:translate-x-0 md:flex md:flex-col h-screen overflow-hidden rounded-r-lg
        `}
        style={{
          transitionProperty: "width,transform",
        }}
      >
        <Card className="h-full dark rounded-none border-1 flex flex-col overflow-hidden">
          <CardHeader className={`pb-4 border-b border-border flex-shrink-0 ${collapsed ? "items-center" : ""}`}>
            <div className="flex items-center justify-between">
              <CardTitle className={`text-lg text-slate-100 flex items-center gap-2 ${collapsed ? "hidden" : ""}`}>
                <MessageSquare className="w-5 h-5" />
                Chat History
              </CardTitle>
              <div className="flex items-center gap-2">
                {/* Collapse/Expand Button (always visible) */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setCollapsed((c) => !c)}
                  className="text-slate-400 hover:text-slate-100 hover:dark"
                  title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                  {collapsed ? (
                    // Right arrow for expand
                    <PanelLeftOpen className="hidden sm:block h-20 w-20" />
                  ) : (
                    // Left arrow for collapse
                    <PanelRightOpen className="hidden sm:block h-20 w-20" />
                  )}
                </Button>
                {/* Close button (mobile only, hidden on desktop) */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onToggleAction}
                  className={`text-slate-400 hover:text-slate-100 hover:dark md:hidden ${collapsed ? "hidden" : ""}`}
                >
                  <PanelRightOpen className="w-8 h-8" />
                </Button>
              </div>
            </div>

            {/* New Chat Button */}
            {!collapsed && (
              <Button
                onClick={handleNewChat}
                className="bg-foreground w-full text-black border-1"
              >
                New Chat
              </Button>
            )}

            {/* Search */}
            {!collapsed && (
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Search chats..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 dark/50 border-border text-slate-100 placeholder-slate-400"
                />
              </div>
            )}
          </CardHeader>

          <CardContent className="p-0 flex-1 flex flex-col min-h-0">
            {/* Chat List */}
            <div className="flex-1 overflow-hidden">
              <ScrollArea className="h-full scrollbar-hide">
                <div className="p-2">
                  {state.isLoadingChats ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-2 border-border"></div>
                    </div>
                  ) : Object.keys(chatGroups).length === 0 ? (
                    !collapsed && (
                      <div className="text-center py-8 text-slate-400">
                        <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No chats yet</p>
                        <p className="text-xs">Start a new conversation</p>
                      </div>
                    )
                  ) : (
                    Object.entries(chatGroups).map(([dateGroup, chats]) => (
                      <div key={dateGroup} className={`mb-4 ${collapsed ? "px-1" : ""}`}>
                        {!collapsed && (
                          <h4 className="text-xs font-semibold text-slate-400 mb-2 px-2">
                            {dateGroup}
                          </h4>
                        )}
                        <div className="space-y-1">
                          {chats.map((chat) => (
                            <div
                              key={chat.id}
                              onClick={() => handleChatClick(chat.id)}
                              className={`
                                group flex items-center p-3 rounded-lg cursor-pointer transition-all duration-200 hover:dark/70
                                ${state.currentChatId === chat.id ? "dark border-0 border-border" : "hover:dark/50"}
                                ${collapsed ? "justify-center" : ""}
                              `}
                            >
                              <div className={`${collapsed ? "w-full flex justify-center" : "w-[70%] min-w-0 pr-1"}`}>
                                <p className={`text-sm font-medium text-slate-200 truncate ${collapsed ? "text-center" : ""}`}>
                                  {!collapsed
                                    ? (chat.title || "Untitled Chat").length > 25
                                      ? `${(chat.title || "Untitled Chat").substring(0, 25)}...`
                                      : chat.title || "Untitled Chat"
                                    : null}
                                </p>
                                {!collapsed && (
                                  <p className="text-xs text-slate-400 truncate">
                                    {new Date(chat.updatedAt).toLocaleTimeString(
                                      [],
                                      {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      },
                                    )}
                                  </p>
                                )}
                              </div>

                              {!collapsed && (
                                <div className="w-[30%] flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={(e) => handleShareChat(chat.id, e)}
                                    className="h-6 w-6 text-slate-400 hover:text-blue-400 hover:bg-slate-700"
                                  >
                                    <Share2 className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={(e) => handleDeleteChat(chat.id, e)}
                                    disabled={isDeleting === chat.id}
                                    className="h-6 w-6 text-slate-400 hover:text-red-400 hover:bg-slate-700"
                                  >
                                    {isDeleting === chat.id ? (
                                      <div className="animate-spin rounded-full h-3 w-3 border-b border-current"></div>
                                    ) : (
                                      <Trash2 className="w-3 h-3" />
                                    )}
                                  </Button>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>

            {/* Error Display */}
            {state.error && !collapsed && (
              <div className="p-4 border-t border-border flex-shrink-0">
                <div className="flex items-center gap-2 text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>{state.error}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Share Token Modal */}
      {shareToken && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md dark border-slate-700">
            <CardHeader>
              <CardTitle className="text-slate-100">Chat Shared!</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300 mb-4">
                Your chat has been shared. The link has been copied to your
                clipboard.
              </p>
              <div className="dark p-3 rounded text-sm text-slate-300 break-all mb-4">
                {`${window.location.origin}/shared/${shareToken}`}
              </div>
              <Button onClick={() => setShareToken(null)} className="w-full">
                Close
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
