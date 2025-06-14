"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

interface LogoutButtonProps {
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
    size?: "default" | "sm" | "lg" | "icon";
    className?: string;
}

export default function LogoutButton({
    variant = "ghost",
    size = "icon",
    className = ""
}: LogoutButtonProps) {
    return (
        <Button
            variant={variant}
            size={size}
            onClick={() => signOut({ callbackUrl: "/" })}
            className={`text-slate-400 hover:text-slate-100 hover:bg-slate-800 ${className}`}
            title="Logout"
        >
            <LogOut className="w-4 h-4" />
        </Button>
    );
}