import { SignedIn, SignedOut, UserButton, useUser } from "@clerk/clerk-react";
import { Play, Search, Upload } from "lucide-react";
import { useState } from "react";
import type { FormEvent } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { prefetchRoute } from "@/lib/routePrefetch";
import { cn } from "@/lib/utils";

export const Navbar = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [query, setQuery] = useState("");

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = query.trim();
    if (value) navigate(`/search?q=${encodeURIComponent(value)}`);
  };

  return (
    <header className="sticky top-0 z-30 border-b bg-background/90 backdrop-blur">
      <div className="mx-auto grid min-h-14 w-full max-w-7xl grid-cols-[1fr_auto] items-center gap-3 px-4 py-3 md:grid-cols-[180px_minmax(0,1fr)_auto]">
        <NavLink to="/" className="flex items-center gap-2 text-lg font-semibold tracking-tight">
          <span className="grid size-8 place-items-center rounded-lg bg-foreground text-background"><Play className="size-3.5 fill-current" /></span>
          StreamBox
        </NavLink>
        <form onSubmit={onSubmit} className="relative order-3 col-span-2 md:order-none md:col-span-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Tìm video, tag hoặc creator"
            aria-label="Tìm kiếm video"
            name="search"
            className="h-10 w-full rounded-md border border-input bg-card pl-9 pr-3 text-sm outline-none transition focus:ring-2 focus:ring-ring"
          />
        </form>
        <div className="flex min-w-0 items-center justify-end gap-2">
          <SignedOut>
            <div className="flex items-center gap-2">
              <NavLink to="/sign-in" className="rounded-md px-2.5 py-2 text-sm font-medium transition hover:bg-accent active:scale-[0.98] sm:px-3">
                Đăng nhập
              </NavLink>
              <NavLink to="/sign-up" className="hidden rounded-md bg-foreground px-3 py-2 text-sm font-medium text-background transition hover:opacity-90 active:scale-[0.98] sm:block">
                Đăng ký
              </NavLink>
            </div>
          </SignedOut>
          <SignedIn>
            <nav className="flex items-center gap-1">
              <NavLink
                to="/upload"
                onMouseEnter={() => prefetchRoute("upload")}
                onFocus={() => prefetchRoute("upload")}
                className={({ isActive }) => cn("flex items-center gap-2 rounded-md px-3 py-2 text-sm transition hover:bg-accent", isActive && "bg-accent")}
              >
                <Upload className="size-4" />
                <span className="hidden sm:inline">Upload</span>
              </NavLink>
              <NavLink to="/studio" onMouseEnter={() => prefetchRoute("studio")} onFocus={() => prefetchRoute("studio")} className={({ isActive }) => cn("hidden rounded-md px-3 py-2 text-sm transition hover:bg-accent sm:block", isActive && "bg-accent")}>Studio</NavLink>
            </nav>
            <div className="flex items-center gap-2 border-l pl-3">
              <span className="hidden max-w-32 truncate text-sm text-muted-foreground xl:inline">
                {user?.firstName || user?.username || "Tài khoản"}
              </span>
              <UserButton
                appearance={{ elements: { avatarBox: "size-9 ring-1 ring-border" } }}
              >
                <UserButton.MenuItems>
                  <UserButton.Link label="Kênh của tôi" href="/channel/me" labelIcon={<span aria-hidden>▶</span>} />
                  <UserButton.Link label="Lịch sử xem" href="/history" labelIcon={<span aria-hidden>↺</span>} />
                </UserButton.MenuItems>
              </UserButton>
            </div>
          </SignedIn>
        </div>
      </div>
    </header>
  );
};
