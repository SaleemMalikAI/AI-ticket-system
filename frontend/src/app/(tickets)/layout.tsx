/** App pages share one centered content column. */
export default function TicketsLayout({ children }: { children: React.ReactNode }) {
  return (
    <main id="main" className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      {children}
    </main>
  );
}
