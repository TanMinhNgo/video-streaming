import { SignUp } from "@clerk/clerk-react";
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

export function SignUpPage() {
  return (
    <AuthLayout title="Tạo tài khoản StreamBox" description="Đăng ký để tải video, theo dõi kênh và lưu lại hoạt động xem.">
      <SignUp
        routing="path"
        path="/sign-up"
        signInUrl="/sign-in"
        fallbackRedirectUrl="/"
        appearance={clerkAppearance}
      />
    </AuthLayout>
  );
}
