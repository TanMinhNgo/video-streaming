import { Clapperboard, Play } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";

type AuthLayoutProps = {
  children: ReactNode;
  title: string;
  description: string;
};

export function AuthLayout({ children, title, description }: AuthLayoutProps) {
  return (
    <main className="grid min-h-dvh bg-background lg:grid-cols-[minmax(0,1.05fr)_minmax(28rem,0.95fr)]">
      <section className="relative hidden overflow-hidden border-r bg-foreground p-12 text-background lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 opacity-25 [background-image:radial-gradient(circle_at_20%_20%,oklch(0.72_0.16_55),transparent_35%),radial-gradient(circle_at_80%_70%,oklch(0.58_0.15_260),transparent_38%)]" />
        <Link to="/" className="relative flex w-fit items-center gap-2 text-lg font-semibold tracking-tight">
          <span className="grid size-9 place-items-center rounded-lg bg-background text-foreground">
            <Play className="size-4 fill-current" />
          </span>
          StreamBox
        </Link>

        <div className="relative max-w-xl">
          <Clapperboard className="mb-6 size-10 text-background/70" strokeWidth={1.5} />
          <p className="text-4xl font-semibold leading-tight tracking-[-0.04em] text-balance">
            Xem, đăng tải và quản lý video trong cùng một tài khoản.
          </p>
          <p className="mt-5 max-w-md text-base leading-7 text-background/65">
            Phiên đăng nhập được bảo vệ bởi Clerk. Video của bạn được tải trực tiếp lên ImageKit.
          </p>
        </div>

        <p className="relative text-sm text-background/50">Progressive MP4 streaming, không cần chờ xử lý video.</p>
      </section>

      <section className="flex min-h-dvh items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <Link to="/" className="mb-10 flex w-fit items-center gap-2 text-lg font-semibold tracking-tight lg:hidden">
            <span className="grid size-9 place-items-center rounded-lg bg-foreground text-background">
              <Play className="size-4 fill-current" />
            </span>
            StreamBox
          </Link>
          <div className="mb-6">
            <h1 className="text-3xl font-semibold tracking-[-0.035em] text-balance">{title}</h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
          </div>
          {children}
          <p className="mt-6 text-center text-xs leading-5 text-muted-foreground">
            Khi tiếp tục, bạn đồng ý với điều khoản sử dụng và chính sách quyền riêng tư của StreamBox.
          </p>
        </div>
      </section>
    </main>
  );
}
