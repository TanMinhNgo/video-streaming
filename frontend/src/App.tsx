import { Suspense, lazy, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import { Navigate, Route, Routes } from "react-router-dom";
import { setAuthTokenGetter } from "@/api/axios";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { prefetchRoute } from "@/lib/routePrefetch";
import { useTrackingStore } from "@/stores/trackingStore";
import { Skeleton } from "@/components/ui/skeleton";

const HomePage = lazy(() => import("@/pages/Home").then((m) => ({ default: m.HomePage })));
const WatchPage = lazy(() => import("@/pages/Watch").then((m) => ({ default: m.WatchPage })));
const UploadPage = lazy(() => import("@/pages/Upload").then((m) => ({ default: m.UploadPage })));
const StudioPage = lazy(() => import("@/pages/Studio").then((m) => ({ default: m.StudioPage })));
const ChannelPage = lazy(() => import("@/pages/Channel").then((m) => ({ default: m.ChannelPage })));
const SearchPage = lazy(() => import("@/pages/Search").then((m) => ({ default: m.SearchPage })));
const SubscriptionsPage = lazy(() => import("@/pages/Subscriptions").then((m) => ({ default: m.SubscriptionsPage })));
const HistoryPage = lazy(() => import("@/pages/History").then((m) => ({ default: m.HistoryPage })));
const SignInPage = lazy(() => import("@/pages/SignIn").then((m) => ({ default: m.SignInPage })));
const SignUpPage = lazy(() => import("@/pages/SignUp").then((m) => ({ default: m.SignUpPage })));

const protectedPage = (page: React.ReactNode) => <ProtectedRoute>{page}</ProtectedRoute>;

function AppShell() {
  return (
    <div className="min-h-screen bg-linear-to-b from-background via-background to-accent/20">
      <a href="#main-content" className="sr-only z-50 rounded-md bg-foreground px-3 py-2 text-background focus:not-sr-only focus:fixed focus:left-3 focus:top-3">Bỏ qua điều hướng</a>
      <Navbar />
      <div className="mx-auto flex w-full max-w-7xl flex-col md:flex-row">
        <Sidebar />
        <main id="main-content" className="min-w-0 w-full p-3 sm:p-4">
          <Suspense fallback={<div className="space-y-3"><Skeleton className="h-10 w-1/3" /><Skeleton className="h-64 w-full" /></div>}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/watch/:id" element={<WatchPage />} />
              <Route path="/upload" element={protectedPage(<UploadPage />)} />
              <Route path="/studio" element={protectedPage(<StudioPage />)} />
              <Route path="/channel/me" element={protectedPage(<ChannelPage />)} />
              <Route path="/channel/:id" element={<ChannelPage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/subscriptions" element={protectedPage(<SubscriptionsPage />)} />
              <Route path="/history" element={protectedPage(<HistoryPage />)} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  const { getToken, isSignedIn } = useAuth();
  const flush = useTrackingStore((s) => s.flush);

  useEffect(() => {
    setAuthTokenGetter(getToken);
    return () => setAuthTokenGetter(null);
  }, [getToken]);

  useEffect(() => {
    const id = setInterval(() => void flush(), 10000);
    const onUnload = () => void flush();
    window.addEventListener("beforeunload", onUnload);
    return () => {
      clearInterval(id);
      window.removeEventListener("beforeunload", onUnload);
      void flush();
    };
  }, [flush]);

  useEffect(() => {
    const run = () => {
      if (isSignedIn) {
        prefetchRoute("upload");
        prefetchRoute("studio");
        prefetchRoute("history");
      }
    };
    if ("requestIdleCallback" in window) {
      const idleId = window.requestIdleCallback(run, { timeout: 1500 });
      return () => window.cancelIdleCallback(idleId);
    }
    const t = setTimeout(run, 800);
    return () => clearTimeout(t);
  }, [isSignedIn]);

  return (
    <Suspense fallback={<div className="min-h-dvh bg-background" />}>
      <Routes>
        <Route path="/sign-in/*" element={<SignInPage />} />
        <Route path="/sign-up/*" element={<SignUpPage />} />
        <Route path="/*" element={<AppShell />} />
      </Routes>
    </Suspense>
  );
}
