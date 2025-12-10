import Link from "next/link";

const links = [
  { href: "/#process", label: "How it works" },
  { href: "/plan", label: "Weekly plan" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/admin", label: "Admin" },
];

export const SiteHeader = () => {
  return (
    <header className="sticky top-0 z-30 border-b border-white/5 bg-slate-950/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 text-white">
        <Link href="/" className="text-lg font-semibold">
          PulseForge
        </Link>
        <nav className="hidden gap-6 text-sm md:flex">
          {links.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-slate-200 transition hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3 text-sm">
          <Link
            href="/login"
            className="rounded-full border border-white/40 px-4 py-2 text-white transition hover:border-white"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="rounded-full bg-emerald-500 px-4 py-2 font-semibold text-slate-950 transition hover:bg-emerald-400"
          >
            Start free
          </Link>
        </div>
      </div>
    </header>
  );
};
