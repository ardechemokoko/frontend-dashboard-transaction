export default function DashboardLoading() {
  return (
    <div className="flex items-center justify-center min-h-[50vh] p-8">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-indigo-200 dark:border-indigo-900 border-t-indigo-600 dark:border-t-indigo-400 animate-spin" />
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
          Chargement…
        </p>
      </div>
    </div>
  );
}
