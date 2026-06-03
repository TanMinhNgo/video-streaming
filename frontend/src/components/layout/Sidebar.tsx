import { NavLink } from "react-router-dom";
import { prefetchRoute } from "@/lib/routePrefetch";
import { cn } from "@/lib/utils";

export const Sidebar = () => (
  <aside className="w-full border-b p-3 md:min-h-[calc(100vh-56px)] md:w-56 md:border-b-0 md:border-r">
    <nav className="grid grid-cols-2 gap-2 md:grid-cols-1">
      <NavLink to="/" onMouseEnter={() => prefetchRoute("home")} onFocus={() => prefetchRoute("home")} className={({ isActive }) => cn("rounded-md px-3 py-2 text-sm hover:bg-accent", isActive && "bg-accent")}>Home</NavLink>
      <NavLink to="/subscriptions" onMouseEnter={() => prefetchRoute("subscriptions")} onFocus={() => prefetchRoute("subscriptions")} className={({ isActive }) => cn("rounded-md px-3 py-2 text-sm hover:bg-accent", isActive && "bg-accent")}>Subscriptions</NavLink>
      <NavLink to="/search?q=music" onMouseEnter={() => prefetchRoute("search")} onFocus={() => prefetchRoute("search")} className={({ isActive }) => cn("rounded-md px-3 py-2 text-sm hover:bg-accent", isActive && "bg-accent")}>Search</NavLink>
      <NavLink to="/channel/me" onMouseEnter={() => prefetchRoute("channel")} onFocus={() => prefetchRoute("channel")} className={({ isActive }) => cn("rounded-md px-3 py-2 text-sm hover:bg-accent", isActive && "bg-accent")}>Channel</NavLink>
    </nav>
  </aside>
);
