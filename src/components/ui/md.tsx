import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

export function Md({ children, className }: { children: string; className?: string }) {
  return (
    <div className={cn("space-y-2", className)}>
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        p: ({ children }) => <p className="leading-relaxed">{children}</p>,
        strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
        em: ({ children }) => <em className="italic">{children}</em>,
        h1: ({ children }) => <h1 className="text-xl font-bold mt-4 mb-1">{children}</h1>,
        h2: ({ children }) => <h2 className="text-lg font-semibold mt-3 mb-1">{children}</h2>,
        h3: ({ children }) => <h3 className="text-base font-semibold mt-2 mb-0.5">{children}</h3>,
        h4: ({ children }) => <h4 className="text-sm font-semibold mt-2">{children}</h4>,
        ul: ({ children }) => <ul className="list-disc pl-5 space-y-1">{children}</ul>,
        ol: ({ children }) => <ol className="list-decimal pl-5 space-y-1">{children}</ol>,
        li: ({ children }) => <li className="leading-relaxed">{children}</li>,
        code: ({ children, className: cls }) => {
          const isBlock = cls?.startsWith("language-");
          return isBlock ? (
            <code className="block bg-muted rounded-md px-3 py-2 text-xs font-mono overflow-x-auto whitespace-pre">
              {children}
            </code>
          ) : (
            <code className="bg-muted rounded px-1 py-0.5 text-xs font-mono">{children}</code>
          );
        },
        pre: ({ children }) => (
          <pre className="bg-muted rounded-md overflow-x-auto text-xs font-mono my-1">{children}</pre>
        ),
        blockquote: ({ children }) => (
          <blockquote className="border-l-2 border-border pl-3 text-muted-foreground italic">
            {children}
          </blockquote>
        ),
        a: ({ href, children }) => (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline underline-offset-2 hover:opacity-80"
          >
            {children}
          </a>
        ),
        hr: () => <hr className="border-border my-2" />,
        table: ({ children }) => (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">{children}</table>
          </div>
        ),
        thead: ({ children }) => <thead className="border-b border-border">{children}</thead>,
        tbody: ({ children }) => <tbody>{children}</tbody>,
        tr: ({ children }) => <tr className="border-b border-border last:border-0">{children}</tr>,
        th: ({ children }) => (
          <th className="text-left px-3 py-1.5 font-semibold text-muted-foreground">{children}</th>
        ),
        td: ({ children }) => <td className="px-3 py-1.5">{children}</td>,
      }}
    >
      {children}
    </ReactMarkdown>
    </div>
  );
}
