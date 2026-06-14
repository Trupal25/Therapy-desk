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
  onUpdatePassword
}: SettingsViewProps) {
  return (
    <div className="max-w-xl animate-fadeUp space-y-6">
      <div>
        <h2 className="font-serif text-2xl font-normal text-ink">Account & Settings</h2>
        <p className="text-xs text-stone-400 font-light mt-0.5">Update professional details and authentication password.</p>
      </div>

      {/* PROFILE DETAILS CARD */}
      <div className="bg-white border border-stone-200/70 rounded-xl overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-stone-150 bg-stone-50 flex items-center gap-2">
          <User className="w-4 h-4 text-sage" />
          <h3 className="text-xs font-bold text-ink uppercase tracking-wider">Clinical Professional Profile</h3>
        </div>
        <form onSubmit={onSaveProfile} className="p-5 space-y-4">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-stone-600">Full Name</label>
            <input
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs text-ink outline-none focus:border-sage focus:bg-white"
              type="text"
              placeholder="Dr. Riya Shah"
              value={profName}
              onChange={(e) => setProfName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-stone-600">Specialisation Area</label>
            <select
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs text-ink outline-none focus:border-sage focus:bg-white"
              value={profSpec}
              onChange={(e) => setProfSpec(e.target.value)}
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

          {profileError && <div className="text-xs text-red font-medium">{profileError}</div>}
          
          <button 
            className="px-5 py-2.5 bg-ink hover:bg-sage text-white font-semibold text-xs rounded-lg shadow transition cursor-pointer"
            type="submit"
          >
            Save Profile Info
          </button>
        </form>
      </div>

      {/* PASSWORD SECURITY CARD */}
      <div className="bg-white border border-stone-200/70 rounded-xl overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-stone-150 bg-stone-50 flex items-center gap-2">
          <Key className="w-4 h-4 text-sage" />
          <h3 className="text-xs font-bold text-ink uppercase tracking-wider">Account Password Authentication</h3>
        </div>
        <form onSubmit={onUpdatePassword} className="p-5 space-y-4">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-stone-600">Current Password</label>
            <input
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs text-ink outline-none focus:border-sage focus:bg-white"
              type="password"
              placeholder="Current password"
              value={pwCur}
              onChange={(e) => setPwCur(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-stone-600">New Password</label>
            <input
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs text-ink outline-none focus:border-sage focus:bg-white"
              type="password"
              placeholder="Minimum 6 characters"
              value={pwNew}
              onChange={(e) => setPwNew(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-stone-600">Confirm New Password</label>
            <input
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs text-ink outline-none focus:border-sage focus:bg-white"
              type="password"
              placeholder="Re-enter new password"
              value={pwNew2}
              onChange={(e) => setPwNew2(e.target.value)}
              required
            />
          </div>

          {pwError && <div className="text-xs text-red font-medium">{pwError}</div>}
          
          <button 
            className="px-5 py-2.5 bg-ink hover:bg-sage text-white font-semibold text-xs rounded-lg shadow transition cursor-pointer"
            type="submit"
          >
            Update Credentials
          </button>
        </form>
      </div>
    </div>
  );
}
