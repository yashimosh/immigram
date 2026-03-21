import Link from "next/link";
import { UserCircle, CreditCard, Bell, ArrowRight } from "lucide-react";

export const metadata = { title: "Settings" };

export default function SettingsPage() {
  const sections = [
    {
      title: "Profile",
      description: "Manage your personal information and preferences",
      href: "/settings/profile",
      icon: UserCircle,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Billing",
      description: "View your subscription plan and payment details",
      href: "/settings/billing",
      icon: CreditCard,
      color: "text-purple-400",
      bgColor: "bg-purple-400/10",
    },
    {
      title: "Notifications",
      description: "View and manage your notifications",
      href: "/settings/notifications",
      icon: Bell,
      color: "text-amber-400",
      bgColor: "bg-amber-400/10",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <Link
              key={section.href}
              href={section.href}
              className="glass rounded-xl p-6 hover:bg-white/[0.06] transition-colors group"
            >
              <div className={`w-12 h-12 rounded-xl ${section.bgColor} flex items-center justify-center mb-4`}>
                <Icon className={`h-6 w-6 ${section.color}`} />
              </div>
              <h3 className="font-semibold mb-1">{section.title}</h3>
              <p className="text-sm text-muted-foreground">
                {section.description}
              </p>
              <div className="mt-4 flex items-center gap-1 text-sm text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                Open <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
