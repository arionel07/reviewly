export function StatTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-border px-4 py-3">
      <span className="text-2xl font-semibold text-foreground">{value}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}
