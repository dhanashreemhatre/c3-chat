import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ChatProvider } from "@/contexts/ChatContext";
import SessionProvider from "@/components/SessionProvider";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "C3Chat - AI Assistant",
    description:
        "Advanced AI chat interface with multiple models, web search, and chat management",
    keywords: ["AI", "Chat", "Assistant", "GPT", "Claude", "Gemini"],
    authors: [{ name: "C3Chat Team" }],
    viewport: "width=device-width, initial-scale=1",
    themeColor: "#000000",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased dark`}
            >
                <SessionProvider>
                    <ChatProvider>{children}</ChatProvider>
                </SessionProvider>
            </body>
        </html>
    );
}
