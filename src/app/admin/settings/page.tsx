"use client";

import { useEffect, useState } from "react";

interface User {
  id: string;
  username: string;
  created_at: string;
}

const cardStyle: React.CSSProperties = {
  background: "#111111",
  border: "1px solid rgba(255,255,255,0.06)",
  borderRadius: 16,
  padding: 24,
};

const labelStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  color: "rgba(255,255,255,0.3)",
  marginBottom: 6,
  display: "block",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.06)",
  borderRadius: 8,
  padding: "10px 14px",
  color: "#f5f5f5",
  fontSize: 14,
  fontFamily: "inherit",
  outline: "none",
  boxSizing: "border-box",
};

const primaryButtonStyle: React.CSSProperties = {
  background: "#F6BE00",
  color: "#000",
  fontWeight: 700,
  borderRadius: 10,
  padding: "10px 24px",
  fontSize: 13,
  border: "none",
  cursor: "pointer",
  fontFamily: "inherit",
};

function InputField({
  label,
  type,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          ...inputStyle,
          borderColor: focused ? "rgba(246,190,0,0.2)" : "rgba(255,255,255,0.06)",
        }}
      />
    </div>
  );
}

export default function SettingsPage() {
  const [currentUser, setCurrentUser] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Change password state
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwMsg, setPwMsg] = useState("");
  const [pwError, setPwError] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);

  // Add user state
  const [newUsername, setNewUsername] = useState("");
  const [newUserPw, setNewUserPw] = useState("");
  const [userMsg, setUserMsg] = useState("");
  const [userError, setUserError] = useState(false);
  const [userSaving, setUserSaving] = useState(false);

  // Delete confirm
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/auth").then((r) => r.json()),
      fetch("/api/users").then((r) => r.json()),
    ])
      .then(([auth, usersData]) => {
        if (auth.username) setCurrentUser(auth.username);
        if (Array.isArray(usersData)) setUsers(usersData);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleChangePassword() {
    setPwMsg("");
    setPwError(false);

    if (!newPw) {
      setPwMsg("Please enter a new password");
      setPwError(true);
      return;
    }
    if (newPw !== confirmPw) {
      setPwMsg("New passwords do not match");
      setPwError(true);
      return;
    }
    if (newPw.length < 4) {
      setPwMsg("Password must be at least 4 characters");
      setPwError(true);
      return;
    }

    setPwSaving(true);
    try {
      const res = await fetch("/api/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          new_password: newPw,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setPwMsg("Password changed successfully");
        setPwError(false);
        setNewPw("");
        setConfirmPw("");
      } else {
        setPwMsg(data.error || "Failed to change password");
        setPwError(true);
      }
    } catch {
      setPwMsg("Failed to change password");
      setPwError(true);
    }
    setPwSaving(false);
  }

  async function handleAddUser() {
    setUserMsg("");
    setUserError(false);

    if (!newUsername || !newUserPw) {
      setUserMsg("Please fill in all fields");
      setUserError(true);
      return;
    }
    if (newUserPw.length < 4) {
      setUserMsg("Password must be at least 4 characters");
      setUserError(true);
      return;
    }

    setUserSaving(true);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: newUsername, password: newUserPw }),
      });
      const data = await res.json();
      if (res.ok) {
        setUserMsg("User created successfully");
        setUserError(false);
        setNewUsername("");
        setNewUserPw("");
        // Refresh users list
        const usersRes = await fetch("/api/users");
        const usersData = await usersRes.json();
        if (Array.isArray(usersData)) setUsers(usersData);
      } else {
        setUserMsg(data.error || "Failed to create user");
        setUserError(true);
      }
    } catch {
      setUserMsg("Failed to create user");
      setUserError(true);
    }
    setUserSaving(false);
  }

  async function handleDeleteUser(username: string) {
    try {
      const res = await fetch("/api/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });
      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u.username !== username));
      }
    } catch {
      // ignore
    }
    setDeleteConfirm(null);
  }

  if (loading) {
    return (
      <div style={{ position: "relative", zIndex: 1 }}>
        <div className="admin-skeleton" style={{ height: 28, width: 120, borderRadius: 8, marginBottom: 28 }} />
        <div style={{ display: "grid", gap: 20, maxWidth: 640 }}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="admin-skeleton" style={{ height: 200, borderRadius: 16 }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: "relative", zIndex: 1 }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, color: "#f5f5f5", marginBottom: 28 }}>
        Settings
      </h1>

      <div style={{ display: "grid", gap: 20, maxWidth: 640 }}>
        {/* Change Password */}
        <div style={cardStyle}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "#f5f5f5", margin: "0 0 4px 0" }}>
            Change Password
          </h2>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", marginBottom: 20 }}>
            Logged in as{" "}
            <span style={{ color: "#F6BE00" }}>{currentUser}</span>
          </p>

          <div style={{ display: "grid", gap: 14 }}>
            <InputField
              label="New Password"
              type="password"
              value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
              placeholder="Enter new password"
            />
            <InputField
              label="Confirm New Password"
              type="password"
              value={confirmPw}
              onChange={(e) => setConfirmPw(e.target.value)}
              placeholder="Confirm new password"
            />

            {pwMsg && (
              <div
                style={{
                  fontSize: 13,
                  padding: "10px 14px",
                  borderRadius: 8,
                  color: pwError ? "#FCA5A5" : "#34D399",
                  background: pwError ? "rgba(239,68,68,0.08)" : "rgba(16,185,129,0.08)",
                }}
              >
                {pwMsg}
              </div>
            )}

            <div>
              <button
                onClick={handleChangePassword}
                disabled={pwSaving}
                style={{
                  ...primaryButtonStyle,
                  opacity: pwSaving ? 0.5 : 1,
                  cursor: pwSaving ? "not-allowed" : "pointer",
                }}
              >
                {pwSaving ? "Saving..." : "Change Password"}
              </button>
            </div>
          </div>
        </div>

        {/* Add New User */}
        <div style={cardStyle}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "#f5f5f5", margin: "0 0 20px 0" }}>
            Add New User
          </h2>

          <div style={{ display: "grid", gap: 14 }}>
            <InputField
              label="Username"
              type="text"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              placeholder="Enter username"
            />
            <InputField
              label="Password"
              type="password"
              value={newUserPw}
              onChange={(e) => setNewUserPw(e.target.value)}
              placeholder="Enter password"
            />

            {userMsg && (
              <div
                style={{
                  fontSize: 13,
                  padding: "10px 14px",
                  borderRadius: 8,
                  color: userError ? "#FCA5A5" : "#34D399",
                  background: userError ? "rgba(239,68,68,0.08)" : "rgba(16,185,129,0.08)",
                }}
              >
                {userMsg}
              </div>
            )}

            <div>
              <button
                onClick={handleAddUser}
                disabled={userSaving}
                style={{
                  ...primaryButtonStyle,
                  opacity: userSaving ? 0.5 : 1,
                  cursor: userSaving ? "not-allowed" : "pointer",
                }}
              >
                {userSaving ? "Creating..." : "Add User"}
              </button>
            </div>
          </div>
        </div>

        {/* Admin Users */}
        <div style={cardStyle}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "#f5f5f5", margin: "0 0 20px 0" }}>
            Admin Users
          </h2>

          {users.length === 0 ? (
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.3)" }}>No users found</p>
          ) : (
            <div style={{ display: "grid", gap: 8 }}>
              {users.map((u) => (
                <div
                  key={u.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 14px",
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    borderRadius: 12,
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 14, color: "#f5f5f5", fontWeight: 500 }}>
                        {u.username}
                      </span>
                      {u.username === currentUser && (
                        <span
                          style={{
                            fontSize: 10,
                            color: "#F6BE00",
                            fontWeight: 700,
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                          }}
                        >
                          You
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>
                      Created {new Date(u.created_at).toLocaleDateString()}
                    </div>
                  </div>

                  {u.username !== currentUser && (
                    <>
                      {deleteConfirm === u.username ? (
                        <div style={{ display: "flex", gap: 6 }}>
                          <button
                            onClick={() => handleDeleteUser(u.username)}
                            style={{
                              padding: "4px 12px",
                              background: "rgba(239,68,68,0.12)",
                              border: "1px solid rgba(239,68,68,0.3)",
                              borderRadius: 6,
                              color: "#FCA5A5",
                              fontSize: 11,
                              fontWeight: 600,
                              cursor: "pointer",
                              fontFamily: "inherit",
                            }}
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            style={{
                              padding: "4px 12px",
                              background: "transparent",
                              border: "1px solid rgba(255,255,255,0.1)",
                              borderRadius: 6,
                              color: "rgba(255,255,255,0.4)",
                              fontSize: 11,
                              cursor: "pointer",
                              fontFamily: "inherit",
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirm(u.username)}
                          style={{
                            padding: "4px 12px",
                            background: "transparent",
                            border: "1px solid rgba(255,255,255,0.08)",
                            borderRadius: 6,
                            color: "rgba(255,255,255,0.3)",
                            fontSize: 11,
                            cursor: "pointer",
                            fontFamily: "inherit",
                          }}
                        >
                          Delete
                        </button>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
