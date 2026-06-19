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
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center font-sans">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-sage border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-stone-400 font-light">Loading TherapyDesk...</p>
        </div>
      </div>
    );
  }

  // Middleware handles redirect to /sign-in for unauthenticated users.
  // This null render is a safety net for any edge case before redirect fires.
  if (!clerkUser) return null;

  return (
    <div className="min-h-screen bg-stone-50 text-ink flex flex-col md:flex-row font-sans">
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

      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
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
