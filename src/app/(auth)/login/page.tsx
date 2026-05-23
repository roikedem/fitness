"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/api/auth/callback` },
      });
      if (error) setError(error.message);
      else setMessage("בדוק את המייל שלך לאישור");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
      else router.push("/");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-2">כושר</h1>
          <p className="text-muted-foreground">
            {mode === "login" ? "התחבר לחשבון שלך" : "צור חשבון חדש"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">אימייל</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full h-12 px-4 rounded-xl bg-card border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="you@example.com"
              dir="ltr"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">סיסמה</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full h-12 px-4 rounded-xl bg-card border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="••••••••"
              dir="ltr"
            />
          </div>
          {error && <p className="text-destructive text-sm">{error}</p>}
          {message && <p className="text-accent text-sm">{message}</p>}
          <Button type="submit" size="lg" className="w-full" disabled={loading}>
            {loading ? "..." : mode === "login" ? "כניסה" : "הרשמה"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          {mode === "login" ? "אין לך חשבון?" : "יש לך חשבון?"}{" "}
          <button
            type="button"
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
            className="text-primary underline"
          >
            {mode === "login" ? "הרשם" : "התחבר"}
          </button>
        </p>
      </div>
    </div>
  );
}
