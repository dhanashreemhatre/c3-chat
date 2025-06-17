export interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export interface ApiKeyEntry {
    provider: string;
    apiKey: string;
    isVisible: boolean;
    status: "active" | "invalid" | "unused";
}