"use client";

import { useState } from "react";
import { X, Settings, Key, Palette, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SettingsModalProps } from "@/types/settings";
import { useNotifications } from "./hooks/NotificationHook";
import { NotificationMessages } from "./Notification";
import { GeneralTab } from "./GeneralTab";
import { ApiKeysTab } from "./ApiKeyTab";
import { AppearanceTab } from "./AppearanceTab";
import { DataTab } from "./DataTab";

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState("general");
  const { error, success, showError, showSuccess, clearError } = useNotifications();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] dark border-slate-700 flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-slate-400" />
            <CardTitle className="text-slate-100">Settings</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-100 hover:dark"
          >
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>

        <CardContent className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
            <TabsList className="grid w-full grid-cols-4 dark">
              <TabsTrigger value="general" className="data-[state=active]:dark data-[state=active]:text-slate-100">
                <Settings className="hidden sm:block w-4 h-4 mr-2" />
                General
              </TabsTrigger>
              <TabsTrigger value="api-keys" className="data-[state=active]:dark data-[state=active]:text-slate-100">
                <Key className="hidden sm:block w-4 h-4 mr-2" />
                API Keys
              </TabsTrigger>
              <TabsTrigger value="appearance" className="data-[state=active]:dark data-[state=active]:text-slate-100">
                <Palette className="hidden sm:block w-4 h-4 mr-2" />
                Appearance
              </TabsTrigger>
              <TabsTrigger value="data" className="data-[state=active]:dark data-[state=active]:text-slate-100">
                <Trash2 className="hidden sm:block w-4 h-4 mr-2" />
                Data
              </TabsTrigger>
            </TabsList>

            <div className="mt-4 h-[calc(100%-60px)] overflow-y-auto">
              <NotificationMessages 
                error={error} 
                success={success} 
                onClearError={clearError} 
              />

              <TabsContent value="general" className="mt-0">
                <GeneralTab />
              </TabsContent>

              <TabsContent value="api-keys" className="mt-0">
                <ApiKeysTab onError={showError} onSuccess={showSuccess} />
              </TabsContent>

              <TabsContent value="appearance" className="mt-0">
                <AppearanceTab />
              </TabsContent>

              <TabsContent value="data" className="mt-0">
                <DataTab onError={showError} onSuccess={showSuccess} />
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}