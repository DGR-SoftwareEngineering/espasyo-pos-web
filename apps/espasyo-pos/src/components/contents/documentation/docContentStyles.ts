export const DOC_CONTENT_CSS = `
  .doc-content {
    max-width: 780px;
    font-family: system-ui, -apple-system, sans-serif;
    line-height: 1.8;
    color: var(--gray-12);
    font-size: 15px;
  }
  .doc-content h1 {
    font-size: 1.9em;
    font-weight: 800;
    border-bottom: 2px solid var(--accent-6);
    padding-bottom: 10px;
    margin-top: 0;
    margin-bottom: 20px;
    color: var(--gray-12);
  }
  .doc-content h2 {
    font-size: 1.35em;
    font-weight: 700;
    color: var(--accent-11);
    margin-top: 36px;
    margin-bottom: 12px;
    border-left: 4px solid var(--accent-8);
    padding-left: 12px;
  }
  .doc-content h3 {
    font-size: 1.05em;
    font-weight: 700;
    color: var(--gray-12);
    margin-top: 24px;
    margin-bottom: 8px;
  }
  .doc-content p { margin: 0 0 14px 0; }
  .doc-content ul, .doc-content ol {
    padding-left: 24px;
    margin: 0 0 14px 0;
  }
  .doc-content li { margin-bottom: 6px; }
  .doc-content table {
    width: 100%;
    border-collapse: collapse;
    margin: 16px 0;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 1px 3px rgba(0,0,0,0.08);
  }
  .doc-content th {
    background: var(--accent-9);
    color: white;
    padding: 11px 14px;
    text-align: left;
    font-weight: 600;
    font-size: 0.9em;
  }
  .doc-content td {
    padding: 9px 14px;
    border-bottom: 1px solid var(--gray-a4);
    font-size: 0.94em;
  }
  .doc-content tr:nth-child(even) td { background: var(--gray-a2); }
  .doc-content tr:last-child td { border-bottom: none; }
  .doc-content blockquote {
    border-left: 4px solid var(--accent-7);
    margin: 16px 0;
    padding: 10px 16px;
    background: var(--accent-a2);
    border-radius: 0 8px 8px 0;
    font-style: italic;
    color: var(--gray-11);
  }
  .doc-content code {
    background: var(--gray-a3);
    border: 1px solid var(--gray-a5);
    border-radius: 4px;
    padding: 2px 6px;
    font-size: 0.88em;
    font-family: 'JetBrains Mono', 'Fira Code', monospace;
    color: var(--accent-11);
  }
  .doc-content pre {
    background: var(--gray-a3);
    border: 1px solid var(--gray-a5);
    border-radius: 8px;
    padding: 16px;
    overflow-x: auto;
    margin: 16px 0;
  }
  .doc-content pre code {
    background: none;
    border: none;
    padding: 0;
    font-size: 0.9em;
    color: var(--gray-12);
  }
  .doc-content a {
    color: var(--accent-11);
    text-decoration: underline;
    text-underline-offset: 2px;
  }
  .doc-content a:hover { color: var(--accent-12); }
  .doc-content hr {
    border: none;
    border-top: 1px solid var(--gray-a5);
    margin: 28px 0;
  }
  .doc-content .tip {
    background: var(--blue-a2);
    border: 1px solid var(--blue-a5);
    border-radius: 8px;
    padding: 12px 16px;
    margin: 16px 0;
  }
  .doc-content .warn {
    background: var(--amber-a2);
    border: 1px solid var(--amber-a5);
    border-radius: 8px;
    padding: 12px 16px;
    margin: 16px 0;
  }
  .doc-content img { max-width: 100%; border-radius: 8px; }
`;

export function estimateReadTime(html: string): string {
  const text = html.replace(/<[^>]+>/g, " ");
  const words = text.trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min read`;
}
