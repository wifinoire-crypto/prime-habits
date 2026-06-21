'use client'

import ReactMarkdown from 'react-markdown'

interface MarkdownViewerProps {
  content: string
  className?: string
}

export default function MarkdownViewer({ content, className = '' }: MarkdownViewerProps) {
  return (
    <div className={`prose-terminal ${className}`}>
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  )
}
