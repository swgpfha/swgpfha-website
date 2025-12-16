export default function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border bg-background/40 p-10 text-center text-sm text-muted-foreground">
      {children}
    </div>
  );
}
