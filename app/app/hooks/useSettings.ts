import { useState } from "react";

export function useSettings(
  showToast: (msg: string, type?: "ok" | "err") => void,
  setUser: React.Dispatch<React.SetStateAction<any>>
) {
  const [profName, setProfName] = useState("");
  const [profSpec, setProfSpec] = useState("General");
  const [profileError, setProfileError] = useState("");
  const [pwCur, setPwCur] = useState("");
  const [pwNew, setPwNew] = useState("");
  const [pwNew2, setPwNew2] = useState("");
  const [pwError, setPwError] = useState("");

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError("");
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "profile",
          fullName: profName,
          specialization: profSpec,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setProfileError(data.error || "Failed to update profile");
        return;
      }

      setUser((prev: any) => ({ ...prev, fullName: profName }));
      showToast("Profile saved successfully", "ok");
    } catch (err) {
      setProfileError("API network error updating profile");
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError("");
    if (pwNew !== pwNew2) {
      setPwError("New passwords do not match");
      return;
    }

    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "password",
          currentPassword: pwCur,
          newPassword: pwNew,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setPwError(data.error || "Failed to update password");
        return;
      }

      setPwCur("");
      setPwNew("");
      setPwNew2("");
      showToast("Password updated successfully", "ok");
    } catch (err) {
      setPwError("API network error updating password");
    }
  };

  return {
    profName,
    setProfName,
    profSpec,
    setProfSpec,
    profileError,
    setProfileError,
    pwCur,
    setPwCur,
    pwNew,
    setPwNew,
    pwNew2,
    setPwNew2,
    pwError,
    handleSaveProfile,
    handleUpdatePassword,
  };
}
