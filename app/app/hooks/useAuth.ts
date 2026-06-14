import { useState, useEffect } from "react";

export function useAuth(showToast: (msg: string, type?: "ok" | "err") => void) {
  const [authChecked, setAuthChecked] = useState(false);
  const [user, setUser] = useState<{ authenticated: boolean; fullName?: string; role?: string; userId?: string } | null>(null);
  const [authAction, setAuthAction] = useState<"signin" | "signup">("signin");
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [fullNameInput, setFullNameInput] = useState("");
  const [authError, setAuthError] = useState("");

  const checkAuth = async () => {
    try {
      const res = await fetch("/api/auth");
      if (res.ok) {
        const data = await res.json();
        setUser(data.user ? { authenticated: true, ...data.user } : data);
      } else {
        setUser({ authenticated: false });
      }
    } catch (err) {
      console.error("Auth check failed:", err);
      setUser({ authenticated: false });
    } finally {
      setAuthChecked(true);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");

    if (!emailInput || !passwordInput) {
      setAuthError("Email and password are required");
      return;
    }

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: authAction,
          email: emailInput,
          password: passwordInput,
          fullName: authAction === "signup" ? fullNameInput : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.error || "Authentication failed");
        return;
      }

      setUser({ authenticated: true, fullName: data.user.fullName, role: data.user.role, userId: data.user.userId });
      showToast(authAction === "signup" ? "Account created successfully!" : "Signed in successfully!", "ok");
    } catch (err) {
      setAuthError("Connection refused by database api. Please make sure the DB is running.");
    }
  };

  const handleSignOut = async () => {
    try {
      await fetch("/api/auth", { method: "DELETE" });
    } catch (err) {
      console.error("Sign out error", err);
    }
    setUser({ authenticated: false });
    showToast("Signed out successfully");
  };

  return {
    authChecked,
    user,
    setUser,
    authAction,
    setAuthAction,
    emailInput,
    setEmailInput,
    passwordInput,
    setPasswordInput,
    fullNameInput,
    setFullNameInput,
    authError,
    handleAuthSubmit,
    handleSignOut,
  };
}
