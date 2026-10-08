export function StatTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col gap-2 rounded-2xl bg-card px-5 py-4">
      <span className="text-3xl font-light tracking-[-0.04em] text-foreground">{value}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}
