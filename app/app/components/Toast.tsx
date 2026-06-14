import { CheckCircle2, AlertTriangle } from "lucide-react";

interface ToastProps {
  message: string;
  visible: boolean;
  type?: "ok" | "err";
}

export function Toast({ message, visible, type }: ToastProps) {
  return (
    <div 
      className={`fixed bottom-6 right-6 px-4 py-3 rounded-xl shadow-lg border text-xs font-semibold flex items-center gap-2.5 transition-all duration-350 z-[9999] transform
        ${visible ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0 pointer-events-none"}
        ${type === "ok" ? "bg-sage border-sage/20 text-white" : "bg-red text-white border-red-500/10"}`}
    >
      {type === "ok" ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
      <span>{message}</span>
    </div>
  );
}
