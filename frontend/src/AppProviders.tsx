import { ClerkProvider } from "@clerk/clerk-react";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import App from "@/App";
import { queryClient } from "@/lib/queryClient";

type AppProvidersProps = {
  clerkKey: string;
};

export function AppProviders({ clerkKey }: AppProvidersProps) {
  const navigate = useNavigate();

  return (
    <ClerkProvider
      publishableKey={clerkKey}
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      signInFallbackRedirectUrl="/"
      signUpFallbackRedirectUrl="/"
      routerPush={(to) => navigate(to)}
      routerReplace={(to) => navigate(to, { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <App />
        <Toaster position="top-right" />
      </QueryClientProvider>
    </ClerkProvider>
  );
}
