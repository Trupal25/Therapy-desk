import { User, Key } from "lucide-react";

interface SettingsViewProps {
  profName: string;
  setProfName: (val: string) => void;
  profSpec: string;
  setProfSpec: (val: string) => void;
  profileError: string;
  pwCur: string;
  setPwCur: (val: string) => void;
  pwNew: string;
  setPwNew: (val: string) => void;
  pwNew2: string;
  setPwNew2: (val: string) => void;
  pwError: string;
  onSaveProfile: (e: React.FormEvent) => void;
  onUpdatePassword: (e: React.FormEvent) => void;
  isSavingProfile?: boolean;
  isUpdatingPassword?: boolean;
}

export function SettingsView({
  profName,
  setProfName,
  profSpec,
  setProfSpec,
  profileError,
  pwCur,
  setPwCur,
  pwNew,
  setPwNew,
  pwNew2,
  setPwNew2,
  pwError,
  onSaveProfile,
  onUpdatePassword,
  isSavingProfile = false,
  isUpdatingPassword = false
}: SettingsViewProps) {
  return (
    <div className="max-w-xl animate-fadeUp space-y-6 font-sans">
      {/* Title */}
      <div>
        <h2 className="font-serif text-2xl font-normal text-ink">Account Settings</h2>
        <p className="text-xs text-stone-400 font-light mt-0.5">Manage practitioner profile, choose therapy focus areas, and rotate password credentials.</p>
      </div>

      {/* PROFILE DETAILS CARD */}
      <div className="bg-white border border-stone-200/70 rounded-2xl overflow-hidden shadow-sm hover:border-stone-300 transition duration-300">
        <div className="px-5 py-4 border-b border-stone-150 bg-stone-50/20 flex items-center gap-2">
          <User className="w-4 h-4 text-zinc-500" />
          <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider block">Practitioner Profile</h3>
        </div>
        <form onSubmit={onSaveProfile} className="p-5 space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-zinc-700">Full Name</label>
            <input
              className="w-full px-3.5 py-2 bg-transparent border border-zinc-200 rounded-lg text-xs text-zinc-900 outline-none placeholder:text-zinc-400 focus-visible:ring-1 focus-visible:ring-zinc-950 focus-visible:border-zinc-950 shadow-sm transition disabled:opacity-50 disabled:pointer-events-none"
              type="text"
              placeholder="e.g. Dr. Sunita Rao"
              value={profName}
              onChange={(e) => setProfName(e.target.value)}
              required
              disabled={isSavingProfile}
            />
          </div>
          
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-zinc-700">Clinical Specialisation</label>
            <select
              className="w-full px-3.5 py-2 bg-white border border-zinc-200 rounded-lg text-xs text-zinc-900 outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 focus-visible:border-zinc-950 shadow-sm transition cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
              value={profSpec}
              onChange={(e) => setProfSpec(e.target.value)}
              disabled={isSavingProfile}
            >
              <option>General</option>
              <option>CBT</option>
              <option>Trauma</option>
              <option>Anxiety</option>
              <option>Depression</option>
              <option>Child & Adolescent</option>
              <option>Couples</option>
            </select>
          </div>

          {profileError && <div className="text-xs text-red-600 font-medium">{profileError}</div>}
          
          <button 
            className="px-5 py-2.5 bg-zinc-950 hover:bg-zinc-900 text-white font-semibold text-xs rounded-lg shadow transition cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
            type="submit"
            disabled={isSavingProfile}
          >
            {isSavingProfile ? "Saving..." : "Save Profile Info"}
          </button>
        </form>
      </div>

      {/* PASSWORD SECURITY CARD */}
      <div className="bg-white border border-stone-200/70 rounded-2xl overflow-hidden shadow-sm hover:border-stone-300 transition duration-300">
        <div className="px-5 py-4 border-b border-stone-150 bg-stone-50/20 flex items-center gap-2">
          <Key className="w-4 h-4 text-zinc-500" />
          <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider block">Account Authentication Credentials</h3>
        </div>
        <form onSubmit={onUpdatePassword} className="p-5 space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-zinc-700">Current Password</label>
            <input
              className="w-full px-3.5 py-2 bg-transparent border border-zinc-200 rounded-lg text-xs text-zinc-900 outline-none placeholder:text-zinc-400 focus-visible:ring-1 focus-visible:ring-zinc-950 focus-visible:border-zinc-950 shadow-sm transition disabled:opacity-50 disabled:pointer-events-none"
              type="password"
              placeholder="Enter current password"
              value={pwCur}
              onChange={(e) => setPwCur(e.target.value)}
              required
              disabled={isUpdatingPassword}
            />
          </div>
          
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-zinc-700">New Password</label>
            <input
              className="w-full px-3.5 py-2 bg-transparent border border-zinc-200 rounded-lg text-xs text-zinc-900 outline-none placeholder:text-zinc-400 focus-visible:ring-1 focus-visible:ring-zinc-950 focus-visible:border-zinc-950 shadow-sm transition disabled:opacity-50 disabled:pointer-events-none"
              type="password"
              placeholder="Minimum 6 characters"
              value={pwNew}
              onChange={(e) => setPwNew(e.target.value)}
              required
              disabled={isUpdatingPassword}
            />
          </div>
          
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-zinc-700">Confirm New Password</label>
            <input
              className="w-full px-3.5 py-2 bg-transparent border border-zinc-200 rounded-lg text-xs text-zinc-900 outline-none placeholder:text-zinc-400 focus-visible:ring-1 focus-visible:ring-zinc-950 focus-visible:border-zinc-950 shadow-sm transition disabled:opacity-50 disabled:pointer-events-none"
              type="password"
              placeholder="Confirm new password"
              value={pwNew2}
              onChange={(e) => setPwNew2(e.target.value)}
              required
              disabled={isUpdatingPassword}
            />
          </div>

          {pwError && <div className="text-xs text-red-600 font-medium">{pwError}</div>}
          
          <button 
            className="px-5 py-2.5 bg-zinc-950 hover:bg-zinc-900 text-white font-semibold text-xs rounded-lg shadow transition cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
            type="submit"
            disabled={isUpdatingPassword}
          >
            {isUpdatingPassword ? "Updating..." : "Update Credentials"}
          </button>
        </form>
      </div>
    </div>
  );
}
