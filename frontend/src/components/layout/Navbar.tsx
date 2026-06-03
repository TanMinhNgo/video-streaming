import { Search } from "lucide-react";
import { useState } from "react";
import type { FormEvent } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { prefetchRoute } from "@/lib/routePrefetch";
import { cn } from "@/lib/utils";

export const Navbar = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = query.trim();
    if (value) navigate(`/search?q=${encodeURIComponent(value)}`);
  };

  return (
    <header className="sticky top-0 z-30 border-b bg-background/90 backdrop-blur">
      <div className="mx-auto grid min-h-14 w-full max-w-7xl grid-cols-1 gap-3 px-4 py-3 md:grid-cols-[180px_1fr_auto] md:items-center">
        <NavLink to="/" className="text-lg font-semibold tracking-tight">StreamBox</NavLink>
        <form onSubmit={onSubmit} className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search videos, tags, creators"
            className="h-10 w-full rounded-md border border-input bg-card pl-9 pr-3 text-sm outline-none transition focus:ring-2 focus:ring-ring"
          />
        </form>
        <div className="flex items-center justify-between gap-2 md:justify-end">
          <nav className="flex items-center gap-1">
            <NavLink to="/upload" onMouseEnter={() => prefetchRoute("upload")} onFocus={() => prefetchRoute("upload")} className={({ isActive }) => cn("rounded-md px-3 py-2 text-sm", isActive && "bg-accent")}>Upload</NavLink>
            <NavLink to="/studio" onMouseEnter={() => prefetchRoute("studio")} onFocus={() => prefetchRoute("studio")} className={({ isActive }) => cn("rounded-md px-3 py-2 text-sm", isActive && "bg-accent")}>Studio</NavLink>
          </nav>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button type="button" className="rounded-full ring-1 ring-border">
                <Avatar><AvatarFallback>U</AvatarFallback></Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild><NavLink to="/channel/me">My Channel</NavLink></DropdownMenuItem>
              <DropdownMenuItem asChild><NavLink to="/history">History</NavLink></DropdownMenuItem>
              <DropdownMenuItem asChild><NavLink to="/studio">Studio</NavLink></DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};
