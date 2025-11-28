"use client";

import { PortableText } from "next-sanity";
import Link from "next/link";

const PortableTextBlock = ({ value }: { value: any }) => {
  return <PortableText value={value} components={{
    block: {
      h1: ({ children }) => (
        <h1 className="text-3xl font-extrabold mb-4">{children}</h1>
      ),
      h2: ({ children }) => (
        <h2 className="text-2xl font-bold mb-4">{children}</h2>
      ),
      h3: ({ children }) => (
        <h3 className="text-xl font-semibold mb-4">{children}</h3>
      ),
      h4: ({ children }) => (
        <h4 className="text-lg font-semibold mb-4">{children}</h4>
      ),
      h5: ({ children }) => (
        <h5 className="text-base font-semibold mb-4">{children}</h5>
      ),
      h6: ({ children }) => (
        <h6 className="text-sm font-semibold mb-4">{children}</h6>
      ),
      normal: ({ children }) => (
        <p className="text-base text-card-foreground mb-4">{children}</p>
      ),
      blockquote: ({ children }) => (
        <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground mb-4">
          {children}
        </blockquote>
      ),
    },
    list: {
      bullet: ({ children }) => (
        <ul className="list-disc ml-6 mb-4 space-y-1">{children}</ul>
      ),
      number: ({ children }) => (
        <ol className="list-decimal ml-6 mb-4 space-y-1">{children}</ol>
      ),
    },
    listItem: {
      bullet: ({ children }) => (
        <li className="text-base text-card-foreground">{children}</li>
      ),
      number: ({ children }) => (
        <li className="text-base text-card-foreground">{children}</li>
      ),
    },
    marks: {
      strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
      em: ({ children }) => <em className="italic">{children}</em>,
      underline: ({ children }) => <span className="underline">{children}</span>,
      strikeThrough: ({ children }) => <span className="line-through">{children}</span>,
      link: ({ value, children }) => (
        <Link
          href={value?.href}
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-primary"
        >
          {children}
        </Link>
      ),
    },
  }} />;
};

export default PortableTextBlock;