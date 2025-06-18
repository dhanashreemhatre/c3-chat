import { Palette } from "lucide-react";

export function AppearanceTab() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-100 mb-2">
          Appearance Settings
        </h3>
        <p className="text-sm text-slate-400 mb-4">
          Customize the look and feel of your chat interface
        </p>
      </div>
      
      <div className="space-y-4">
        <div className="p-4 dark rounded-lg border border-slate-600">
          <h4 className="text-sm font-medium text-slate-200 mb-2">
            <Palette className="w-4 h-4 inline mr-2" />
            Theme
          </h4>
          <p className="text-sm text-slate-400">
            Theme customization coming soon...
          </p>
        </div>
      </div>
    </div>
  );
}