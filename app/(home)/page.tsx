import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex flex-col justify-center text-center flex-1">
      <h1 className="text-2xl font-bold mb-4">Custom TOC</h1>
      <p className="text-fd-muted-foreground mb-6">
        A custom table of contents with animated progress tracking for Fumadocs.
      </p>
      <Link
        href="/docs"
        className="mx-auto rounded-md bg-fd-primary px-4 py-2 text-sm font-medium text-fd-primary-foreground hover:bg-fd-primary/90"
      >
        View Demo
      </Link>
    </div>
  );
}
