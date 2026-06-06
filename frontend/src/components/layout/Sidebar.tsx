import { SignedIn } from "@clerk/clerk-react";
import { Clock3, Compass, Home, Users } from "lucide-react";
import { NavLink } from "react-router-dom";
import { prefetchRoute } from "@/lib/routePrefetch";
import { cn } from "@/lib/utils";

const linkClass = ({ isActive }: { isActive: boolean }) =>
  cn("flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm transition hover:bg-accent", isActive && "bg-accent font-medium");

export const Sidebar = () => (
  <aside className="w-full min-w-0 border-b p-2 md:min-h-[calc(100vh-64px)] md:w-56 md:shrink-0 md:border-b-0 md:border-r md:p-3">
    <nav className="flex gap-1 overflow-x-auto md:grid md:grid-cols-1">
      <NavLink to="/" onMouseEnter={() => prefetchRoute("home")} onFocus={() => prefetchRoute("home")} className={linkClass}><Home className="size-4" />Trang chủ</NavLink>
      <NavLink to="/search" onMouseEnter={() => prefetchRoute("search")} onFocus={() => prefetchRoute("search")} className={linkClass}><Compass className="size-4" />Khám phá</NavLink>
      <SignedIn>
        <NavLink to="/subscriptions" onMouseEnter={() => prefetchRoute("subscriptions")} onFocus={() => prefetchRoute("subscriptions")} className={linkClass}><Users className="size-4" />Đăng ký</NavLink>
        <NavLink to="/history" onMouseEnter={() => prefetchRoute("history")} onFocus={() => prefetchRoute("history")} className={linkClass}><Clock3 className="size-4" />Lịch sử</NavLink>
      </SignedIn>
    </nav>
  </aside>
);
