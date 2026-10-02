/** Narrow, chat-friendly content column. */
export default function AssistantLayout({ children }: { children: React.ReactNode }) {
  return (
    <main id="main" className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
      {children}
    </main>
  );
}
