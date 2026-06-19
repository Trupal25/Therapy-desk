import { useState, useEffect, useCallback } from "react";
import { Client } from "./useClients";
import { Session } from "./useSessions";
import { compileSoapToHtml, parseSoapFromHtml } from "@/lib/soap-parser";

export interface SoapNote {
  id: string;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  status: string;
  generationModel: string;
  signedAt: string | null;
  signedBy: string | null;
  createdAt: string;
}

export function useSoapNote(
  showToast: (msg: string, type?: "ok" | "err") => void,
  fetchRecentNotes: () => void,
  user: any
) {
  const [selectedClientForNotes, setSelectedClientForNotes] = useState<Client | null>(null);
  const [clientSessions, setClientSessions] = useState<Session[]>([]);
  const [selectedSessionForNotes, setSelectedSessionForNotes] = useState<Session | null>(null);
  const [rawNotesContent, setRawNotesContent] = useState("");
  const [generatedSoap, setGeneratedSoap] = useState<SoapNote | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [searchClientQuery, setSearchClientQuery] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isSigning, setIsSigning] = useState(false);

  const [soapSubjective, setSoapSubjective] = useState("");
  const [soapObjective, setSoapObjective] = useState("");
  const [soapAssessment, setSoapAssessment] = useState("");
  const [soapPlan, setSoapPlan] = useState("");
  const [soapUnifiedContent, setSoapUnifiedContent] = useState("");

  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [historyClient, setHistoryClient] = useState<Client | null>(null);
  const [historyList, setHistoryList] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [isLoadingNote, setIsLoadingNote] = useState(false);

  const fetchSoapNoteForSession = useCallback(async (sessId: string) => {
    setIsLoadingNote(true);
    try {
      const res = await fetch(`/api/notes?sessionId=${sessId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.rawNote) {
          setRawNotesContent(data.rawNote.content || "");
        } else {
          setRawNotesContent("");
        }

        if (data.soapNote) {
          setGeneratedSoap(data.soapNote);
          setSoapSubjective(data.soapNote.subjective);
          setSoapObjective(data.soapNote.objective);
          setSoapAssessment(data.soapNote.assessment);
          setSoapPlan(data.soapNote.plan);
          
          const compiled = compileSoapToHtml(
            data.soapNote.subjective || "",
            data.soapNote.objective || "",
            data.soapNote.assessment || "",
            data.soapNote.plan || ""
          );
          setSoapUnifiedContent(compiled);
        } else {
          setGeneratedSoap(null);
          setSoapSubjective("");
          setSoapObjective("");
          setSoapAssessment("");
          setSoapPlan("");
          setSoapUnifiedContent("");
        }
      }
    } catch (err) {
      console.error("Failed to fetch soap note:", err);
    } finally {
      setIsLoadingNote(false);
    }
  }, []);

  useEffect(() => {
    if (selectedSessionForNotes) {
      fetchSoapNoteForSession(selectedSessionForNotes.id);
    } else {
      setRawNotesContent("");
      setGeneratedSoap(null);
    }
  }, [selectedSessionForNotes, fetchSoapNoteForSession]);

  const handleGenerateSoap = async () => {
    if (!selectedSessionForNotes || !rawNotesContent) {
      showToast("Please enter raw notes", "err");
      return;
    }

    setIsGenerating(true);
    try {
      const res = await fetch("/api/notes/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: selectedSessionForNotes.id,
          rawText: rawNotesContent,
          sessionType: selectedSessionForNotes.sessionType,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "Failed to generate note", "err");
        return;
      }

      setGeneratedSoap({
        id: data.soapNoteId,
        subjective: data.soap.subjective,
        objective: data.soap.objective,
        assessment: data.soap.assessment,
        plan: data.soap.plan,
        status: "draft",
        generationModel: data.model || "AI",
        signedAt: null,
        signedBy: null,
        createdAt: new Date().toISOString(),
      });
      setSoapSubjective(data.soap.subjective);
      setSoapObjective(data.soap.objective);
      setSoapAssessment(data.soap.assessment);
      setSoapPlan(data.soap.plan);

      const compiled = compileSoapToHtml(
        data.soap.subjective || "",
        data.soap.objective || "",
        data.soap.assessment || "",
        data.soap.plan || ""
      );
      setSoapUnifiedContent(compiled);

      const modelLabel = data.model || "AI";
      showToast(`SOAP note generated via ${modelLabel}`, "ok");
      fetchRecentNotes();
    } catch (err) {
      showToast("Failed to generate SOAP note", "err");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!selectedSessionForNotes || !generatedSoap) {
      showToast("No active note to save", "err");
      return;
    }
    if (isSaving) return;
    setIsSaving(true);

    const parsed = parseSoapFromHtml(soapUnifiedContent);

    try {
      const res = await fetch("/api/notes/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: selectedSessionForNotes.id,
          rawText: rawNotesContent,
          userApiKey: "skip_ai_and_use_values",
          subjective: parsed.subjective,
          objective: parsed.objective,
          assessment: parsed.assessment,
          plan: parsed.plan,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        showToast(errData.error || "Failed to save draft", "err");
        return;
      }

      const data = await res.json();
      setGeneratedSoap({
        ...generatedSoap,
        id: data.soapNoteId,
        subjective: parsed.subjective,
        objective: parsed.objective,
        assessment: parsed.assessment,
        plan: parsed.plan,
      });
      setSoapSubjective(parsed.subjective);
      setSoapObjective(parsed.objective);
      setSoapAssessment(parsed.assessment);
      setSoapPlan(parsed.plan);

      showToast("Draft saved successfully!", "ok");
      fetchRecentNotes();
    } catch (err) {
      showToast("Failed to save draft", "err");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignAndLock = async () => {
    if (!generatedSoap || !generatedSoap.id) {
      showToast("Generate and save note before signing", "err");
      return;
    }
    if (isSigning) return;
    setIsSigning(true);

    try {
      const res = await fetch("/api/notes/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ soapNoteId: generatedSoap.id }),
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "Failed to sign note", "err");
        return;
      }

      setGeneratedSoap({
        ...generatedSoap,
        status: "signed",
        signedAt: new Date().toISOString(),
        signedBy: user?.fullName || "Therapist",
      });
      showToast("Note signed and locked legally!", "ok");
      fetchRecentNotes();
    } catch (err) {
      showToast("Failed to sign note", "err");
    } finally {
      setIsSigning(false);
    }
  };

  const openHistoryModal = async (client: Client) => {
    setHistoryClient(client);
    setIsHistoryOpen(true);
    setLoadingHistory(true);
    try {
      const res = await fetch(`/api/notes?clientId=${client.id}`);
      if (res.ok) {
        const historyData = await res.json();
        setHistoryList(historyData);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingHistory(false);
    }
  };

  return {
    selectedClientForNotes,
    setSelectedClientForNotes,
    clientSessions,
    setClientSessions,
    selectedSessionForNotes,
    setSelectedSessionForNotes,
    rawNotesContent,
    setRawNotesContent,
    generatedSoap,
    setGeneratedSoap,
    isGenerating,
    searchClientQuery,
    setSearchClientQuery,
    soapSubjective,
    setSoapSubjective,
    soapObjective,
    setSoapObjective,
    soapAssessment,
    setSoapAssessment,
    soapPlan,
    setSoapPlan,
    soapUnifiedContent,
    setSoapUnifiedContent,
    isHistoryOpen,
    setIsHistoryOpen,
    historyClient,
    historyList,
    loadingHistory,
    openHistoryModal,
    handleGenerateSoap,
    handleSaveDraft,
    handleSignAndLock,
    isSaving,
    isSigning,
    isLoadingNote,
  };
}
