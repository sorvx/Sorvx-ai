import Link from "next/link";
import React, { memo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const CodeBlock = ({
  node,
  inline,
  className,
  children,
  ...props
}: any) => {
  const match = /language-(\w+)/.exec(className || "");
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    const codeText = Array.isArray(children) ? children.join("") : children;

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard
        .writeText(codeText)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        })
        .catch((err) => {
          console.error("Clipboard API failed, falling back to execCommand", err);
          fallbackCopyText(codeText);
        });
    } else {
      fallbackCopyText(codeText);
    }
  };

  const fallbackCopyText = (text: string) => {
    const scrollPosition = { top: window.scrollY, left: window.scrollX };
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      const successful = document.execCommand("copy");
      if (successful) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } else {
        console.error("Fallback: Copy command was unsuccessful");
      }
    } catch (err) {
      console.error("Fallback: Oops, unable to copy", err);
    }
    document.body.removeChild(textArea);
    window.scrollTo(scrollPosition.left, scrollPosition.top);
  };

  if (inline || !match) {
    return (
      <code
        className={`${className} text-sm bg-zinc-100 dark:bg-zinc-800 py-0.5 px-1 rounded-md`}
        {...props}
      >
        {children}
      </code>
    );
  }

  return (
    <div className="my-4 border rounded-lg overflow-hidden shadow">
      <div className="flex items-center px-3 py-2 bg-gray-200 dark:bg-gray-800">
        <span className="w-3 h-3 bg-red-500 rounded-full mr-1"></span>
        <span className="w-3 h-3 bg-yellow-500 rounded-full mr-1"></span>
        <span className="w-3 h-3 bg-green-500 rounded-full mr-1"></span>
        <div className="flex-grow"></div>
        <button
          onClick={copyToClipboard}
          className="text-xs bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 px-2 py-1 rounded"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre
        {...props}
        className="overflow-x-auto p-3 bg-gray-50 dark:bg-gray-900 text-sm font-mono"
      >
        <code className={match[1]}>{children}</code>
      </pre>
    </div>
  );
};

const NonMemoizedMarkdown = ({ children }: { children: string }) => {
  const components = {
    code: CodeBlock,
    ol: ({ node, children, ...props }: any) => (
      <ol className="list-decimal list-outside ml-4" {...props}>
        {children}
      </ol>
    ),
    ul: ({ node, children, ...props }: any) => (
      <ul className="list-disc list-outside ml-4" {...props}>
        {children}
      </ul>
    ),
    li: ({ node, children, ...props }: any) => (
      <li className="py-1" {...props}>
        {children}
      </li>
    ),
    strong: ({ node, children, ...props }: any) => (
      <strong className="font-bold" {...props}>
        {children}
      </strong>
    ),
    a: ({ node, children, ...props }: any) => (
      <Link
        className="text-blue-500 hover:underline"
        target="_blank"
        rel="noreferrer"
        {...props}
      >
        {children}
      </Link>
    ),
    blockquote: ({ node, children, ...props }: any) => (
      <blockquote
        className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic text-gray-600 dark:text-gray-400 my-4"
        {...props}
      >
        {children}
      </blockquote>
    ),
    table: ({ node, children, ...props }: any) => (
      <table className="min-w-full border-collapse my-4" {...props}>
        {children}
      </table>
    ),
    thead: ({ node, children, ...props }: any) => (
      <thead className="bg-gray-100 dark:bg-gray-700" {...props}>
        {children}
      </thead>
    ),
    tbody: ({ node, children, ...props }: any) => (
      <tbody className="bg-white dark:bg-gray-800" {...props}>
        {children}
      </tbody>
    ),
    tr: ({ node, children, ...props }: any) => (
      <tr className="border-b border-gray-200 dark:border-gray-700" {...props}>
        {children}
      </tr>
    ),
    th: ({ node, children, ...props }: any) => (
      <th className="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-300" {...props}>
        {children}
      </th>
    ),
    td: ({ node, children, ...props }: any) => (
      <td className="px-4 py-2 text-gray-600 dark:text-gray-300" {...props}>
        {children}
      </td>
    ),
    hr: ({ node, ...props }: any) => (
      <hr className="my-4 border-gray-300 dark:border-gray-600" {...props} />
    ),
    // Optionally, add more custom renderers as needed.
  };

  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
      {children}
    </ReactMarkdown>
  );
};

export const Markdown = memo(
  NonMemoizedMarkdown,
  (prevProps, nextProps) => prevProps.children === nextProps.children
);