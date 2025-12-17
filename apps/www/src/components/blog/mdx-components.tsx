import { cn } from "@/lib/utils";
import type { ReactNode, ComponentPropsWithoutRef } from "react";

type MDXComponents = Record<
  string,
  (props: { children?: ReactNode } & Record<string, unknown>) => ReactNode
>;
type HeadingProps = ComponentPropsWithoutRef<"h1">;
type ParagraphProps = ComponentPropsWithoutRef<"p">;
type ListProps = ComponentPropsWithoutRef<"ul">;
type ListItemProps = ComponentPropsWithoutRef<"li">;
type AnchorProps = ComponentPropsWithoutRef<"a">;
type BlockquoteProps = ComponentPropsWithoutRef<"blockquote">;
type TableProps = ComponentPropsWithoutRef<"table">;
type TableHeadProps = ComponentPropsWithoutRef<"thead">;
type TableBodyProps = ComponentPropsWithoutRef<"tbody">;
type TableRowProps = ComponentPropsWithoutRef<"tr">;
type TableHeaderProps = ComponentPropsWithoutRef<"th">;
type TableCellProps = ComponentPropsWithoutRef<"td">;

export const mdxComponents: MDXComponents = {
  h1: (props: HeadingProps) => (
    <h1
      className="mb-6 mt-10 text-3xl font-bold tracking-tight first:mt-0 md:text-4xl"
      {...props}
    />
  ),
  h2: (props: HeadingProps) => (
    <h2
      className="mb-4 mt-10 text-2xl font-semibold tracking-tight first:mt-0"
      {...props}
    />
  ),
  h3: (props: HeadingProps) => (
    <h3
      className="mb-3 mt-8 text-xl font-semibold tracking-tight first:mt-0"
      {...props}
    />
  ),
  h4: (props: HeadingProps) => (
    <h4
      className="mb-2 mt-6 text-lg font-semibold tracking-tight first:mt-0"
      {...props}
    />
  ),
  p: (props: ParagraphProps) => (
    <p className="mb-6 leading-relaxed text-foreground/90" {...props} />
  ),
  ul: (props: ListProps) => (
    <ul
      className="mb-6 ml-4 list-disc space-y-2 marker:text-[var(--gradient-mid)]"
      {...props}
    />
  ),
  ol: (props: ListProps) => (
    <ol
      className="mb-6 ml-4 list-decimal space-y-2 marker:text-[var(--gradient-mid)]"
      {...props}
    />
  ),
  li: (props: ListItemProps) => (
    <li className="pl-2 leading-relaxed" {...props} />
  ),
  a: (props: AnchorProps) => (
    <a
      className="font-medium text-[var(--gradient-mid)] underline decoration-[var(--gradient-mid)]/30 underline-offset-4 transition-colors hover:decoration-[var(--gradient-mid)]"
      {...props}
    />
  ),
  blockquote: (props: BlockquoteProps) => (
    <blockquote
      className="my-6 border-l-4 border-[var(--gradient-mid)] bg-secondary/50 py-4 pl-6 pr-4 italic text-muted-foreground"
      {...props}
    />
  ),
  hr: () => <hr className="my-10 border-border" />,
  pre: (props: ComponentPropsWithoutRef<"pre">) => (
    <pre
      {...props}
      className={cn(
        "mb-6 overflow-x-auto rounded-xl border border-border !bg-background p-4 text-sm",
        props.className
      )}
    />
  ),
  code: (props: ComponentPropsWithoutRef<"code">) => {
    const isInlineCode = typeof props.children === "string";
    if (isInlineCode) {
      return (
        <code
          className="rounded-md bg-secondary px-1.5 py-0.5 font-mono text-sm text-[var(--gradient-mid)]"
          {...props}
        />
      );
    }
    return <code {...props} />;
  },
  strong: (props: ComponentPropsWithoutRef<"strong">) => (
    <strong className="font-semibold text-foreground" {...props} />
  ),
  em: (props: ComponentPropsWithoutRef<"em">) => (
    <em className="italic" {...props} />
  ),
  table: (props: TableProps) => (
    <div className="my-6 w-full overflow-x-auto rounded-lg border border-border">
      <table
        className={cn("w-full border-collapse", props.className)}
        {...props}
      />
    </div>
  ),
  thead: (props: TableHeadProps) => (
    <thead className="bg-secondary/50" {...props} />
  ),
  tbody: (props: TableBodyProps) => (
    <tbody className="divide-y divide-border bg-background" {...props} />
  ),
  tr: (props: TableRowProps) => (
    <tr className="transition-colors hover:bg-secondary/20" {...props} />
  ),
  th: (props: TableHeaderProps) => (
    <th
      className={cn(
        "px-4 py-3 text-left text-sm font-semibold text-foreground bg-secondary/30",
        "border-b border-border first:pl-4 last:pr-4",
        props.className
      )}
      {...props}
    />
  ),
  td: (props: TableCellProps) => (
    <td
      className={cn(
        "px-4 py-3 text-sm text-foreground/90 first:pl-4 last:pr-4",
        props.className
      )}
      {...props}
    />
  ),
};
