import { ArrowRight, AlertCircle, Sparkles } from "lucide-react";

interface AuthViewProps {
  authAction: "signin" | "signup";
  setAuthAction: (action: "signin" | "signup") => void;
  emailInput: string;
  setEmailInput: (val: string) => void;
  passwordInput: string;
  setPasswordInput: (val: string) => void;
  fullNameInput: string;
  setFullNameInput: (val: string) => void;
  authError: string;
  onSubmit: (e: React.FormEvent) => void;
  isAuthenticating?: boolean;
}

export function AuthView({
  authAction,
  setAuthAction,
  emailInput,
  setEmailInput,
  passwordInput,
  setPasswordInput,
  fullNameInput,
  setFullNameInput,
  authError,
  onSubmit,
  isAuthenticating = false
}: AuthViewProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-50 via-mist to-sage-light/35 font-sans p-6 relative overflow-hidden">
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-sage/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-[420px] bg-white border border-stone-200/60 rounded-2xl shadow-xl shadow-stone-900/5 overflow-hidden transition-all duration-300 relative z-10 hover:border-stone-300">
        
        {/* Header brand details */}
        <div className="p-8 pb-4 text-center">
          <div className="w-10 h-10 bg-sage-light text-sage rounded-xl flex items-center justify-center mx-auto mb-4 shadow-inner">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <h1 className="font-serif text-3xl font-normal text-ink tracking-tight">TherapyDesk</h1>
          <p className="text-xs text-stone-550 font-light mt-1.5 font-sans">Secure Clinic Management & AI SOAP Notes</p>
        </div>

        {/* Tab Selector */}
        <div className="px-8 mb-6">
          <div className="flex bg-zinc-100 rounded-lg p-1 border border-zinc-200/50">
            <button
              className={`flex-1 py-1.5 text-center text-xs font-semibold rounded-md transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:pointer-events-none ${authAction === "signin" ? "bg-white text-zinc-950 shadow-sm" : "text-zinc-550 hover:text-zinc-950"}`}
              type="button"
              disabled={isAuthenticating}
              onClick={() => setAuthAction("signin")}
            >
              Access Practice
            </button>
            <button
              className={`flex-1 py-1.5 text-center text-xs font-semibold rounded-md transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:pointer-events-none ${authAction === "signup" ? "bg-white text-zinc-950 shadow-sm" : "text-zinc-550 hover:text-zinc-950"}`}
              type="button"
              disabled={isAuthenticating}
              onClick={() => setAuthAction("signup")}
            >
              Create Portal
            </button>
          </div>
        </div>

        {/* Login/Signup Forms */}
        <form className="px-8 pb-8 space-y-4" onSubmit={onSubmit}>
          {authAction === "signup" && (
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-zinc-700">Full Name</label>
              <input
                className="w-full px-3.5 py-2 bg-transparent border border-zinc-200 rounded-lg text-xs text-zinc-900 outline-none placeholder:text-zinc-400 focus-visible:ring-1 focus-visible:ring-zinc-950 focus-visible:border-zinc-950 shadow-sm transition disabled:opacity-50 disabled:pointer-events-none"
                type="text"
                placeholder="Dr. Riya Shah"
                value={fullNameInput}
                onChange={(e) => setFullNameInput(e.target.value)}
                required
                disabled={isAuthenticating}
              />
            </div>
          )}
          
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-zinc-700">Email Address</label>
            <input
              className="w-full px-3.5 py-2 bg-transparent border border-zinc-200 rounded-lg text-xs text-zinc-900 outline-none placeholder:text-zinc-400 focus-visible:ring-1 focus-visible:ring-zinc-950 focus-visible:border-zinc-950 shadow-sm transition disabled:opacity-50 disabled:pointer-events-none"
              type="email"
              placeholder="operator@practicedesk.com"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              required
              disabled={isAuthenticating}
            />
          </div>
          
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-zinc-700">Password Credentials</label>
            <input
              className="w-full px-3.5 py-2 bg-transparent border border-zinc-200 rounded-lg text-xs text-zinc-900 outline-none placeholder:text-zinc-400 focus-visible:ring-1 focus-visible:ring-zinc-950 focus-visible:border-zinc-950 shadow-sm transition disabled:opacity-50 disabled:pointer-events-none"
              type="password"
              placeholder="••••••••"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              required
              disabled={isAuthenticating}
            />
          </div>

          {authError && (
            <div className="flex items-center gap-2 text-xs text-red-650 bg-red-50 border border-red-200 rounded-xl p-3">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600" />
              <span className="font-medium text-red-800">{authError}</span>
            </div>
          )}

          <button 
            className="w-full py-2.5 bg-zinc-950 hover:bg-zinc-900 text-white font-semibold text-xs rounded-lg shadow transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer mt-2 disabled:opacity-50 disabled:pointer-events-none" 
            type="submit"
            disabled={isAuthenticating}
          >
            <span>{isAuthenticating ? "Authenticating..." : (authAction === "signup" ? "Initialize Practice Workspace" : "Enter Secure Portal")}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
