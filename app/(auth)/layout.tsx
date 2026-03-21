import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center dot-pattern">
      <div className="absolute inset-0 bg-gradient-to-br from-teal-950/20 via-transparent to-indigo-950/20 pointer-events-none" />
      <div className="relative z-10 w-full max-w-md px-4">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-bold gradient-text-teal">Immigram</h1>
          </Link>
          <p className="text-muted-foreground mt-2 text-sm">
            AI-Powered Immigration Navigator
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
