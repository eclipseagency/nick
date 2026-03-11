"use client";

import { useEffect, useState } from "react";

interface User {
  id: string;
  username: string;
  created_at: string;
}

export default function SettingsPage() {
  const [currentUser, setCurrentUser] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Change password state
  const [currentPw, setCurrentPw] = useState("");
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

    if (!currentPw || !newPw) {
      setPwMsg("Please fill in all fields");
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
          current_password: currentPw,
          new_password: newPw,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setPwMsg("Password changed successfully");
        setPwError(false);
        setCurrentPw("");
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

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 12px",
    background: "#050505",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 8,
    color: "#fff",
    fontSize: 14,
    outline: "none",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 12,
    color: "rgba(255,255,255,0.4)",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    marginBottom: 6,
    display: "block",
  };

  const cardStyle: React.CSSProperties = {
    background: "#111",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 14,
    padding: 24,
  };

  if (loading) {
    return (
      <div style={{ color: "rgba(255,255,255,0.4)", padding: 40, textAlign: "center" }}>
        Loading...
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: "#fff", marginBottom: 24 }}>Settings</h1>

      <div style={{ display: "grid", gap: 20, maxWidth: 600 }}>
        {/* Change Password */}
        <div style={cardStyle}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: "#fff", marginBottom: 4 }}>
            Change Password
          </h2>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 20 }}>
            Logged in as <span style={{ color: "#F6BE00" }}>{currentUser}</span>
          </p>

          <div style={{ display: "grid", gap: 14 }}>
            <div>
              <label style={labelStyle}>Current Password</label>
              <input
                type="password"
                style={inputStyle}
                value={currentPw}
                onChange={(e) => setCurrentPw(e.target.value)}
                placeholder="Enter current password"
              />
            </div>
            <div>
              <label style={labelStyle}>New Password</label>
              <input
                type="password"
                style={inputStyle}
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                placeholder="Enter new password"
              />
            </div>
            <div>
              <label style={labelStyle}>Confirm New Password</label>
              <input
                type="password"
                style={inputStyle}
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
                placeholder="Confirm new password"
              />
            </div>

            {pwMsg && (
              <div
                style={{
                  fontSize: 13,
                  color: pwError ? "#f44336" : "#4CAF50",
                  padding: "8px 12px",
                  background: pwError ? "rgba(244,67,54,0.08)" : "rgba(76,175,80,0.08)",
                  borderRadius: 8,
                }}
              >
                {pwMsg}
              </div>
            )}

            <button
              onClick={handleChangePassword}
              disabled={pwSaving}
              style={{
                padding: "10px 20px",
                background: pwSaving ? "rgba(246,190,0,0.5)" : "#F6BE00",
                border: "none",
                borderRadius: 8,
                color: "#000",
                fontSize: 13,
                fontWeight: 700,
                cursor: pwSaving ? "not-allowed" : "pointer",
              }}
            >
              {pwSaving ? "Saving..." : "Change Password"}
            </button>
          </div>
        </div>

        {/* Add New User */}
        <div style={cardStyle}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: "#fff", marginBottom: 16 }}>
            Add New User
          </h2>

          <div style={{ display: "grid", gap: 14 }}>
            <div>
              <label style={labelStyle}>Username</label>
              <input
                style={inputStyle}
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="Enter username"
              />
            </div>
            <div>
              <label style={labelStyle}>Password</label>
              <input
                type="password"
                style={inputStyle}
                value={newUserPw}
                onChange={(e) => setNewUserPw(e.target.value)}
                placeholder="Enter password"
              />
            </div>

            {userMsg && (
              <div
                style={{
                  fontSize: 13,
                  color: userError ? "#f44336" : "#4CAF50",
                  padding: "8px 12px",
                  background: userError ? "rgba(244,67,54,0.08)" : "rgba(76,175,80,0.08)",
                  borderRadius: 8,
                }}
              >
                {userMsg}
              </div>
            )}

            <button
              onClick={handleAddUser}
              disabled={userSaving}
              style={{
                padding: "10px 20px",
                background: userSaving ? "rgba(246,190,0,0.5)" : "#F6BE00",
                border: "none",
                borderRadius: 8,
                color: "#000",
                fontSize: 13,
                fontWeight: 700,
                cursor: userSaving ? "not-allowed" : "pointer",
              }}
            >
              {userSaving ? "Creating..." : "Add User"}
            </button>
          </div>
        </div>

        {/* Users List */}
        <div style={cardStyle}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: "#fff", marginBottom: 16 }}>
            Admin Users
          </h2>

          {users.length === 0 ? (
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>No users found</p>
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
                    borderRadius: 10,
                  }}
                >
                  <div>
                    <span style={{ fontSize: 14, color: "#fff", fontWeight: 500 }}>
                      {u.username}
                    </span>
                    {u.username === currentUser && (
                      <span
                        style={{
                          marginLeft: 8,
                          fontSize: 10,
                          color: "#F6BE00",
                          fontWeight: 600,
                          textTransform: "uppercase",
                        }}
                      >
                        You
                      </span>
                    )}
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
                              background: "rgba(244,67,54,0.15)",
                              border: "1px solid rgba(244,67,54,0.3)",
                              borderRadius: 6,
                              color: "#f44336",
                              fontSize: 11,
                              fontWeight: 600,
                              cursor: "pointer",
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
