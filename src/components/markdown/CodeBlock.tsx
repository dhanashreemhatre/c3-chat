import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CodeBlockProps } from '@/types/markdown';

export function CodeBlock({ code, language, index }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy code:', error);
    }
  };

  return (
    <div className="relative group max-w-60 sm:max-w-140 lg:max-w-160 xl:max-w-170 overflow-x-auto my-2">
      {/* Language label and copy button */}
      <div className="flex items-center justify-between bg-slate-800 px-3 py-2 text-xs text-slate-300 border-b border-slate-600">
        <span className="font-mono">{language}</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="h-6 w-6 p-0 bg-back hover:bg-slate-600 text-slate-300 hover:text-white opacity-70 group-hover:opacity-100 transition-opacity"
          title="Copy code"
        >
          {copied ? (
            <Check className="w-3 h-3" />
          ) : (
            <Copy className="w-3 h-3" />
          )}
        </Button>
      </div>
      
      {/* Code content */}
      <SyntaxHighlighter
        PreTag="div"
        language={language}
        style={vscDarkPlus as any}
        wrapLines={true}
        className="text-xs sm:text-sm !bg-transparent !mt-0 !rounded-t-none rounded-b-md"
        customStyle={{
          margin: 0,
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
        }}
      >
        {code}
      </SyntaxHighlighter>
      
      {/* Copied feedback */}
      {copied && (
        <div className="absolute top-2 right-12 bg-green-600 text-white text-xs px-2 py-1 rounded animate-fade-in">
          Copied!
        </div>
      )}
    </div>
  );
}