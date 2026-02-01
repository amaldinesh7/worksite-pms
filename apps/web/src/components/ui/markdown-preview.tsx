/**
 * Markdown Preview Component
 *
 * Renders markdown content with proper styling.
 * Uses @uiw/react-markdown-preview under the hood.
 */

import MDPreview from '@uiw/react-markdown-preview';
import { cn } from '@/lib/utils';

// ============================================
// Types
// ============================================

interface MarkdownPreviewProps {
  source: string;
  className?: string;
  /** Use compact styling for inline/table contexts */
  isCompact?: boolean;
}

// ============================================
// Component
// ============================================

export function MarkdownPreview({ source, className, isCompact = false }: MarkdownPreviewProps) {
  if (!source) {
    return <span className="text-muted-foreground">—</span>;
  }

  return (
    <div data-color-mode="light" className={cn('markdown-preview', className)}>
      <MDPreview
        source={source}
        className={cn('!bg-transparent !text-foreground', isCompact && 'compact-markdown')}
        style={{
          fontSize: 'inherit',
          lineHeight: 'inherit',
          padding: 0,
          backgroundColor: 'transparent',
        }}
        skipHtml
        rehypeRewrite={(node) => {
          // Make links open in new tab
          if (node.type === 'element' && node.tagName === 'a') {
            node.properties = {
              ...node.properties,
              target: '_blank',
              rel: 'noopener noreferrer',
            };
          }
        }}
      />
      <style>{`
        .markdown-preview .wmde-markdown {
          background: transparent !important;
          font-size: inherit !important;
          line-height: inherit !important;
        }
        
        .markdown-preview .wmde-markdown p {
          margin: 0 !important;
        }
        
        .markdown-preview .wmde-markdown ul,
        .markdown-preview .wmde-markdown ol {
          margin: 0.25rem 0 !important;
          padding-left: 1.25rem !important;
        }
        
        .markdown-preview .wmde-markdown li {
          margin: 0 !important;
        }
        
        .markdown-preview .wmde-markdown code {
          background: hsl(var(--muted)) !important;
          padding: 0.125rem 0.25rem !important;
          border-radius: 0.25rem !important;
          font-size: 0.875em !important;
        }
        
        .markdown-preview .wmde-markdown strong {
          font-weight: 600 !important;
        }
        
        .markdown-preview .wmde-markdown a {
          color: hsl(var(--primary)) !important;
          text-decoration: underline !important;
        }
        
        /* Compact mode for table cells */
        .compact-markdown .wmde-markdown {
          font-size: 0.875rem !important;
          line-height: 1.25rem !important;
        }
        
        .compact-markdown .wmde-markdown ul,
        .compact-markdown .wmde-markdown ol {
          margin: 0 !important;
          padding-left: 1rem !important;
        }
      `}</style>
    </div>
  );
}
