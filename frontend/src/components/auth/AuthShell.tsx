import Link from "next/link";

type AuthShellProps = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footerText: string;
  footerLinkText: string;
  footerLinkHref: string;
};

export function AuthShell({
  title,
  subtitle,
  children,
  footerText,
  footerLinkText,
  footerLinkHref,
}: AuthShellProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-50 via-white to-slate-100 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="text-2xl font-bold text-slate-900">
            PixelForge <span className="text-brand-600">AI</span>
          </Link>
          <h1 className="mt-6 text-2xl font-semibold text-slate-900">{title}</h1>
          <p className="mt-2 text-sm text-slate-600">{subtitle}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          {children}
        </div>

        <p className="mt-6 text-center text-sm text-slate-600">
          {footerText}{" "}
          <Link
            href={footerLinkHref}
            className="font-semibold text-brand-600 hover:text-brand-700"
          >
            {footerLinkText}
          </Link>
        </p>
      </div>
    </main>
  );
}
