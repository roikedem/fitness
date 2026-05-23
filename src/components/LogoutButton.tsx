"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { LogOut } from "lucide-react";

export default function LogoutButton() {
  const router = useRouter();
  const supabase = createClient();

  const logout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <Button variant="ghost" size="icon" onClick={logout} title="יציאה">
      <LogOut className="w-5 h-5" />
    </Button>
  );
}
