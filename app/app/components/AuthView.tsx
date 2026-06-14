import { ArrowRight, AlertCircle } from "lucide-react";

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
  onSubmit
}: AuthViewProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-50 via-mist to-sage-light/30 font-sans p-6">
      <div className="w-full max-w-[420px] bg-white border border-stone-200/80 rounded-2xl shadow-xl shadow-stone-900/5 overflow-hidden transition-all duration-300">
        <div className="p-8 pb-4 text-center">
          <h1 className="font-serif text-3xl font-normal text-ink tracking-tight mb-2">TherapyDesk</h1>
          <p className="text-sm text-stone-500">Practice Management & Smart Notes</p>
        </div>

        <div className="px-8 mb-6">
          <div className="flex bg-stone-100 rounded-lg p-1">
            <button
              className={`flex-1 py-2 text-center text-xs font-semibold rounded-md transition-all duration-200 ${authAction === "signin" ? "bg-white text-ink shadow-sm" : "text-stone-500 hover:text-ink"}`}
              onClick={() => setAuthAction("signin")}
            >
              Sign In
            </button>
            <button
              className={`flex-1 py-2 text-center text-xs font-semibold rounded-md transition-all duration-200 ${authAction === "signup" ? "bg-white text-ink shadow-sm" : "text-stone-500 hover:text-ink"}`}
              onClick={() => setAuthAction("signup")}
            >
              Create Account
            </button>
          </div>
        </div>

        <form className="px-8 pb-8 space-y-4" onSubmit={onSubmit}>
          {authAction === "signup" && (
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-stone-600">Full Name</label>
              <input
                className="w-full px-3.5 py-2.5 bg-mist border border-stone-200 rounded-lg text-sm text-ink outline-none transition-all duration-200 focus:border-sage focus:bg-white"
                type="text"
                placeholder="Dr. Riya Shah"
                value={fullNameInput}
                onChange={(e) => setFullNameInput(e.target.value)}
                required
              />
            </div>
          )}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-stone-600">Email Address</label>
            <input
              className="w-full px-3.5 py-2.5 bg-mist border border-stone-200 rounded-lg text-sm text-ink outline-none transition-all duration-200 focus:border-sage focus:bg-white"
              type="email"
              placeholder="you@example.com"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-stone-600">Password</label>
            <input
              className="w-full px-3.5 py-2.5 bg-mist border border-stone-200 rounded-lg text-sm text-ink outline-none transition-all duration-200 focus:border-sage focus:bg-white"
              type="password"
              placeholder="••••••••"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              required
            />
          </div>

          {authError && (
            <div className="flex items-center gap-2 text-xs text-red bg-red-light border border-red/10 rounded-lg p-3">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <button 
            className="w-full py-3 bg-ink hover:bg-sage text-white font-medium text-sm rounded-lg shadow-sm hover:shadow transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer mt-2" 
            type="submit"
          >
            <span>{authAction === "signup" ? "Create practice account" : "Access your practice"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
