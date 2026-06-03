import { NavLink } from "react-router-dom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { prefetchRoute } from "@/lib/routePrefetch";
import { cn } from "@/lib/utils";

export const Navbar = () => (
  <header className="sticky top-0 z-30 border-b bg-background/90 backdrop-blur">
    <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between px-4">
      <NavLink to="/" className="text-lg font-semibold tracking-tight">StreamBox</NavLink>
      <div className="flex items-center gap-2">
        <nav className="flex items-center gap-1">
          <NavLink to="/upload" onMouseEnter={() => prefetchRoute("upload")} onFocus={() => prefetchRoute("upload")} className={({ isActive }) => cn("rounded-md px-3 py-2 text-sm", isActive && "bg-accent")}>Upload</NavLink>
          <NavLink to="/studio" onMouseEnter={() => prefetchRoute("studio")} onFocus={() => prefetchRoute("studio")} className={({ isActive }) => cn("rounded-md px-3 py-2 text-sm", isActive && "bg-accent")}>Studio</NavLink>
          <NavLink to="/history" onMouseEnter={() => prefetchRoute("history")} onFocus={() => prefetchRoute("history")} className={({ isActive }) => cn("rounded-md px-3 py-2 text-sm", isActive && "bg-accent")}>History</NavLink>
        </nav>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type="button" className="rounded-full ring-1 ring-border">
              <Avatar><AvatarFallback>U</AvatarFallback></Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild><NavLink to="/channel/me">My Channel</NavLink></DropdownMenuItem>
            <DropdownMenuItem asChild><NavLink to="/studio">Studio</NavLink></DropdownMenuItem>
            <DropdownMenuItem>Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  </header>
);
