import Link from "next/link";
import { Mail } from "lucide-react";

export const metadata = { title: "Verify Email" };

export default function VerifyPage() {
  return (
    <div className="glass rounded-xl p-8 text-center">
      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
        <Mail className="h-6 w-6 text-primary" />
      </div>
      <h2 className="text-xl font-semibold mb-2">Email Verified</h2>
      <p className="text-sm text-muted-foreground">
        Your email has been verified successfully. You can now log in.
      </p>
      <Link
        href="/login"
        className="inline-block mt-6 rounded-lg bg-primary text-primary-foreground px-6 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity"
      >
        Log In
      </Link>
    </div>
  );
}
