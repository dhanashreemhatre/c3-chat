import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { Copy, Check, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MarkdownParserProps {
  content: string;
  className?: string;
}

interface CodeBlockProps {
  code: string;
  language: string;
  index: number;
}

function CodeBlock({ code, language, index }: CodeBlockProps) {
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

export function MarkdownParser({ content, className = '' }: MarkdownParserProps) {
  const parseMarkdown = (text: string): React.ReactNode[] => {
    const elements: React.ReactNode[] = [];

    // Split by code blocks first to handle them separately
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const parts: Array<{ type: 'text' | 'code'; content: string; language?: string }> = [];
    
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(text)) !== null) {
      // Add text before code block
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: text.slice(lastIndex, match.index)
        });
      }
      
      // Add code block
      parts.push({
        type: 'code',
        content: match[2],
        language: match[1] || 'text'
      });
      
      lastIndex = match.index + match[0].length;
    }
    
    // Add remaining text
    if (lastIndex < text.length) {
      parts.push({
        type: 'text',
        content: text.slice(lastIndex)
      });
    }

    // Process each part
    parts.forEach((part, partIndex) => {
      if (part.type === 'code') {
        elements.push(
          <CodeBlock
            key={`code-${partIndex}`}
            code={part.content}
            language={part.language!}
            index={partIndex}
          />
        );
      } else {
        elements.push(...parseTextContent(part.content, `text-${partIndex}`));
      }
    });

    return elements;
  };

  const parseTextContent = (text: string, keyPrefix: string): React.ReactNode[] => {
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let listItems: string[] = [];
    let inList = false;
    let listType: 'ul' | 'ol' = 'ul';

    const flushList = () => {
      if (listItems.length > 0) {
        const ListComponent = listType === 'ul' ? 'ul' : 'ol';
        elements.push(
          <ListComponent key={`${keyPrefix}-list-${elements.length}`} className="list-disc list-inside ml-4 my-2">
            {listItems.map((item, index) => (
              <li key={index} className="text-sm sm:text-base leading-tight mb-1">
                {parseInlineElements(item)}
              </li>
            ))}
          </ListComponent>
        );
        listItems = [];
        inList = false;
      }
    };

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      if (!trimmedLine) {
        flushList();
        return;
      }

      // Headers
      if (trimmedLine.startsWith('# ')) {
        flushList();
        elements.push(
          <h1 key={`${keyPrefix}-h1-${index}`} className="text-lg sm:text-xl font-bold mt-4 mb-2 first:mt-0">
            {parseInlineElements(trimmedLine.slice(2))}
          </h1>
        );
      } else if (trimmedLine.startsWith('## ')) {
        flushList();
        elements.push(
          <h2 key={`${keyPrefix}-h2-${index}`} className="text-base sm:text-lg font-bold mt-3 mb-2 first:mt-0">
            {parseInlineElements(trimmedLine.slice(3))}
          </h2>
        );
      } else if (trimmedLine.startsWith('### ')) {
        flushList();
        elements.push(
          <h3 key={`${keyPrefix}-h3-${index}`} className="text-sm sm:text-base font-bold mt-2 mb-1 first:mt-0">
            {parseInlineElements(trimmedLine.slice(4))}
          </h3>
        );
      }
      // Unordered list
      else if (trimmedLine.match(/^[-*+]\s/)) {
        if (!inList || listType !== 'ul') {
          flushList();
          inList = true;
          listType = 'ul';
        }
        listItems.push(trimmedLine.slice(2));
      }
      // Ordered list
      else if (trimmedLine.match(/^\d+\.\s/)) {
        if (!inList || listType !== 'ol') {
          flushList();
          inList = true;
          listType = 'ol';
        }
        const match = trimmedLine.match(/^\d+\.\s(.*)$/);
        if (match) {
          listItems.push(match[1]);
        }
      }
      // Blockquote
      else if (trimmedLine.startsWith('> ')) {
        flushList();
        elements.push(
          <blockquote key={`${keyPrefix}-quote-${index}`} className="border-l-4 border-blue-400 pl-4 py-2 my-2 bg-blue-950/20 rounded-r">
            <p className="text-sm sm:text-base leading-tight italic">
              {parseInlineElements(trimmedLine.slice(2))}
            </p>
          </blockquote>
        );
      }
      // Horizontal rule
      else if (trimmedLine.match(/^---+$/)) {
        flushList();
        elements.push(
          <hr key={`${keyPrefix}-hr-${index}`} className="border-slate-600 my-4" />
        );
      }
      // Regular paragraph
      else {
        if (inList) {
          // Continue current list item
          if (listItems.length > 0) {
            listItems[listItems.length - 1] += ' ' + trimmedLine;
          }
        } else {
          elements.push(
            <p key={`${keyPrefix}-p-${index}`} className="text-sm sm:text-base leading-tight mb-2">
              {parseInlineElements(trimmedLine)}
            </p>
          );
        }
      }
    });

    flushList(); // Flush any remaining list items

    return elements;
  };

  const parseInlineElements = (text: string): React.ReactNode[] => {
    const elements: React.ReactNode[] = [];
    let currentIndex = 0;

    // Enhanced pattern to catch more link formats and ensure proper parsing
    const inlineRegex = /(`[^`]+`)|(\*\*[^*]+\*\*)|(__[^_]+__)|(\*[^*]+\*)|(_[^_]+_)|(\[([^\]]+)\]\(([^)]+)\))|(https?:\/\/[^\s]+)/g;
    
    let match;
    while ((match = inlineRegex.exec(text)) !== null) {
      // Add text before match
      if (match.index > currentIndex) {
        elements.push(text.slice(currentIndex, match.index));
      }

      const fullMatch = match[0];
      
      // Inline code
      if (match[1]) {
        elements.push(
          <code key={`code-${match.index}`} className="bg-slate-700 px-1 py-0.5 rounded text-xs sm:text-sm font-mono">
            {fullMatch.slice(1, -1)}
          </code>
        );
      }
      // Bold (**text** or __text__)
      else if (match[2] || match[3]) {
        const content = match[2] ? fullMatch.slice(2, -2) : fullMatch.slice(2, -2);
        elements.push(
          <strong key={`bold-${match.index}`} className="font-bold">
            {content}
          </strong>
        );
      }
      // Italic (*text* or _text_)
      else if (match[4] || match[5]) {
        const content = fullMatch.slice(1, -1);
        elements.push(
          <em key={`italic-${match.index}`} className="italic">
            {content}
          </em>
        );
      }
      // Markdown links [text](url)
      else if (match[6] && match[7] && match[8]) {
        const linkText = match[7];
        const linkUrl = match[8];
        elements.push(
          <a
            key={`link-${match.index}`}
            href={linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 underline decoration-blue-400 hover:decoration-blue-300 transition-colors duration-200 inline-flex items-center gap-1 cursor-pointer"
            onClick={(e) => {
              // Ensure the link is clickable by preventing any parent event handlers
              e.stopPropagation();
            }}
          >
            {linkText}
            <ExternalLink className="w-3 h-3 inline-block" />
          </a>
        );
      }
      // Plain URLs (auto-link)
      else if (match[9]) {
        const url = fullMatch;
        elements.push(
          <a
            key={`autolink-${match.index}`}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 underline decoration-blue-400 hover:decoration-blue-300 transition-colors duration-200 inline-flex items-center gap-1 cursor-pointer break-all"
            onClick={(e) => {
              // Ensure the link is clickable by preventing any parent event handlers
              e.stopPropagation();
            }}
          >
            {url}
            <ExternalLink className="w-3 h-3 inline-block flex-shrink-0" />
          </a>
        );
      }

      currentIndex = match.index + fullMatch.length;
    }

    // Add remaining text
    if (currentIndex < text.length) {
      elements.push(text.slice(currentIndex));
    }

    return elements.map((element, index) => 
      typeof element === 'string' ? (
        <React.Fragment key={`text-${index}`}>{element}</React.Fragment>
      ) : (
        element
      )
    );
  };

  return (
    <div className={`prose prose-invert prose-sm sm:prose-base max-w-none ${className}`}>
      {parseMarkdown(content)}
    </div>
  );
}