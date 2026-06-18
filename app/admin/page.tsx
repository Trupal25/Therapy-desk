"use client";

import { useEffect, useState, useCallback } from "react";
import { 
  Lock, 
  Unlock, 
  Activity, 
  Users, 
  Building2, 
  FileText, 
  Key, 
  LogOut, 
  Search, 
  Check, 
  X, 
  RotateCw, 
  TrendingUp, 
  ShieldAlert, 
  Eye, 
  Plus, 
  Clock, 
  Zap, 
  ExternalLink,
  ChevronRight,
  Database
} from "lucide-react";

interface OrganizationData {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  deletedAt: string | null;
  ownerName: string;
  ownerEmail: string;
  plan: "free" | "pro" | "enterprise";
  status: string;
  usage: number;
  limit: number;
}

interface AuditLogData {
  id: string;
  organizationId: string;
  orgName: string;
  actorId: string | null;
  actorIp: string | null;
  actorUserAgent: string | null;
  eventType: string;
  resourceType: string | null;
  resourceId: string | null;
  metadata: any;
  createdAt: string;
}

interface KeyData {
  id: string;
  organizationId: string;
  orgName: string;
  keyVersion: number;
  algorithm: string;
  kmsKeyId: string | null;
  createdAt: string;
  rotatedAt: string | null;
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "practices" | "audit" | "keys">("overview");

  // Tab states
  const [overviewData, setOverviewData] = useState<any>(null);
  const [practices, setPractices] = useState<OrganizationData[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogData[]>([]);
  const [keys, setKeys] = useState<KeyData[]>([]);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [planFilter, setPlanFilter] = useState("all");

  // Edit Modal State
  const [selectedPractice, setSelectedPractice] = useState<OrganizationData | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalPlan, setModalPlan] = useState<"free" | "pro" | "enterprise">("free");
  const [modalActive, setModalActive] = useState(true);
  const [modalError, setModalError] = useState("");
  const [modalLoading, setModalLoading] = useState(false);

  // Toast State
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"ok" | "err">("ok");
  const [toastVisible, setToastVisible] = useState(false);

  const showToast = (msg: string, type: "ok" | "err" = "ok") => {
    setToastMessage(msg);
    setToastType(type);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3000);
  };

  // Check auth on load
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/admin?tab=overview");
        if (res.ok) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch {
        setIsAuthenticated(false);
      }
    }
    checkAuth();
  }, []);

  // Fetch data depending on active tab
  const fetchData = useCallback(async () => {
    if (isAuthenticated !== true) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin?tab=${activeTab}`);
      if (res.ok) {
        const data = await res.json();
        if (activeTab === "overview") setOverviewData(data);
        else if (activeTab === "practices") setPractices(data);
        else if (activeTab === "audit") setAuditLogs(data);
        else if (activeTab === "keys") setKeys(data);
      } else if (res.status === 401) {
        setIsAuthenticated(false);
      } else {
        showToast("Failed to fetch admin data", "err");
      }
    } catch (err) {
      showToast("Connection to admin server failed", "err");
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, activeTab]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Login handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "login", passcode }),
      });
      if (res.ok) {
        setIsAuthenticated(true);
        setPasscode("");
      } else {
        const data = await res.json();
        setError(data.error || "Incorrect admin passcode");
      }
    } catch {
      setError("Unable to reach authentication server");
    } finally {
      setLoading(false);
    }
  };

  // Logout handler
  const handleLogout = async () => {
    try {
      await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "logout" }),
      });
    } catch (e) {
      console.error("Sign out error", e);
    }
    setIsAuthenticated(false);
    showToast("Signed out successfully");
  };

  // Update practice plan & status
  const handleUpdatePractice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPractice) return;
    setModalLoading(true);
    setModalError("");

    try {
      // 1. Update plan
      let res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_plan",
          practiceId: selectedPractice.id,
          plan: modalPlan,
        }),
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed to update plan");
      }

      // 2. Update active/inactive status
      res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "toggle_active",
          practiceId: selectedPractice.id,
          active: modalActive,
        }),
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed to toggle status");
      }

      showToast(`Updated practice: ${selectedPractice.name}`);
      setModalOpen(false);
      fetchData();
    } catch (err: any) {
      setModalError(err.message || "An unexpected error occurred");
    } finally {
      setModalLoading(false);
    }
  };

  // Rotate Key action
  const handleRotateKey = async (practiceId: string, orgName: string) => {
    if (!confirm(`Are you sure you want to rotate the database encryption key for ${orgName}?`)) return;
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "rotate_key", practiceId }),
      });
      if (res.ok) {
        showToast("Key rotated successfully. Key version incremented.");
        fetchData();
      } else {
        const d = await res.json();
        showToast(d.error || "Failed to rotate key", "err");
      }
    } catch {
      showToast("Failed to connect to server", "err");
    }
  };

  // Filters
  const filteredPractices = practices.filter(p => {
    const matchesSearch = 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.ownerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.slug.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesPlan = planFilter === "all" || p.plan === planFilter;
    return matchesSearch && matchesPlan;
  });

  const filteredAuditLogs = auditLogs.filter(l => {
    return (
      l.orgName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.eventType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (l.actorIp && l.actorIp.includes(searchQuery))
    );
  });

  const filteredKeys = keys.filter(k => {
    return k.orgName.toLowerCase().includes(searchQuery.toLowerCase()) || k.organizationId.includes(searchQuery);
  });

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center text-white">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-stone-400 font-light tracking-wide">Connecting to administrative database...</p>
        </div>
      </div>
    );
  }

  // Login screen layout
  if (isAuthenticated === false) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center font-sans p-6 relative overflow-hidden">
        {/* Decorative Gradients */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="w-full max-w-[400px] bg-stone-900/60 backdrop-blur-xl border border-stone-800 rounded-2xl shadow-2xl p-8 relative z-10">
          <div className="text-center mb-8">
            <h1 className="font-serif text-3xl font-normal text-white tracking-tight flex items-center justify-center gap-2">
              <Database className="w-6 h-6 text-emerald-500" />
              <span>TherapyDesk</span>
            </h1>
            <p className="text-xs text-stone-500 uppercase tracking-widest mt-2 font-semibold">Operations Admin Panel</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-stone-400 uppercase tracking-wider">Passcode Access</label>
              <div className="relative">
                <input
                  className="w-full px-4 py-3 bg-stone-950 border border-stone-800 rounded-xl text-center text-lg text-emerald-400 font-mono tracking-widest outline-none transition duration-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  type="password"
                  placeholder="••••••••"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  autoFocus
                  required
                />
                <Lock className="w-4 h-4 text-stone-600 absolute left-4 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-xs text-red-400 bg-red-950/30 border border-red-900/50 rounded-xl p-3">
                <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-stone-800 text-white font-medium text-sm rounded-xl shadow-lg shadow-emerald-900/20 hover:shadow-emerald-500/20 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer font-semibold"
            >
              <span>{loading ? "Authenticating Operator..." : "Authenticate Access"}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </form>

          <p className="text-[10px] text-stone-600 text-center mt-6">
            System logs records IP and agent payload. Unauthorized accesses are audited.
          </p>
        </div>
      </div>
    );
  }

  // Dashboard layout
  return (
    <div className="min-h-screen bg-stone-950 text-stone-200 font-sans flex flex-col md:flex-row relative">
      {/* Sidebar Operations Navigation */}
      <aside className="w-full md:w-64 bg-stone-900 border-r border-stone-800 flex-shrink-0 flex flex-col justify-between">
        <div>
          {/* Brand Logo */}
          <div className="p-6 border-b border-stone-800 flex items-center justify-between">
            <div>
              <h2 className="font-serif text-2xl font-normal text-white tracking-tight flex items-center gap-2">
                <Database className="w-5 h-5 text-emerald-500" />
                <span>TherapyDesk</span>
              </h2>
              <p className="text-[10px] text-stone-500 uppercase tracking-widest font-semibold mt-1">Platform Admin</p>
            </div>
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-lg shadow-emerald-500/50"></div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            <button
              onClick={() => { setActiveTab("overview"); setSearchQuery(""); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer
                ${activeTab === "overview" ? "bg-emerald-600 text-white shadow-lg shadow-emerald-900/30" : "text-stone-400 hover:bg-stone-800 hover:text-white"}`}
            >
              <Activity className="w-4 h-4" />
              <span>Dashboard Overview</span>
            </button>
            <button
              onClick={() => { setActiveTab("practices"); setSearchQuery(""); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer
                ${activeTab === "practices" ? "bg-emerald-600 text-white shadow-lg shadow-emerald-900/30" : "text-stone-400 hover:bg-stone-800 hover:text-white"}`}
            >
              <Building2 className="w-4 h-4" />
              <span>Practices Directory</span>
            </button>
            <button
              onClick={() => { setActiveTab("audit"); setSearchQuery(""); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer
                ${activeTab === "audit" ? "bg-emerald-600 text-white shadow-lg shadow-emerald-900/30" : "text-stone-400 hover:bg-stone-800 hover:text-white"}`}
            >
              <FileText className="w-4 h-4" />
              <span>System Audit Logs</span>
            </button>
            <button
              onClick={() => { setActiveTab("keys"); setSearchQuery(""); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer
                ${activeTab === "keys" ? "bg-emerald-600 text-white shadow-lg shadow-emerald-900/30" : "text-stone-400 hover:bg-stone-800 hover:text-white"}`}
            >
              <Key className="w-4 h-4" />
              <span>Encryption Keys</span>
            </button>
          </nav>
        </div>

        {/* Footer profile & Sign Out */}
        <div className="p-4 border-t border-stone-850 bg-stone-950/40 space-y-3">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-950 text-emerald-400 font-bold text-xs flex items-center justify-center">
              OP
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-semibold text-white truncate">Platform Operator</h4>
              <p className="text-[10px] text-stone-500">Root Credentials</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full py-2.5 bg-stone-800 hover:bg-red-950/60 hover:text-red-400 text-stone-400 font-semibold text-xs rounded-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer border border-stone-700 hover:border-red-900/30"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Terminate Session</span>
          </button>
        </div>
      </aside>

      {/* Main Operations Container */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto max-h-screen">
        {/* Top bar header */}
        <header className="sticky top-0 z-20 bg-stone-950/80 backdrop-blur-md border-b border-stone-850 p-6 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-xl font-serif text-white tracking-tight flex items-center gap-2 capitalize">
              {activeTab} Operations Panel
            </h1>
            <p className="text-[11px] text-stone-500 font-light mt-0.5">Manage practices, subscriptions, and system logs.</p>
          </div>

          {/* Real-time metrics loading state */}
          <div className="flex items-center gap-4">
            {loading && (
              <span className="text-[10px] text-stone-500 animate-pulse flex items-center gap-1">
                <RotateCw className="w-3 h-3 animate-spin text-emerald-500" />
                <span>Refreshing...</span>
              </span>
            )}
          </div>
        </header>

        {/* Content Container */}
        <div className="p-6 md:p-8 space-y-6">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && overviewData && (
            <div className="space-y-6 animate-fadeUp">
              
              {/* Operational KPI Counters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                <div className="bg-stone-900 border border-stone-800 p-5 rounded-2xl flex items-center justify-between hover:border-emerald-500/30 transition duration-200">
                  <div className="space-y-1.5">
                    <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider">Total Practices</span>
                    <h3 className="text-3xl font-serif text-white leading-none">{overviewData.totalOrgs}</h3>
                    <span className="text-[9px] text-emerald-400 bg-emerald-950/50 border border-emerald-900/30 px-2 py-0.5 rounded-full inline-block font-medium">
                      Multi-tenant scoped
                    </span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-950/60 text-emerald-400 flex items-center justify-center">
                    <Building2 className="w-5 h-5" />
                  </div>
                </div>

                <div className="bg-stone-900 border border-stone-800 p-5 rounded-2xl flex items-center justify-between hover:border-emerald-500/30 transition duration-200">
                  <div className="space-y-1.5">
                    <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider">Registered Practitioners</span>
                    <h3 className="text-3xl font-serif text-white leading-none">{overviewData.totalUsers}</h3>
                    <span className="text-[9px] text-emerald-400 bg-emerald-950/50 border border-emerald-900/30 px-2 py-0.5 rounded-full inline-block font-medium">
                      Active accounts
                    </span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-950/60 text-emerald-400 flex items-center justify-center">
                    <Users className="w-5 h-5" />
                  </div>
                </div>

                <div className="bg-stone-900 border border-stone-800 p-5 rounded-2xl flex items-center justify-between hover:border-emerald-500/30 transition duration-200">
                  <div className="space-y-1.5">
                    <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider">Clinical SOAP Notes</span>
                    <h3 className="text-3xl font-serif text-white leading-none">{overviewData.totalNotes}</h3>
                    <span className="text-[9px] text-emerald-400 bg-emerald-950/50 border border-emerald-900/30 px-2 py-0.5 rounded-full inline-block font-medium">
                      AI structured summaries
                    </span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-950/60 text-emerald-400 flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                </div>

                <div className="bg-stone-900 border border-stone-800 p-5 rounded-2xl flex items-center justify-between hover:border-emerald-500/30 transition duration-200">
                  <div className="space-y-1.5">
                    <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider">Pro Accounts</span>
                    <h3 className="text-3xl font-serif text-white leading-none">
                      {overviewData.plans?.pro || 0}
                    </h3>
                    <span className="text-[9px] text-teal-400 bg-teal-950/50 border border-teal-900/30 px-2 py-0.5 rounded-full inline-block font-medium">
                      Paying subscription tier
                    </span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-teal-950/60 text-teal-400 flex items-center justify-center">
                    <Zap className="w-5 h-5" />
                  </div>
                </div>

              </div>

              {/* Two-Column Overview Data */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Subscription tiers bars */}
                <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold text-white">Subscription Distribution</h4>
                    <p className="text-[11px] text-stone-500 font-light mt-0.5">Limits enforcement details per tier</p>
                  </div>

                  <div className="space-y-4 pt-2">
                    {/* Free Plan */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold text-stone-300">Free Practice (Trialing)</span>
                        <span className="font-mono text-stone-500">
                          {overviewData.plans?.free || 0} orgs
                        </span>
                      </div>
                      <div className="h-2.5 bg-stone-950 border border-stone-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-stone-500 rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(5, (overviewData.plans?.free / (overviewData.totalOrgs || 1)) * 100)}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Pro Plan */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold text-emerald-400">TherapyDesk Pro</span>
                        <span className="font-mono text-emerald-400">
                          {overviewData.plans?.pro || 0} orgs
                        </span>
                      </div>
                      <div className="h-2.5 bg-stone-950 border border-stone-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(5, (overviewData.plans?.pro / (overviewData.totalOrgs || 1)) * 100)}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Enterprise Plan */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold text-teal-400">Enterprise Clinics</span>
                        <span className="font-mono text-teal-400">
                          {overviewData.plans?.enterprise || 0} orgs
                        </span>
                      </div>
                      <div className="h-2.5 bg-stone-950 border border-stone-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-teal-500 rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(5, (overviewData.plans?.enterprise / (overviewData.totalOrgs || 1)) * 100)}%` }}
                        ></div>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Recent Practices Activity Feed */}
                <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden">
                  <div className="p-6 border-b border-stone-800 flex justify-between items-center">
                    <div>
                      <h4 className="text-sm font-semibold text-white">Recent Practices Created</h4>
                      <p className="text-[11px] text-stone-500 font-light mt-0.5">Most recent tenant accounts</p>
                    </div>
                    <Clock className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div className="divide-y divide-stone-800">
                    {overviewData.recentPractices?.length === 0 ? (
                      <div className="p-6 text-center text-xs text-stone-500 font-light">
                        No registrations recorded in DB.
                      </div>
                    ) : (
                      overviewData.recentPractices?.map((p: any) => (
                        <div key={p.id} className="p-4 flex justify-between items-center text-xs">
                          <div>
                            <span className="font-semibold text-white block">{p.name}</span>
                            <span className="text-[10px] text-stone-500 font-mono">slug: {p.slug}</span>
                          </div>
                          <div className="text-right">
                            <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full uppercase tracking-wider inline-block
                              ${p.plan === 'pro' ? 'bg-emerald-950 text-emerald-400 border border-emerald-900/50' : p.plan === 'enterprise' ? 'bg-teal-950 text-teal-400 border border-teal-900/50' : 'bg-stone-800 text-stone-400'}`}>
                              {p.plan}
                            </span>
                            <span className="block text-[9px] text-stone-500 mt-1">
                              {new Date(p.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>

              {/* Recent System-wide Audit Events */}
              <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-stone-800">
                  <h4 className="text-sm font-semibold text-white">Recent System Audit Feed</h4>
                  <p className="text-[11px] text-stone-500 font-light mt-0.5">Append-only immutable record trigger</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-stone-950 text-stone-400">
                        <th className="p-4 font-semibold uppercase tracking-wider text-[10px]">Timestamp</th>
                        <th className="p-4 font-semibold uppercase tracking-wider text-[10px]">Event</th>
                        <th className="p-4 font-semibold uppercase tracking-wider text-[10px]">Resource</th>
                        <th className="p-4 font-semibold uppercase tracking-wider text-[10px]">IP Address</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-800">
                      {overviewData.recentAudit?.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="p-8 text-center text-stone-500 font-light">
                            No logs registered.
                          </td>
                        </tr>
                      ) : (
                        overviewData.recentAudit?.map((log: any) => (
                          <tr key={log.id} className="hover:bg-stone-850/50 transition">
                            <td className="p-4 font-mono text-[11px] text-stone-400">
                              {new Date(log.createdAt).toLocaleString()}
                            </td>
                            <td className="p-4">
                              <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full uppercase tracking-wider
                                ${log.eventType === 'create' ? 'bg-emerald-950 text-emerald-400 border border-emerald-900/30' : log.eventType === 'login' ? 'bg-teal-950 text-teal-400 border border-teal-900/30' : 'bg-stone-800 text-stone-400'}`}>
                                {log.eventType}
                              </span>
                            </td>
                            <td className="p-4 text-stone-300 font-medium font-mono text-[10px]">
                              {log.resourceType || 'system'}:{log.resourceId?.substring(0, 8) || 'N/A'}
                            </td>
                            <td className="p-4 font-mono text-stone-500 text-[11px]">
                              {log.actorIp || '127.0.0.1'}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: PRACTICES DIRECTORY */}
          {activeTab === "practices" && (
            <div className="space-y-6 animate-fadeUp">
              
              {/* Search / Filter Bar */}
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-stone-900 border border-stone-800 p-4 rounded-2xl">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    className="w-full pl-9 pr-4 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-xs text-white placeholder-stone-500 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                    type="text"
                    placeholder="Search practices name, owner email, slugs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <span className="text-xs text-stone-400 font-semibold uppercase tracking-wider whitespace-nowrap">Tier:</span>
                  <select
                    className="px-3.5 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-xs text-stone-300 outline-none focus:border-emerald-500 cursor-pointer w-full sm:w-auto"
                    value={planFilter}
                    onChange={(e) => setPlanFilter(e.target.value)}
                  >
                    <option value="all">All Plans</option>
                    <option value="free">Free</option>
                    <option value="pro">Pro</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </div>
              </div>

              {/* Table list */}
              <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-stone-950 text-stone-400 border-b border-stone-800">
                        <th className="p-4 font-semibold uppercase tracking-wider text-[10px]">Practice Info</th>
                        <th className="p-4 font-semibold uppercase tracking-wider text-[10px]">Owner Practitioner</th>
                        <th className="p-4 font-semibold uppercase tracking-wider text-[10px]">Plan Level</th>
                        <th className="p-4 font-semibold uppercase tracking-wider text-[10px]">Usage Status</th>
                        <th className="p-4 font-semibold uppercase tracking-wider text-[10px]">Status</th>
                        <th className="p-4 font-semibold uppercase tracking-wider text-[10px]">Registered Date</th>
                        <th className="p-4 font-semibold uppercase tracking-wider text-[10px] text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-850">
                      {filteredPractices.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="p-8 text-center text-stone-500 font-light">
                            No matching practices found.
                          </td>
                        </tr>
                      ) : (
                        filteredPractices.map((p) => (
                          <tr key={p.id} className="hover:bg-stone-850/30 transition">
                            <td className="p-4">
                              <span className="font-semibold text-white block text-sm">{p.name}</span>
                              <span className="text-[10px] text-stone-500 font-mono mt-0.5 block">slug: {p.slug}</span>
                            </td>
                            <td className="p-4">
                              <span className="text-stone-300 font-medium block">{p.ownerName}</span>
                              <span className="text-[10px] text-stone-500 block">{p.ownerEmail}</span>
                            </td>
                            <td className="p-4">
                              <span className={`px-2.5 py-0.5 text-[9px] font-bold rounded-full uppercase tracking-wider inline-block
                                ${p.plan === 'pro' ? 'bg-emerald-950 text-emerald-400 border border-emerald-900/40' : p.plan === 'enterprise' ? 'bg-teal-950 text-teal-400 border border-teal-900/40' : 'bg-stone-800 text-stone-400'}`}>
                                {p.plan}
                              </span>
                            </td>
                            <td className="p-4">
                              <div className="space-y-1">
                                <span className="text-stone-300 font-medium block text-[11px]">
                                  {p.usage} / {p.limit} notes
                                </span>
                                <div className="w-24 h-1.5 bg-stone-950 border border-stone-800 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-emerald-500 rounded-full"
                                    style={{ width: `${Math.min(100, (p.usage / p.limit) * 100)}%` }}
                                  ></div>
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              <span className={`inline-flex items-center gap-1 text-[10px] font-semibold
                                ${p.deletedAt ? 'text-red-400' : 'text-emerald-400'}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${p.deletedAt ? 'bg-red-500' : 'bg-emerald-500'}`}></span>
                                <span>{p.deletedAt ? 'Suspended' : 'Active'}</span>
                              </span>
                            </td>
                            <td className="p-4 font-mono text-[11px] text-stone-400">
                              {new Date(p.createdAt).toLocaleDateString()}
                            </td>
                            <td className="p-4 text-right">
                              <button
                                onClick={() => {
                                  setSelectedPractice(p);
                                  setModalPlan(p.plan);
                                  setModalActive(!p.deletedAt);
                                  setModalError("");
                                  setModalOpen(true);
                                }}
                                className="px-3.5 py-1.5 bg-stone-800 hover:bg-stone-750 hover:text-white border border-stone-700 rounded-xl text-xs font-semibold shadow transition cursor-pointer"
                              >
                                Edit Settings
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: SYSTEM AUDIT LOGS */}
          {activeTab === "audit" && (
            <div className="space-y-6 animate-fadeUp">
              
              {/* Search bar */}
              <div className="flex bg-stone-900 border border-stone-800 p-4 rounded-2xl">
                <div className="relative w-full sm:w-96">
                  <Search className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    className="w-full pl-9 pr-4 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-xs text-white placeholder-stone-500 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                    type="text"
                    placeholder="Filter logs by organization name, event type, actor IP..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {/* Audit logs listing */}
              <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-stone-950 text-stone-400 border-b border-stone-800">
                        <th className="p-4 font-semibold uppercase tracking-wider text-[10px]">Timestamp</th>
                        <th className="p-4 font-semibold uppercase tracking-wider text-[10px]">Practice Scope</th>
                        <th className="p-4 font-semibold uppercase tracking-wider text-[10px]">Event Type</th>
                        <th className="p-4 font-semibold uppercase tracking-wider text-[10px]">Resource Reference</th>
                        <th className="p-4 font-semibold uppercase tracking-wider text-[10px]">Network IP</th>
                        <th className="p-4 font-semibold uppercase tracking-wider text-[10px]">Metadata Parameters</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-850 font-mono text-[11px]">
                      {filteredAuditLogs.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-stone-500 font-light font-sans">
                            No matching audit log transactions found.
                          </td>
                        </tr>
                      ) : (
                        filteredAuditLogs.map((log) => (
                          <tr key={log.id} className="hover:bg-stone-850/30 transition">
                            <td className="p-4 text-stone-400">
                              {new Date(log.createdAt).toLocaleString()}
                            </td>
                            <td className="p-4 font-sans font-semibold text-white">
                              {log.orgName}
                            </td>
                            <td className="p-4">
                              <span className={`px-2.5 py-0.5 text-[9px] font-bold rounded-full uppercase tracking-wider inline-block
                                ${log.eventType === 'create' ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-900/30' : log.eventType === 'update' ? 'bg-amber-950/60 text-amber-400 border border-amber-900/30' : log.eventType === 'delete' ? 'bg-red-950/60 text-red-400 border border-red-900/30' : 'bg-stone-800 text-stone-450'}`}>
                                {log.eventType}
                              </span>
                            </td>
                            <td className="p-4 text-stone-300">
                              {log.resourceType || 'system'}:{log.resourceId?.substring(0, 8) || 'N/A'}
                            </td>
                            <td className="p-4 text-stone-500">
                              {log.actorIp || '127.0.0.1'}
                            </td>
                            <td className="p-4 text-[10px] text-stone-500 max-w-xs truncate" title={JSON.stringify(log.metadata)}>
                              {log.metadata ? JSON.stringify(log.metadata) : '{}'}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* TAB 4: ENCRYPTION KEYS MANAGEMENT */}
          {activeTab === "keys" && (
            <div className="space-y-6 animate-fadeUp">
              
              {/* Search bar */}
              <div className="flex bg-stone-900 border border-stone-800 p-4 rounded-2xl">
                <div className="relative w-full sm:w-96">
                  <Search className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    className="w-full pl-9 pr-4 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-xs text-white placeholder-stone-500 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                    type="text"
                    placeholder="Search keys by organization name or database ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {/* Status Alert Banner */}
              <div className="bg-amber-950/30 border border-amber-900/50 text-amber-400 p-5 rounded-2xl flex items-start gap-4 shadow-sm">
                <ShieldAlert className="w-6 h-6 flex-shrink-0 text-amber-500" />
                <div className="space-y-1.5">
                  <h4 className="text-sm font-semibold">Sensitive Cryptographic Data Layer</h4>
                  <p className="text-xs text-stone-400 font-light leading-relaxed">
                    Database keys are encrypted using an AES-256-GCM derivation algorithm. Rotating a key increments the key version for the specific tenant organization context. Old keys should be archived to prevent note decryption failure.
                  </p>
                </div>
              </div>

              {/* Encryption Keys Table */}
              <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-stone-950 text-stone-400 border-b border-stone-800">
                        <th className="p-4 font-semibold uppercase tracking-wider text-[10px]">Practice Organization</th>
                        <th className="p-4 font-semibold uppercase tracking-wider text-[10px]">Algorithm</th>
                        <th className="p-4 font-semibold uppercase tracking-wider text-[10px]">Version ID</th>
                        <th className="p-4 font-semibold uppercase tracking-wider text-[10px]">KMS Reference Key</th>
                        <th className="p-4 font-semibold uppercase tracking-wider text-[10px]">Created At</th>
                        <th className="p-4 font-semibold uppercase tracking-wider text-[10px]">Last Rotated</th>
                        <th className="p-4 font-semibold uppercase tracking-wider text-[10px] text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-850 font-mono text-[11px]">
                      {filteredKeys.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="p-8 text-center text-stone-500 font-light font-sans">
                            No encryption key entities found.
                          </td>
                        </tr>
                      ) : (
                        filteredKeys.map((k) => (
                          <tr key={k.id} className="hover:bg-stone-850/30 transition">
                            <td className="p-4 font-sans font-semibold text-white">
                              {k.orgName}
                            </td>
                            <td className="p-4 text-emerald-400">
                              {k.algorithm}
                            </td>
                            <td className="p-4 text-stone-300 font-bold text-center">
                              {k.keyVersion}
                            </td>
                            <td className="p-4 text-stone-500">
                              {k.kmsKeyId || 'THERAPYDESK_INTERNAL_DEFAULT'}
                            </td>
                            <td className="p-4 text-stone-400">
                              {new Date(k.createdAt).toLocaleDateString()}
                            </td>
                            <td className="p-4 text-amber-500">
                              {k.rotatedAt ? new Date(k.rotatedAt).toLocaleDateString() : 'Never'}
                            </td>
                            <td className="p-4 text-right font-sans">
                              <button
                                onClick={() => handleRotateKey(k.organizationId, k.orgName)}
                                className="px-3 py-1.5 bg-amber-950/80 hover:bg-amber-900 border border-amber-900/50 rounded-xl text-[11px] font-bold text-amber-400 shadow-sm transition flex items-center gap-1.5 ml-auto cursor-pointer"
                              >
                                <RotateCw className="w-3 h-3" />
                                <span>Rotate Key</span>
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

        </div>
      </main>

      {/* OVERLAY DIALOG MODAL FOR PRACTICE SETTINGS */}
      {modalOpen && selectedPractice && (
        <div className="fixed inset-0 bg-stone-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-fadeUp">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl w-full max-w-[460px] p-6 shadow-2xl space-y-6">
            
            {/* Modal Header */}
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-serif text-xl font-normal text-white">Practice Settings Configuration</h3>
                <p className="text-[11px] text-stone-500 mt-1">Tenant Profile: {selectedPractice.name}</p>
              </div>
              <button 
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-stone-950 hover:bg-stone-800 border border-stone-850 flex items-center justify-center text-stone-400 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleUpdatePractice} className="space-y-5">
              
              {/* Plan Tier selection */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-stone-400 uppercase tracking-wider">Plan Subscription Tier</label>
                <select
                  value={modalPlan}
                  onChange={(e) => setModalPlan(e.target.value as any)}
                  className="w-full px-4 py-3 bg-stone-950 border border-stone-800 rounded-xl text-xs text-white outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value="free">Free Trial (10 notes limit)</option>
                  <option value="pro">Pro Practitioner (100 notes limit)</option>
                  <option value="enterprise">Enterprise Clinic (1000 notes limit)</option>
                </select>
              </div>

              {/* Active / Inactive Status toggle */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-stone-400 uppercase tracking-wider">Account Active Status</label>
                <div className="flex items-center justify-between p-4 bg-stone-950 border border-stone-800 rounded-xl">
                  <div className="space-y-0.5">
                    <span className="text-xs font-semibold text-white">Enable Practice Portal</span>
                    <p className="text-[10px] text-stone-500">Allows therapist clinical logins</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={modalActive}
                    onChange={(e) => setModalActive(e.target.checked)}
                    className="w-5 h-5 accent-emerald-500 rounded border-stone-850 bg-stone-950 focus:ring-0 outline-none cursor-pointer"
                  />
                </div>
              </div>

              {modalError && (
                <div className="flex items-center gap-2 text-xs text-red-400 bg-red-950/20 border border-red-900/30 rounded-xl p-3">
                  <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                  <span>{modalError}</span>
                </div>
              )}

              {/* Modal Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-3 bg-stone-950 hover:bg-stone-800 text-stone-400 font-semibold text-xs border border-stone-800 rounded-xl transition cursor-pointer"
                >
                  Cancel changes
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-stone-800 text-white font-semibold text-xs rounded-xl shadow transition cursor-pointer"
                >
                  {modalLoading ? "Saving Configurations..." : "Save Settings"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATION CONTAINER */}
      <div className={`fixed bottom-6 right-6 px-5 py-3.5 border rounded-xl text-xs z-50 shadow-2xl flex items-center gap-2.5 transition-all duration-300 transform font-semibold
        ${toastVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0 pointer-events-none'}
        ${toastType === 'err' ? 'bg-red-950/80 border-red-900/40 text-red-400' : 'bg-emerald-950/80 border-emerald-900/40 text-emerald-400'}`}>
        {toastType === 'err' ? <X className="w-4 h-4 text-red-500" /> : <Check className="w-4 h-4 text-emerald-500" />}
        <span>{toastMessage}</span>
      </div>

    </div>
  );
}
