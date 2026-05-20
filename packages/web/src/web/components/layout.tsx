import { useLocation, Link } from "wouter";
import { useAuth } from "../hooks/use-auth";
import { useQueryClient } from "@tanstack/react-query";

const NAV = [
  { href: "/", label: "Home", icon: "🏠" },
  { href: "/words", label: "Words", icon: "📚" },
  { href: "/study", label: "Study", icon: "🧠" },
  { href: "/grammar", label: "Grammar", icon: "📖" },
  { href: "/learn", label: "Learn", icon: "🎓" },
  { href: "/exams", label: "Exams", icon: "📝" },
  { href: "/profile", label: "Profile", icon: "👤" },
];

// Bottom nav for mobile — only 5 items (most important)
const BOTTOM_NAV = [
  { href: "/", label: "Home", icon: "🏠" },
  { href: "/words", label: "Words", icon: "📚" },
  { href: "/study", label: "Study", icon: "🧠" },
  { href: "/grammar", label: "Grammar", icon: "📖" },
  { href: "/learn", label: "Learn", icon: "🎓" },
  { href: "/exams", label: "Exams", icon: "📝" },
  { href: "/profile", label: "Profile", icon: "👤" },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { user, signOut } = useAuth();
  const queryClient = useQueryClient();

  const handleSignOut = async () => {
    await signOut();
    queryClient.clear();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* ── Desktop sidebar ── */}
      <aside className="hidden md:flex w-60 bg-white border-r border-gray-200 flex-col fixed h-full z-10">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⚒️</span>
            <span className="text-xl font-bold text-gray-900">DeutschForge</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {NAV.map((item) => {
            const active = location === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <span
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-colors ${
                    active
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 px-2 py-2 mb-2">
            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold text-sm">
              {user?.name?.[0]?.toUpperCase() ?? "?"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full text-sm text-gray-500 hover:text-red-600 py-1.5 px-4 rounded-lg hover:bg-red-50 transition-colors text-left"
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="flex-1 md:ml-60 p-4 md:p-8 pb-24 md:pb-8">
        {/* Mobile top bar */}
        <div className="md:hidden flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
          <span className="text-xl">⚒️</span>
          <span className="text-lg font-bold text-gray-900">DeutschForge</span>
        </div>
        {children}
      </main>

      {/* ── Mobile bottom tab bar ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-area-bottom">
        <div className="flex">
          {BOTTOM_NAV.map((item) => {
            const active = location === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <span
                  className={`flex flex-col items-center justify-center py-2 px-1 cursor-pointer transition-colors flex-1 min-w-0 ${
                    active ? "text-indigo-600" : "text-gray-400"
                  }`}
                  style={{ minWidth: `${100 / BOTTOM_NAV.length}vw` }}
                >
                  <span className={`text-xl leading-none ${active ? "scale-110" : ""} transition-transform`}>
                    {item.icon}
                  </span>
                  <span className="text-[9px] mt-0.5 font-medium truncate w-full text-center">
                    {item.label}
                  </span>
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
