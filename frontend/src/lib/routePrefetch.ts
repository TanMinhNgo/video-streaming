type RouteKey =
  | "home"
  | "watch"
  | "upload"
  | "studio"
  | "channel"
  | "search"
  | "subscriptions"
  | "history";

const loaders: Record<RouteKey, () => Promise<unknown>> = {
  home: () => import("@/pages/Home"),
  watch: () => import("@/pages/Watch"),
  upload: () => import("@/pages/Upload"),
  studio: () => import("@/pages/Studio"),
  channel: () => import("@/pages/Channel"),
  search: () => import("@/pages/Search"),
  subscriptions: () => import("@/pages/Subscriptions"),
  history: () => import("@/pages/History"),
};

const prefetched = new Set<RouteKey>();

export function prefetchRoute(key: RouteKey) {
  if (prefetched.has(key)) return;
  prefetched.add(key);
  void loaders[key]();
}

