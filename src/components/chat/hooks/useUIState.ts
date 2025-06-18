import { useState } from 'react';

export function useUIState() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [shareToken, setShareToken] = useState<string | null>(null);

  return {
    sidebarOpen,
    setSidebarOpen,
    showSettings,
    setShowSettings,
    showFileUpload,
    setShowFileUpload,
    shareToken,
    setShareToken
  };
}