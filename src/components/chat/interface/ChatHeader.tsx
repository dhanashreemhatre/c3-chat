import { Button } from "@/components/ui/button";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut, Settings, PanelLeftOpen } from "lucide-react";
import { signOut } from "next-auth/react";

interface ChatHeaderProps {
  sidebarOpen: boolean;
  onSidebarToggle: () => void;
  onSettingsClick: () => void;
}

export function ChatHeader({ sidebarOpen, onSidebarToggle, onSettingsClick }: ChatHeaderProps) {
  return (
    <CardHeader className="pb-1">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div className="flex justify-between gap-2 w-full">
          <div className="flex items-center gap-2 min-w-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                if (!sidebarOpen) onSidebarToggle();
              }}
              className="text-slate-400 hover:text-slate-100 hover:dark md:hidden flex-shrink-0"
            >
              <PanelLeftOpen className="w-8 h-8" />
            </Button>
            <CardTitle className="text-xl text-slate-100 truncate">
              C3Chat AI Assistant
            </CardTitle>
          </div>
          
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => signOut({ callbackUrl: "/" })}
              className="text-slate-400 hover:text-slate-100 hover:bg-slate-800"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={onSettingsClick}
              className="text-slate-400 hover:text-slate-100 hover:bg-slate-800"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </CardHeader>
  );
}