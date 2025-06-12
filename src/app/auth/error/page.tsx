"use client";

import React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  ArrowLeft,
  RefreshCw,
  Home,
  HelpCircle
} from "lucide-react";

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const error = searchParams.get('error');

  const getErrorMessage = (errorCode: string | null) => {
    switch (errorCode) {
      case 'Configuration':
        return {
          title: 'Authentication Configuration Error',
          message: 'There was a problem with the authentication setup. Please contact support.',
          suggestion: 'This is likely a server configuration issue.'
        };
      case 'AccessDenied':
        return {
          title: 'Access Denied',
          message: 'You do not have permission to sign in.',
          suggestion: 'Please contact an administrator if you believe this is an error.'
        };
      case 'Verification':
        return {
          title: 'Verification Error',
          message: 'The verification link was invalid or has expired.',
          suggestion: 'Please try signing in again.'
        };
      case 'Default':
      default:
        return {
          title: 'Authentication Error',
          message: 'An unexpected error occurred during authentication.',
          suggestion: 'Please try signing in again. If the problem persists, contact support.'
        };
    }
  };

  const errorInfo = getErrorMessage(error);

  const handleRetry = () => {
    router.push('/');
  };

  const handleGoHome = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-slate-900/50 border-slate-700 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-900/20 border border-red-500/30 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <CardTitle className="text-xl text-slate-100">
            {errorInfo.title}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-slate-300 mb-2">
              {errorInfo.message}
            </p>
            <p className="text-sm text-slate-400">
              {errorInfo.suggestion}
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-600">
              <p className="text-xs text-slate-400 mb-1">Error Code:</p>
              <p className="text-sm font-mono text-slate-300">{error}</p>
            </div>
          )}

          <div className="space-y-3">
            <Button
              onClick={handleRetry}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>

            <Button
              onClick={handleGoHome}
              variant="outline"
              className="w-full text-slate-200 border-slate-600 hover:bg-slate-700"
            >
              <Home className="w-4 h-4 mr-2" />
              Go to Home
            </Button>
          </div>

          <div className="pt-4 border-t border-slate-700">
            <div className="flex items-center justify-center gap-2 text-slate-400">
              <HelpCircle className="w-4 h-4" />
              <span className="text-sm">
                Need help?{' '}
                <button
                  onClick={() => window.open('mailto:support@c3chat.com', '_blank')}
                  className="text-blue-400 hover:text-blue-300 underline"
                >
                  Contact Support
                </button>
              </span>
            </div>
          </div>

          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 p-3 rounded-lg bg-yellow-900/20 border border-yellow-500/30">
              <p className="text-xs text-yellow-400 mb-2">Development Info:</p>
              <ul className="text-xs text-yellow-300 space-y-1">
                <li>• Check Google OAuth configuration</li>
                <li>• Verify redirect URIs in Google Console</li>
                <li>• Ensure NEXTAUTH_SECRET is set</li>
                <li>• Check server logs for detailed errors</li>
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
