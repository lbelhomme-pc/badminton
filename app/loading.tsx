export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="h-8 w-64 animate-pulse rounded-lg bg-court-200" />
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="h-44 animate-pulse rounded-lg border border-court-200 bg-white" />
        ))}
      </div>
    </div>
  );
}
