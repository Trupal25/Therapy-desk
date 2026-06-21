// @ts-nocheck
"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import { useClients } from "./hooks/useClients";
import { useSessions } from "./hooks/useSessions";
import { useSoapNote } from "./hooks/useSoapNote";
import { useSettings } from "./hooks/useSettings";

import { Sidebar } from "./components/Sidebar";
import { DashboardView } from "./components/DashboardView";
import { NotesView } from "./components/NotesView";
import { ScheduleView } from "./components/ScheduleView";
import { ClientsView } from "./components/ClientsView";
import { SettingsView } from "./components/SettingsView";
import { AddClientDialog, EditClientDialog, HistoryDialog } from "./components/Dialogs";
import { Toast } from "./components/Toast";

export default function Page() {
  const { user: clerkUser, isLoaded: clerkLoaded } = useUser();
  const { signOut } = useClerk();

  const [activeTab, setActiveTab] = useState<"dashboard" | "notes" | "schedule" | "clients" | "settings">("dashboard");
  const [apiConnected, setApiConnected] = useState(true);

  // Toast State
  const [toast, setToast] = useState({ message: "", visible: false, type: "ok" as "ok" | "err" });

  const showToast = useCallback((message: string, type?: "ok" | "err") => {
    setToast({ message, visible: true, type: type || "ok" });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 3000);
  }, []);

  // Build a user object compatible with existing components
  const user = clerkUser
    ? {
        authenticated: true,
        fullName: clerkUser.fullName || `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || "Therapist",
        userId: clerkUser.id,
        role: "therapist",
      }
    : null;

  const handleSignOut = useCallback(async () => {
    await signOut({ redirectUrl: "/sign-in" });
  }, [signOut]);

  const fetchRecentNotes = useCallback(() => {
    sessionsHook.fetchSessions();
  }, []);

  const clientsHook = useClients(showToast, () => {
    sessionsHook.fetchSessions();
  });

  const sessionsHook = useSessions(showToast, fetchRecentNotes);
  const soapNote = useSoapNote(showToast, fetchRecentNotes, user);
  const settings = useSettings(showToast, () => {});

  // Fetch initial data when authenticated
  useEffect(() => {
    if (clerkUser) {
      const loadData = async () => {
        try {
          await Promise.all([
            clientsHook.fetchClients(),
            sessionsHook.fetchSessions(),
          ]);
          setApiConnected(true);
        } catch (err) {
          console.error("Data load failed:", err);
          showToast("Backend connection failed. Running in offline mockup mode.", "err");
          setApiConnected(false);
        }
      };
      loadData();
    }
  }, [clerkUser?.id]);

  // Sync user name into settings
  useEffect(() => {
    if (user?.fullName) {
      settings.setProfName(user.fullName);
    }
  }, [user?.fullName]);

  // Load sessions for selected client when client changes
  useEffect(() => {
    if (soapNote.selectedClientForNotes) {
      const filtered = sessionsHook.sessions.filter(
        (s) => s.clientId === soapNote.selectedClientForNotes!.id
      );
      soapNote.setClientSessions(filtered);

      if (filtered.length > 0) {
        if (
          !soapNote.selectedSessionForNotes ||
          soapNote.selectedSessionForNotes.clientId !== soapNote.selectedClientForNotes!.id
        ) {
          const sorted = [...filtered].sort(
            (a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime()
          );
          soapNote.setSelectedSessionForNotes(sorted[0]);
        }
      } else {
        soapNote.setSelectedSessionForNotes(null);
        soapNote.setRawNotesContent("");
        soapNote.setGeneratedSoap(null);
      }
    }
  }, [soapNote.selectedClientForNotes, sessionsHook.sessions, soapNote.selectedSessionForNotes]);

  // Derive recent SOAP notes list from sessions
  const recentSoapNotes = useMemo(() => {
    const listWithNotes = sessionsHook.sessions
      .filter((s) => s.soapNote !== null && s.soapNote !== undefined)
      .map((s) => ({
        sessionId: s.id,
        clientName: s.clientName,
        scheduledAt: s.scheduledAt,
        status: s.soapNote.status,
        soapNoteId: s.soapNote.id,
      }));
    listWithNotes.sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime());
    return listWithNotes;
  }, [sessionsHook.sessions]);

  // Loading state — Clerk is still hydrating
  if (!clerkLoaded) {
    return <AppSkeleton />;
  }

  // Middleware handles redirect to /sign-in for unauthenticated users.
  // This null render is a safety net for any edge case before redirect fires.
  if (!clerkUser) return null;

  return (
    <div className="h-screen bg-stone-50 text-ink flex flex-col md:flex-row font-sans overflow-hidden">
      <Sidebar
        user={user}
        profSpec={settings.profSpec}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        apiConnected={apiConnected}
        onSignOut={handleSignOut}
        clients={clientsHook.clients}
        recentSoapNotes={recentSoapNotes}
        selectedClientForNotes={soapNote.selectedClientForNotes}
        onNewClientClick={() => clientsHook.setIsAddClientOpen(true)}
        onSelectClient={(client) => {
          soapNote.setSelectedClientForNotes(client);
          setActiveTab("notes");
        }}
        onSelectRecentNote={(sessionId, clientName) => {
          const sessionObj = sessionsHook.sessions.find((s) => s.id === sessionId);
          const clientObj = clientsHook.clients.find(
            (c) => `${c.firstName} ${c.lastName}` === clientName
          );
          if (sessionObj && clientObj) {
            soapNote.setSelectedClientForNotes(clientObj);
            soapNote.setSelectedSessionForNotes(sessionObj);
          }
          setActiveTab("notes");
        }}
      />

      <main className={`flex-1 overflow-y-auto ${activeTab === "notes" ? "p-0 overflow-hidden flex flex-col" : "p-6 md:p-8"}`}>
        {activeTab === "dashboard" && (
          <DashboardView
            user={user}
            clients={clientsHook.clients}
            sessions={sessionsHook.sessions}
            recentSoapNotes={recentSoapNotes}
            todaySessions={sessionsHook.todaySessions}
            weekSessionsHours={sessionsHook.weekSessionsHours}
            onNewClientClick={() => clientsHook.setIsAddClientOpen(true)}
            onViewCalendarClick={() => setActiveTab("schedule")}
            onSelectSessionForNotes={(session, client) => {
              soapNote.setSelectedClientForNotes(client);
              soapNote.setSelectedSessionForNotes(session);
              setActiveTab("notes");
            }}
            isLoadingClients={clientsHook.isLoading}
            isLoadingSessions={sessionsHook.isLoading}
          />
        )}

        {activeTab === "notes" && (
          <NotesView
            clients={clientsHook.clients}
            selectedClientForNotes={soapNote.selectedClientForNotes}
            setSelectedClientForNotes={soapNote.setSelectedClientForNotes}
            clientSessions={soapNote.clientSessions}
            selectedSessionForNotes={soapNote.selectedSessionForNotes}
            setSelectedSessionForNotes={soapNote.setSelectedSessionForNotes}
            rawNotesContent={soapNote.rawNotesContent}
            setRawNotesContent={soapNote.setRawNotesContent}
            generatedSoap={soapNote.generatedSoap}
            isGenerating={soapNote.isGenerating}
            searchClientQuery={soapNote.searchClientQuery}
            setSearchClientQuery={soapNote.setSearchClientQuery}
            soapSubjective={soapNote.soapSubjective}
            setSoapSubjective={soapNote.setSoapSubjective}
            soapObjective={soapNote.soapObjective}
            setSoapObjective={soapNote.setSoapObjective}
            soapAssessment={soapNote.soapAssessment}
            setSoapAssessment={soapNote.setSoapAssessment}
            soapPlan={soapNote.soapPlan}
            setSoapPlan={soapNote.setSoapPlan}
            soapUnifiedContent={soapNote.soapUnifiedContent}
            setSoapUnifiedContent={soapNote.setSoapUnifiedContent}
            handleGenerateSoap={soapNote.handleGenerateSoap}
            handleSaveDraft={soapNote.handleSaveDraft}
            handleSignAndLock={soapNote.handleSignAndLock}
            onBookSessionClick={() => setActiveTab("schedule")}
            showToast={showToast}
            isLoadingNote={soapNote.isLoadingNote}
          />
        )}

        {activeTab === "schedule" && (
          <ScheduleView
            sessions={sessionsHook.sessions}
            clients={clientsHook.clients}
            currentMonth={sessionsHook.currentMonth}
            selectedCalDate={sessionsHook.selectedCalDate}
            setSelectedCalDate={sessionsHook.setSelectedCalDate}
            prevMonth={sessionsHook.prevMonth}
            nextMonth={sessionsHook.nextMonth}
            daysInMonthData={sessionsHook.daysInMonthData}
            daySessions={sessionsHook.daySessions}
            newApptClient={sessionsHook.newApptClient}
            setNewApptClient={sessionsHook.setNewApptClient}
            newApptDate={sessionsHook.newApptDate}
            setNewApptDate={sessionsHook.setNewApptDate}
            newApptTime={sessionsHook.newApptTime}
            setNewApptTime={sessionsHook.setNewApptTime}
            newApptDuration={sessionsHook.newApptDuration}
            setNewApptDuration={sessionsHook.setNewApptDuration}
            newApptType={sessionsHook.newApptType}
            setNewApptType={sessionsHook.setNewApptType}
            onSubmit={sessionsHook.handleBookApptSubmit}
            isBooking={sessionsHook.isBooking}
            isLoading={sessionsHook.isLoading}
          />
        )}

        {activeTab === "clients" && (
          <ClientsView
            clients={clientsHook.clients}
            sessions={sessionsHook.sessions}
            onAddClientClick={() => clientsHook.setIsAddClientOpen(true)}
            onOpenHistoryModal={soapNote.openHistoryModal}
            isLoading={clientsHook.isLoading}
          />
        )}

        {activeTab === "settings" && (
          <SettingsView
            profName={settings.profName}
            setProfName={settings.setProfName}
            profSpec={settings.profSpec}
            setProfSpec={settings.setProfSpec}
            profileError={settings.profileError}
            pwCur={settings.pwCur}
            setPwCur={settings.setPwCur}
            pwNew={settings.pwNew}
            setPwNew={settings.setPwNew}
            pwNew2={settings.pwNew2}
            setPwNew2={settings.setPwNew2}
            pwError={settings.pwError}
            onSaveProfile={settings.handleSaveProfile}
            onUpdatePassword={settings.handleUpdatePassword}
            isSavingProfile={settings.isSavingProfile}
            isUpdatingPassword={settings.isUpdatingPassword}
          />
        )}
      </main>

      {/* OVERLAY DIALOGS */}
      <AddClientDialog
        isOpen={clientsHook.isAddClientOpen}
        onClose={() => clientsHook.setIsAddClientOpen(false)}
        newClientName={clientsHook.newClientName}
        setNewClientName={clientsHook.setNewClientName}
        newClientAge={clientsHook.newClientAge}
        setNewClientAge={clientsHook.setNewClientAge}
        newClientType={clientsHook.newClientType}
        setNewClientType={clientsHook.setNewClientType}
        newClientNotes={clientsHook.newClientNotes}
        setNewClientNotes={clientsHook.setNewClientNotes}
        onSubmit={clientsHook.handleAddClientSubmit}
        isSaving={clientsHook.isSaving}
      />

      <EditClientDialog
        isOpen={clientsHook.isEditClientOpen}
        onClose={() => clientsHook.setIsEditClientOpen(false)}
        editClientName={clientsHook.editClientName}
        setEditClientName={clientsHook.setEditClientName}
        editClientAge={clientsHook.editClientAge}
        setEditClientAge={clientsHook.setEditClientAge}
        editClientType={clientsHook.editClientType}
        setEditClientType={clientsHook.setEditClientType}
        editClientNotes={clientsHook.editClientNotes}
        setEditClientNotes={clientsHook.setEditClientNotes}
        editClientError={clientsHook.editClientError}
        onSubmit={clientsHook.handleEditClientSubmit}
        isSaving={clientsHook.isSaving}
      />

      <HistoryDialog
        isOpen={soapNote.isHistoryOpen}
        onClose={() => soapNote.setIsHistoryOpen(false)}
        historyClient={soapNote.historyClient}
        historyList={soapNote.historyList}
        loadingHistory={soapNote.loadingHistory}
      />

      {/* TOAST */}
      <Toast
        message={toast.message}
        visible={toast.visible}
        type={toast.type}
      />
    </div>
  );
}

function AppSkeleton() {
  return (
    <div className="h-screen bg-stone-50 text-ink flex flex-col md:flex-row font-sans overflow-hidden">
      {/* Sidebar Skeleton */}
      <div 
        className="hidden md:flex flex-col shrink-0" 
        style={{ width: 232, borderRight: "1px solid #EEECE8", background: "#FAFAF8", height: "100%" }}
      >
        {/* Logo block */}
        <div className="flex items-center gap-2 p-4 border-b" style={{ borderColor: "#EEECE8" }}>
          <div className="w-6 h-6 rounded-full bg-stone-200 animate-pulse" />
          <div className="h-4 bg-stone-200 rounded w-24 animate-pulse" />
        </div>

        {/* User profile block */}
        <div className="p-4 flex items-center gap-3 border-b" style={{ borderColor: "#EEECE8" }}>
          <div className="w-9 h-9 rounded-full bg-stone-200 animate-pulse" />
          <div className="space-y-1.5 flex-1">
            <div className="h-3.5 bg-stone-200 rounded w-2/3 animate-pulse" />
            <div className="h-2.5 bg-stone-200 rounded w-1/2 animate-pulse" />
          </div>
        </div>

        {/* Navigation items */}
        <div className="p-3 space-y-1 flex-1">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-lg">
              <div className="w-5 h-5 rounded bg-stone-200 animate-pulse" />
              <div className="h-3 bg-stone-200 rounded w-20 animate-pulse" />
            </div>
          ))}
          
          {/* Divider */}
          <div className="h-px bg-stone-200 my-4" />

          {/* Recent Notes title placeholder */}
          <div className="px-3 mb-2">
            <div className="h-2 bg-stone-200 rounded w-16 animate-pulse" />
          </div>
          
          {/* Recent notes list */}
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-lg">
              <div className="w-3.5 h-3.5 rounded-full bg-stone-200 animate-pulse" />
              <div className="h-2.5 bg-stone-200 rounded w-24 animate-pulse" />
            </div>
          ))}
        </div>

        {/* Footer/Sign out block */}
        <div className="p-4 border-t" style={{ borderColor: "#EEECE8" }}>
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg">
            <div className="w-4 h-4 rounded bg-stone-200 animate-pulse" />
            <div className="h-3 bg-stone-200 rounded w-16 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="flex-1 flex flex-col min-w-0 bg-white" style={{ height: "100%" }}>
        {/* Top bar strip */}
        <div className="h-14 border-b flex items-center px-6" style={{ borderColor: "#EEECE8", background: "#FAFAF8" }}>
          <div className="h-3 bg-stone-200 rounded w-36 animate-pulse" />
        </div>

        {/* Main Dashboard area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
          {/* Welcome header */}
          <div className="space-y-2">
            <div className="h-7 bg-stone-200 rounded w-48 animate-pulse" />
            <div className="h-3.5 bg-stone-200 rounded w-80 animate-pulse" />
          </div>

          {/* Stats KPI Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white border border-stone-200/80 p-5 rounded-2xl flex items-center justify-between">
                <div className="space-y-2 flex-grow">
                  <div className="h-2.5 bg-stone-200 rounded w-12 animate-pulse" />
                  <div className="h-7 bg-stone-200 rounded w-10 mt-1 animate-pulse" />
                  <div className="h-2 bg-stone-200 rounded w-20 mt-1.5 animate-pulse" />
                </div>
                <div className="w-10 h-10 rounded-xl bg-stone-100 animate-pulse flex-shrink-0" />
              </div>
            ))}
          </div>

          {/* Split Dashboard Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left large block (Schedule agenda) */}
            <div className="lg:col-span-2 bg-white border border-stone-200/80 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: "#EEECE8" }}>
                <div className="h-4.5 bg-stone-200 rounded w-32 animate-pulse" />
                <div className="h-3 bg-stone-200 rounded w-20 animate-pulse" />
              </div>
              <div className="space-y-3.5">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4 py-2 border-b border-stone-100 last:border-0">
                    <div className="w-10 h-10 rounded-xl bg-stone-100 flex-shrink-0 animate-pulse" />
                    <div className="flex-grow space-y-2">
                      <div className="h-3 bg-stone-200 rounded w-1/3 animate-pulse" />
                      <div className="h-2 bg-stone-200 rounded w-1/2 animate-pulse" />
                    </div>
                    <div className="w-12 h-5 bg-stone-100 rounded-lg animate-pulse" />
                  </div>
                ))}
              </div>
            </div>

            {/* Right block (Recent Notes / Patients) */}
            <div className="bg-white border border-stone-200/80 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: "#EEECE8" }}>
                <div className="h-4.5 bg-stone-200 rounded w-24 animate-pulse" />
                <div className="h-3 bg-stone-200 rounded w-16 animate-pulse" />
              </div>
              <div className="space-y-3.5">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 py-2 border-b border-stone-100 last:border-0">
                    <div className="w-8 h-8 rounded-full bg-stone-100 flex-shrink-0 animate-pulse" />
                    <div className="flex-grow space-y-2">
                      <div className="h-3 bg-stone-200 rounded w-1/2 animate-pulse" />
                      <div className="h-2 bg-stone-200 rounded w-1/3 animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
