import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "./app-shell";
import type { AppUser } from "@/lib/types";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("imm_profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  const { data: userData } = await supabase
    .from("imm_users")
    .select("role")
    .eq("id", user.id)
    .single();

  const appUser: AppUser = {
    id: user.id,
    email: user.email ?? "",
    role: (userData?.role ?? "applicant") as AppUser["role"],
    firstName: profile?.first_name ?? user.email?.split("@")[0] ?? "",
    lastName: profile?.last_name ?? "",
    avatarUrl: profile?.avatar_url ?? null,
  };

  return <AppShell user={appUser}>{children}</AppShell>;
}
