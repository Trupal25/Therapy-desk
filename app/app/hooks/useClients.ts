import { useState, useCallback } from "react";

export interface Client {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  email: string | null;
  phone: string | null;
  gender: string | null;
  pronouns: string | null;
  diagnosisCodes: string[];
  referralSource: string | null;
  emergencyContact: any;
  insuranceInfo: any;
  isActive: boolean;
  createdAt: string;
}

export function useClients(showToast: (msg: string, type?: "ok" | "err") => void, onRefreshData?: () => void) {
  const [clients, setClients] = useState<Client[]>([]);
  const [isAddClientOpen, setIsAddClientOpen] = useState(false);
  const [newClientName, setNewClientName] = useState("");
  const [newClientAge, setNewClientAge] = useState("");
  const [newClientType, setNewClientType] = useState("General");
  const [newClientNotes, setNewClientNotes] = useState("");

  const [isEditClientOpen, setIsEditClientOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [editClientName, setEditClientName] = useState("");
  const [editClientAge, setEditClientAge] = useState("");
  const [editClientType, setEditClientType] = useState("General");
  const [editClientNotes, setEditClientNotes] = useState("");
  const [editClientError, setEditClientError] = useState("");

  const fetchClients = useCallback(async () => {
    try {
      const clientsRes = await fetch("/api/clients");
      if (clientsRes.ok) {
        const clientsData = await clientsRes.json();
        setClients(clientsData);
      }
    } catch (err) {
      console.error("Error fetching clients:", err);
    }
  }, []);

  const handleAddClientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName || !newClientAge) {
      showToast("Name and age are required", "err");
      return;
    }

    try {
      const currentYear = new Date().getFullYear();
      const dobYear = currentYear - parseInt(newClientAge);
      const dob = `${dobYear}-01-01`;

      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: newClientName.split(" ")[0],
          lastName: newClientName.split(" ").slice(1).join(" ") || "Patient",
          dateOfBirth: dob,
          gender: newClientType,
          referralSource: newClientNotes,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        showToast(errData.error || "Failed to create client", "err");
        return;
      }

      showToast("Client added successfully", "ok");
      setIsAddClientOpen(false);
      setNewClientName("");
      setNewClientAge("");
      setNewClientNotes("");
      fetchClients();
      if (onRefreshData) onRefreshData();
    } catch (err) {
      showToast("API failure adding client", "err");
    }
  };

  const handleEditClientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditClientError("");
    if (!editClientName || !editClientAge) {
      setEditClientError("Name and age are required");
      return;
    }
    showToast("Client updated successfully (simulated)", "ok");
    setIsEditClientOpen(false);
  };

  const openEditClient = (client: Client) => {
    setEditingClient(client);
    setEditClientName(`${client.firstName} ${client.lastName}`);
    
    // Estimate age
    const dobYear = new Date(client.dateOfBirth).getFullYear();
    const currentYear = new Date().getFullYear();
    setEditClientAge((currentYear - dobYear).toString());
    
    setEditClientType(client.gender || "General");
    setEditClientNotes(client.referralSource || "");
    setEditClientError("");
    setIsEditClientOpen(true);
  };

  return {
    clients,
    setClients,
    fetchClients,
    isAddClientOpen,
    setIsAddClientOpen,
    newClientName,
    setNewClientName,
    newClientAge,
    setNewClientAge,
    newClientType,
    setNewClientType,
    newClientNotes,
    setNewClientNotes,
    handleAddClientSubmit,
    isEditClientOpen,
    setIsEditClientOpen,
    editingClient,
    editClientName,
    setEditClientName,
    editClientAge,
    setEditClientAge,
    editClientType,
    setEditClientType,
    editClientNotes,
    setEditClientNotes,
    editClientError,
    openEditClient,
    handleEditClientSubmit,
  };
}
