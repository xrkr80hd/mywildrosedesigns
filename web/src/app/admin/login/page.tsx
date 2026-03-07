import { LoginForm } from "./login-form";

type AdminLoginPageProps = {
  searchParams?: {
    next?: string | string[];
  };
};

function normalizeNextPath(value?: string | string[]): string {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw || !raw.startsWith("/")) {
    return "/admin";
  }
  return raw;
}

export default function AdminLoginPage({ searchParams }: AdminLoginPageProps) {
  const nextPath = normalizeNextPath(searchParams?.next);

  return (
    <main className="admin-content mx-auto flex min-h-[70vh] w-full max-w-md items-center px-6 py-12">
      <section className="w-full rounded-3xl border border-rose/20 bg-white/90 p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">
          Admin Login
        </p>
        <h1 className="mt-2 text-3xl text-forest">Sign in to Dashboard</h1>
        <LoginForm nextPath={nextPath} />
      </section>
    </main>
  );
}
