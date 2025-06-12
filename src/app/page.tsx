"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Sparkles,
    MessageSquare,
    Globe,
    Key,
    Share2,
    Zap,
    Shield,
    ArrowRight,
} from "lucide-react";

export default function HomePage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        // Redirect to chat if already authenticated
        if (session?.user) {
            router.push("/chat");
        }
    }, [session, router]);

    const handleSignIn = () => {
        signIn("google", { callbackUrl: "/chat" });
    };

    const features = [
        {
            icon: MessageSquare,
            title: "Multiple AI Models",
            description:
                "Chat with GPT-4, Claude, Gemini, and more advanced AI models in one place.",
        },
        {
            icon: Globe,
            title: "Web Search Integration",
            description:
                "Get real-time information with built-in web search capabilities.",
        },
        {
            icon: Key,
            title: "Your Own API Keys",
            description:
                "Use your own API keys for unlimited usage or start with free credits.",
        },
        {
            icon: Share2,
            title: "Share Conversations",
            description:
                "Share interesting conversations with others via secure links.",
        },
        {
            icon: Zap,
            title: "Fast & Responsive",
            description:
                "Lightning-fast responses with a modern, intuitive interface.",
        },
        {
            icon: Shield,
            title: "Secure & Private",
            description:
                "Your conversations are secure with enterprise-grade authentication.",
        },
    ];

    const supportedModels = [
        {
            name: "GPT-4",
            provider: "OpenAI",
            color: "from-green-400 to-green-600",
        },
        {
            name: "Claude 4",
            provider: "Anthropic",
            color: "from-orange-400 to-orange-600",
        },
        {
            name: "Gemini 2.0",
            provider: "Google",
            color: "from-blue-400 to-blue-600",
        },
    ];

    if (status === "loading") {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center mx-auto mb-4 backdrop-blur-sm border border-white/10">
                        <Sparkles className="w-8 h-8 text-blue-400 animate-pulse" />
                    </div>
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-4"></div>
                    <p className="text-slate-400">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white">
            {/* Navigation */}
            <nav className="border-b border-slate-800">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                <Sparkles className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-xl font-bold">C3Chat</span>
                        </div>

                        {session?.user ? (
                            <div className="flex items-center gap-4">
                                <span className="text-sm text-slate-400">
                                    Welcome, {session.user.name}
                                </span>
                                <Button
                                    onClick={() => router.push("/chat")}
                                    size="sm"
                                >
                                    Go to Chat
                                </Button>
                                <Button
                                    onClick={() => signOut()}
                                    variant="outline"
                                    size="sm"
                                >
                                    Sign Out
                                </Button>
                            </div>
                        ) : (
                            <Button onClick={handleSignIn}>Get Started</Button>
                        )}
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-6xl mx-auto text-center">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center mx-auto mb-8 backdrop-blur-sm border border-white/10">
                        <Sparkles className="w-10 h-10 text-blue-400" />
                    </div>

                    <h1 className="text-4xl sm:text-6xl font-bold mb-6">
                        Next-Generation
                        <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                            {" "}
                            AI Chat
                        </span>
                    </h1>

                    <p className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed">
                        Experience the power of multiple AI models in one
                        unified interface. Chat with GPT-4, Claude, Gemini, and
                        more. Get real-time information with web search. Share
                        conversations. Your AI assistant, reimagined.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                        <Button
                            onClick={handleSignIn}
                            size="lg"
                            className="text-lg px-8 py-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200"
                        >
                            Start Chatting Now
                            <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                        <Button
                            variant="outline"
                            size="lg"
                            className="text-lg px-8 py-6 border-slate-600 text-slate-200 hover:bg-slate-800"
                            onClick={() =>
                                document
                                    .getElementById("features")
                                    ?.scrollIntoView({ behavior: "smooth" })
                            }
                        >
                            Learn More
                        </Button>
                    </div>

                    {/* Supported Models */}
                    <div className="flex flex-wrap justify-center gap-4 mb-16">
                        {supportedModels.map((model, index) => (
                            <div
                                key={index}
                                className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 border border-slate-700"
                            >
                                <div
                                    className={`w-3 h-3 rounded-full bg-gradient-to-r ${model.color}`}
                                />
                                <span className="text-sm font-medium">
                                    {model.name}
                                </span>
                                <span className="text-xs text-slate-400">
                                    by {model.provider}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section
                id="features"
                className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900/20"
            >
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                            Powerful Features
                        </h2>
                        <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                            Everything you need for productive AI conversations
                            in one place
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <Card
                                key={index}
                                className="bg-slate-800/30 border-slate-700 backdrop-blur-sm hover:bg-slate-800/50 transition-all duration-200"
                            >
                                <CardHeader>
                                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center mb-4">
                                        <feature.icon className="w-6 h-6 text-blue-400" />
                                    </div>
                                    <CardTitle className="text-slate-100">
                                        {feature.title}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-slate-400">
                                        {feature.description}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                        <div className="p-8">
                            <div className="text-4xl font-bold text-blue-400 mb-2">
                                4+
                            </div>
                            <div className="text-slate-400">
                                AI Models Supported
                            </div>
                        </div>
                        <div className="p-8">
                            <div className="text-4xl font-bold text-purple-400 mb-2">
                                ∞
                            </div>
                            <div className="text-slate-400">Conversations</div>
                        </div>
                        <div className="p-8">
                            <div className="text-4xl font-bold text-green-400 mb-2">
                                10
                            </div>
                            <div className="text-slate-400">
                                Free Chats to Start
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-900/20 to-purple-900/20">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                        Ready to Experience the Future?
                    </h2>
                    <p className="text-xl text-slate-300 mb-8">
                        Join thousands of users who are already having better
                        conversations with AI.
                    </p>
                    <Button
                        onClick={handleSignIn}
                        size="lg"
                        className="text-lg px-8 py-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                        Get Started for Free
                        <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-slate-800 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-6xl mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <div className="flex items-center gap-3 mb-4 md:mb-0">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                <Sparkles className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-xl font-bold">C3Chat</span>
                        </div>

                        <div className="flex items-center gap-6">
                            <span className="text-sm text-slate-400">
                                © 2024 C3Chat. All rights reserved.
                            </span>
                        </div>
                    </div>

                    <div className="mt-8 pt-8 border-t border-slate-800 text-center">
                        <p className="text-slate-500 text-sm">
                            Built with Next.js, TypeScript, and the latest AI
                            technologies.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
