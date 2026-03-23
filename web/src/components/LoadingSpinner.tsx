export const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-screen bg-linear-to-br from-slate-50 to-slate-100">
    <div className="space-y-4">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-4 border-slate-200" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-600 animate-spin" />
      </div>
      <p className="text-sm text-slate-500 text-center">Loading...</p>
    </div>
  </div>
);
