import { CheckCircle2, AlertTriangle } from "lucide-react";

interface ToastProps {
  message: string;
  visible: boolean;
  type?: "ok" | "err";
}

export function Toast({ message, visible, type }: ToastProps) {
  return (
    <div 
      className={`fixed bottom-6 right-6 px-4 py-3 rounded-xl shadow-xl border text-xs font-semibold flex items-center gap-2.5 transition-all duration-300 z-[9999] transform
        ${visible ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0 pointer-events-none"}
        ${type === "ok" ? "bg-emerald-950/80 border-emerald-900/40 text-emerald-400 backdrop-blur-md" : "bg-red-950/80 border-red-900/40 text-red-400 backdrop-blur-md"}`}
    >
      {type === "ok" ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <AlertTriangle className="w-4 h-4 text-red-500" />}
      <span>{message}</span>
    </div>
  );
}
