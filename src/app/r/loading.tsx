export default function ReviewLoading() {
  return (
    <div className="flex min-h-40 items-center justify-center" role="status" aria-live="polite">
      <p className="text-sm text-muted-foreground">Loading review…</p>
    </div>
  );
}
