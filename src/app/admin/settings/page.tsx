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
      <div className="space-y-5 max-w-[640px]">
        <div className="admin-skeleton h-8 w-32 rounded-lg" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="admin-skeleton h-48 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Settings</h1>

      <div className="grid gap-5 max-w-[640px]">
        {/* Change Password */}
        <div className="bg-[#111] border border-white/[0.06] rounded-xl p-6">
          <h2 className="text-base font-semibold text-white mb-1">Change Password</h2>
          <p className="text-sm text-white/40 mb-5">
            Logged in as <span className="text-gold">{currentUser}</span>
          </p>

          <div className="grid gap-3.5">
            <div>
              <label className="block text-xs text-white/40 mb-1.5 uppercase tracking-wider">
                New Password
              </label>
              <input
                type="password"
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                placeholder="Enter new password"
                className="w-full px-3 py-2.5 bg-[#050505] border border-white/10 rounded-lg text-white text-sm outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition placeholder:text-white/25"
              />
            </div>
            <div>
              <label className="block text-xs text-white/40 mb-1.5 uppercase tracking-wider">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
                placeholder="Confirm new password"
                className="w-full px-3 py-2.5 bg-[#050505] border border-white/10 rounded-lg text-white text-sm outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition placeholder:text-white/25"
              />
            </div>

            {pwMsg && (
              <div
                className={`text-sm px-3 py-2 rounded-lg ${
                  pwError
                    ? "text-red-500 bg-red-500/[0.08]"
                    : "text-green-500 bg-green-500/[0.08]"
                }`}
              >
                {pwMsg}
              </div>
            )}

            <button
              onClick={handleChangePassword}
              disabled={pwSaving}
              className="px-5 py-2.5 bg-gold hover:bg-gold-light text-black text-sm font-bold rounded-lg transition cursor-pointer border-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {pwSaving ? "Saving..." : "Change Password"}
            </button>
          </div>
        </div>

        {/* Add New User */}
        <div className="bg-[#111] border border-white/[0.06] rounded-xl p-6">
          <h2 className="text-base font-semibold text-white mb-4">Add New User</h2>

          <div className="grid gap-3.5">
            <div>
              <label className="block text-xs text-white/40 mb-1.5 uppercase tracking-wider">
                Username
              </label>
              <input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="Enter username"
                className="w-full px-3 py-2.5 bg-[#050505] border border-white/10 rounded-lg text-white text-sm outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition placeholder:text-white/25"
              />
            </div>
            <div>
              <label className="block text-xs text-white/40 mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <input
                type="password"
                value={newUserPw}
                onChange={(e) => setNewUserPw(e.target.value)}
                placeholder="Enter password"
                className="w-full px-3 py-2.5 bg-[#050505] border border-white/10 rounded-lg text-white text-sm outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition placeholder:text-white/25"
              />
            </div>

            {userMsg && (
              <div
                className={`text-sm px-3 py-2 rounded-lg ${
                  userError
                    ? "text-red-500 bg-red-500/[0.08]"
                    : "text-green-500 bg-green-500/[0.08]"
                }`}
              >
                {userMsg}
              </div>
            )}

            <button
              onClick={handleAddUser}
              disabled={userSaving}
              className="px-5 py-2.5 bg-gold hover:bg-gold-light text-black text-sm font-bold rounded-lg transition cursor-pointer border-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {userSaving ? "Creating..." : "Add User"}
            </button>
          </div>
        </div>

        {/* Admin Users */}
        <div className="bg-[#111] border border-white/[0.06] rounded-xl p-6">
          <h2 className="text-base font-semibold text-white mb-4">Admin Users</h2>

          {users.length === 0 ? (
            <p className="text-sm text-white/40">No users found</p>
          ) : (
            <div className="space-y-2">
              {users.map((u) => (
                <div
                  key={u.id}
                  className="flex items-center justify-between px-3.5 py-2.5 bg-white/[0.02] border border-white/[0.06] rounded-xl"
                >
                  <div>
                    <span className="text-sm text-white font-medium">{u.username}</span>
                    {u.username === currentUser && (
                      <span className="ml-2 text-[10px] text-gold font-semibold uppercase">
                        You
                      </span>
                    )}
                    <div className="text-[11px] text-white/30 mt-0.5">
                      Created {new Date(u.created_at).toLocaleDateString()}
                    </div>
                  </div>

                  {u.username !== currentUser && (
                    <>
                      {deleteConfirm === u.username ? (
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => handleDeleteUser(u.username)}
                            className="px-3 py-1 bg-red-500/[0.15] border border-red-500/30 rounded-md text-red-500 text-[11px] font-semibold cursor-pointer"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            className="px-3 py-1 bg-transparent border border-white/10 rounded-md text-white/40 text-[11px] cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirm(u.username)}
                          className="px-3 py-1 bg-transparent border border-white/[0.08] rounded-md text-white/30 text-[11px] cursor-pointer hover:text-white/50 transition"
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
