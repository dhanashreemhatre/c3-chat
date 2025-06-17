export interface MarkdownParserProps {
  content: string;
  className?: string;
}

export interface CodeBlockProps {
  code: string;
  language: string;
  index: number;
}