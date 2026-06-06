import { SignIn } from "@clerk/clerk-react";
import { AuthLayout } from "@/components/auth/AuthLayout";

const clerkAppearance = {
  elements: {
    rootBox: "w-full",
    cardBox: "w-full shadow-none",
    card: "w-full border border-border bg-card shadow-none",
    headerTitle: "hidden",
    headerSubtitle: "hidden",
    socialButtonsBlockButton: "border-border bg-background hover:bg-accent",
    formButtonPrimary: "bg-foreground text-background hover:bg-foreground/90",
    footerActionLink: "text-foreground font-medium hover:text-foreground/75",
  },
} as const;

export function SignInPage() {
  return (
    <AuthLayout title="Đăng nhập vào StreamBox" description="Tiếp tục xem lịch sử, kênh đã đăng ký và quản lý video của bạn.">
      <SignIn
        routing="path"
        path="/sign-in"
        signUpUrl="/sign-up"
        fallbackRedirectUrl="/"
        appearance={clerkAppearance}
      />
    </AuthLayout>
  );
}
