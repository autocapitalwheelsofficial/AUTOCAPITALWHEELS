import { Loader2 } from 'lucide-react';

export default function AdminLoading() {
  return (
    <div className="w-full h-[80vh] flex flex-col items-center justify-center gap-4 text-neutral-400">
      <Loader2 className="animate-spin text-amber-500" size={36} />
      <span className="text-xs font-bold uppercase tracking-widest text-neutral-500 animate-pulse">Loading Panel...</span>
    </div>
  );
}
