"use client";

import { useCallback, useEffect, useState } from "react";
import {
  User as UserIcon,
  Users as UsersIcon,
  Building2,
  Plus,
  Trash2,
  Shield,
  ShieldCheck,
  Wrench,
  Check,
  X,
  KeyRound,
} from "lucide-react";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Field,
  IconButton,
  Input,
  PageHeader,
  Section,
  Select,
  Skeleton,
  useToast,
  type BadgeTone,
} from "../_ui";

type Role = "super_admin" | "manager" | "reception" | "technician";

interface Me {
  id: string;
  username: string;
  full_name: string | null;
  role: Role;
  branch_id: string | null;
}

interface AdminUser {
  id: string;
  username: string;
  full_name: string | null;
  role: Role;
  branch_id: string | null;
  is_active: boolean;
  created_at: string;
}

interface Branch {
  id: string;
  name_en: string;
  name_ar: string;
  address: string | null;
  phone: string | null;
  is_active: boolean;
  created_at: string;
}

const ROLE_LABELS: Record<Role, string> = {
  super_admin: "Super Admin",
  manager: "Manager",
  reception: "Reception",
  technician: "Technician",
};

const ROLE_TONES: Record<Role, BadgeTone> = {
  super_admin: "gold",
  manager: "info",
  reception: "success",
  technician: "neutral",
};

const ROLE_ICONS: Record<Role, React.ReactNode> = {
  super_admin: <ShieldCheck className="w-3 h-3" />,
  manager: <Shield className="w-3 h-3" />,
  reception: <UserIcon className="w-3 h-3" />,
  technician: <Wrench className="w-3 h-3" />,
};

export default function SettingsPage() {
  const [tab, setTab] = useState<"profile" | "users" | "branches">("profile");
  const [me, setMe] = useState<Me | null>(null);
  const [loadingMe, setLoadingMe] = useState(true);

  useEffect(() => {
    fetch("/api/auth")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setMe(d))
      .finally(() => setLoadingMe(false));
  }, []);

  const isSuper = me?.role === "super_admin";

  return (
    <div>
      <PageHeader
        title="Settings"
        subtitle="Your profile, team members, and branches"
      />

      <div className="grid grid-cols-1 lg:grid-cols-[220px_minmax(0,900px)] gap-8 lg:gap-10">
        {/* Left tabs */}
        <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible">
          {[
            { key: "profile", label: "My Profile", icon: <UserIcon className="w-4 h-4" /> },
            ...(isSuper
              ? [
                  { key: "users", label: "Users & Roles", icon: <UsersIcon className="w-4 h-4" /> },
                  { key: "branches", label: "Branches", icon: <Building2 className="w-4 h-4" /> },
                ]
              : []),
          ].map((t) => {
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key as typeof tab)}
                className={`flex items-center gap-2.5 px-3 h-10 rounded-[8px] text-[13px] font-medium whitespace-nowrap transition-colors ${
                  active
                    ? "bg-[var(--ad-accent-bg)] text-[var(--ad-accent)]"
                    : "text-[var(--ad-fg-muted)] hover:text-[var(--ad-fg)] hover:bg-[var(--ad-surface-2)]"
                }`}
              >
                {t.icon}
                {t.label}
              </button>
            );
          })}
        </nav>

        {/* Content */}
        <div className="min-w-0">
          {loadingMe ? (
            <Card>
              <Skeleton className="w-48 h-4 mb-4" />
              <Skeleton className="w-full h-9 mb-3" />
              <Skeleton className="w-full h-9" />
            </Card>
          ) : tab === "profile" ? (
            me && <ProfilePanel me={me} onUpdated={(next) => setMe({ ...me, ...next })} />
          ) : tab === "users" ? (
            <UsersPanel isSuper={!!isSuper} meId={me?.id} />
          ) : (
            <BranchesPanel isSuper={!!isSuper} />
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Profile panel
// ─────────────────────────────────────────────────────────────────
function ProfilePanel({ me, onUpdated }: { me: Me; onUpdated: (u: Partial<Me>) => void }) {
  const toast = useToast();
  const [fullName, setFullName] = useState(me.full_name || "");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [savingPw, setSavingPw] = useState(false);

  async function saveName() {
    setSavingName(true);
    try {
      const res = await fetch("/api/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: me.id, full_name: fullName }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Failed");
      const next = await res.json();
      onUpdated({ full_name: next.full_name });
      toast.success("Profile updated");
    } catch (e) {
      toast.error("Couldn't save", (e as Error).message);
    } finally {
      setSavingName(false);
    }
  }

  async function changePw() {
    if (!password) return;
    if (password !== password2) {
      toast.error("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setSavingPw(true);
    try {
      const res = await fetch("/api/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: me.id, password }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Failed");
      setPassword("");
      setPassword2("");
      toast.success("Password changed");
    } catch (e) {
      toast.error("Couldn't change password", (e as Error).message);
    } finally {
      setSavingPw(false);
    }
  }

  return (
    <div className="space-y-8">
      <Card padded={false}>
        <div className="px-8 pt-7 pb-6 border-b border-[var(--ad-border)]">
          <h2 className="text-[16px] font-semibold text-[var(--ad-fg)] tracking-tight">Account identity</h2>
          <p className="mt-1.5 text-[13px] text-[var(--ad-fg-muted)]">How you appear to your team</p>
        </div>
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-7">
          <Field label="Username" hint="Used to sign in — cannot be changed">
            <Input value={me.username} disabled />
          </Field>
          <Field label="Role">
            <div className="h-9 flex items-center">
              <Badge tone={ROLE_TONES[me.role]}>
                <span className="mr-1 inline-flex">{ROLE_ICONS[me.role]}</span>
                {ROLE_LABELS[me.role]}
              </Badge>
            </div>
          </Field>
          <div className="md:col-span-2">
            <Field label="Full name" hint="Shown in the top bar and booking assignments">
              <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your full name" />
            </Field>
          </div>
        </div>
        <div className="px-8 py-5 border-t border-[var(--ad-border)] bg-[var(--ad-surface-2)]/40 rounded-b-[14px] flex justify-end">
          <Button variant="primary" size="lg" onClick={saveName} loading={savingName}>
            Save changes
          </Button>
        </div>
      </Card>

      <Card padded={false}>
        <div className="px-8 pt-7 pb-6 border-b border-[var(--ad-border)]">
          <h2 className="text-[16px] font-semibold text-[var(--ad-fg)] tracking-tight">Password</h2>
          <p className="mt-1.5 text-[13px] text-[var(--ad-fg-muted)]">Use a strong password you&apos;re not using elsewhere</p>
        </div>
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-7">
          <Field label="New password" required>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" autoComplete="new-password" />
          </Field>
          <Field label="Confirm new password" required>
            <Input type="password" value={password2} onChange={(e) => setPassword2(e.target.value)} autoComplete="new-password" />
          </Field>
        </div>
        <div className="px-8 py-5 border-t border-[var(--ad-border)] bg-[var(--ad-surface-2)]/40 rounded-b-[14px] flex justify-end">
          <Button
            variant="primary"
            size="lg"
            icon={<KeyRound className="w-4 h-4" />}
            onClick={changePw}
            loading={savingPw}
            disabled={!password || !password2}
          >
            Change password
          </Button>
        </div>
      </Card>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Users panel
// ─────────────────────────────────────────────────────────────────
function UsersPanel({ isSuper, meId }: { isSuper: boolean; meId?: string }) {
  const toast = useToast();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const [u, b] = await Promise.all([fetch("/api/users"), fetch("/api/branches")]);
    if (u.ok) setUsers(await u.json());
    if (b.ok) setBranches(await b.json());
    setLoading(false);
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  const branchName = (id: string | null) => branches.find((b) => b.id === id)?.name_en || "—";

  async function updateUser(u: AdminUser, patch: Partial<AdminUser>) {
    try {
      const res = await fetch("/api/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: u.id, ...patch }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Failed");
      const next = await res.json();
      setUsers((prev) => prev.map((x) => (x.id === u.id ? next : x)));
      toast.success("Updated");
    } catch (e) {
      toast.error("Couldn't save", (e as Error).message);
    }
  }

  async function deleteUser(u: AdminUser) {
    if (!confirm(`Delete ${u.username}? This cannot be undone.`)) return;
    try {
      const res = await fetch("/api/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: u.id }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Failed");
      setUsers((prev) => prev.filter((x) => x.id !== u.id));
      toast.success("User deleted");
    } catch (e) {
      toast.error("Couldn't delete", (e as Error).message);
    }
  }

  async function resetPassword(u: AdminUser) {
    const newPw = prompt(`Set a new password for ${u.username} (min 6 chars):`);
    if (!newPw) return;
    try {
      const res = await fetch("/api/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: u.id, password: newPw }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Failed");
      toast.success("Password reset", `New password set for ${u.username}`);
    } catch (e) {
      toast.error("Couldn't reset password", (e as Error).message);
    }
  }

  if (!isSuper) {
    return (
      <Card>
        <EmptyState
          icon={<Shield className="w-5 h-5" />}
          title="Super admin access required"
          description="Only super admins can manage team members and roles."
        />
      </Card>
    );
  }

  return (
    <Section
      title="Team members"
      description={`${users.length} user${users.length === 1 ? "" : "s"} across ${branches.length} branch${branches.length === 1 ? "" : "es"}`}
      action={
        <Button variant="primary" icon={<Plus className="w-3.5 h-3.5" />} onClick={() => setAdding(true)}>
          Add user
        </Button>
      }
    >
      <Card padded={false} className="overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-4">
            <Skeleton className="w-full h-10" />
            <Skeleton className="w-full h-10" />
            <Skeleton className="w-full h-10" />
          </div>
        ) : users.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={<UsersIcon className="w-5 h-5" />}
              title="No team members yet"
              description="Add your first team member to start assigning roles."
            />
          </div>
        ) : (
          <div>
            {users.map((u, idx) => {
              const isMe = u.id === meId;
              const inactive = !u.is_active;
              return (
                <div
                  key={u.id}
                  className={`flex items-center gap-5 flex-wrap md:flex-nowrap px-8 py-6 transition-colors hover:bg-[var(--ad-surface-2)]/40 ${idx > 0 ? "border-t border-[var(--ad-border)]" : ""} ${inactive ? "opacity-60" : ""}`}
                >
                  {/* Identity */}
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    <div className="w-10 h-10 rounded-full bg-[var(--ad-accent-bg)] border border-[var(--ad-border-accent)] flex items-center justify-center text-[14px] font-bold text-[var(--ad-accent)] flex-shrink-0">
                      {(u.full_name || u.username).slice(0, 1).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[14.5px] font-medium text-[var(--ad-fg)] truncate">{u.full_name || u.username}</span>
                        {isMe && <Badge tone="gold">You</Badge>}
                        {inactive && <Badge tone="danger">Off</Badge>}
                      </div>
                      <div className="text-[12.5px] text-[var(--ad-fg-muted)] truncate mt-1">
                        @{u.username}
                        {u.branch_id && <span className="ml-1.5">· {branchName(u.branch_id)}</span>}
                      </div>
                    </div>
                  </div>
                  {/* Role */}
                  <div className="w-[150px] flex-shrink-0">
                    <Select
                      value={u.role}
                      disabled={isMe}
                      onChange={(e) => updateUser(u, { role: e.target.value as Role })}
                      aria-label="Role"
                    >
                      {(["super_admin", "manager", "reception", "technician"] as Role[]).map((r) => (
                        <option key={r} value={r}>
                          {ROLE_LABELS[r]}
                        </option>
                      ))}
                    </Select>
                  </div>
                  {/* Branch */}
                  <div className="w-[170px] flex-shrink-0">
                    <Select
                      value={u.branch_id || ""}
                      onChange={(e) => updateUser(u, { branch_id: e.target.value || null })}
                      aria-label="Branch"
                    >
                      <option value="">No branch</option>
                      {branches.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name_en}
                        </option>
                      ))}
                    </Select>
                  </div>
                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {!isMe && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => updateUser(u, { is_active: !u.is_active })}
                      >
                        {u.is_active ? "Disable" : "Enable"}
                      </Button>
                    )}
                    <IconButton size="sm" label="Reset password" onClick={() => resetPassword(u)}>
                      <KeyRound className="w-3.5 h-3.5" />
                    </IconButton>
                    {!isMe && (
                      <IconButton size="sm" label="Delete user" onClick={() => deleteUser(u)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </IconButton>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {adding && (
        <AddUserDialog
          branches={branches}
          onClose={() => setAdding(false)}
          onCreated={(u) => {
            setUsers((prev) => [...prev, u]);
            setAdding(false);
          }}
        />
      )}
    </Section>
  );
}

function AddUserDialog({
  branches,
  onClose,
  onCreated,
}: {
  branches: Branch[];
  onClose: () => void;
  onCreated: (u: AdminUser) => void;
}) {
  const toast = useToast();
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("reception");
  const [branchId, setBranchId] = useState<string>(branches[0]?.id || "");
  const [saving, setSaving] = useState(false);

  async function submit() {
    if (!username.trim() || !password) return;
    setSaving(true);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          full_name: fullName.trim() || username.trim(),
          password,
          role,
          branch_id: branchId || null,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Failed");
      onCreated(await res.json());
      toast.success("User created", `@${username.trim()} can now sign in`);
    } catch (e) {
      toast.error("Couldn't create user", (e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="w-full max-w-lg bg-[var(--ad-surface)] border border-[var(--ad-border)] rounded-[12px] shadow-[var(--ad-shadow-lg)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--ad-border)]">
          <h2 className="text-[15px] font-semibold">Add team member</h2>
          <IconButton label="Close" onClick={onClose}>
            <X className="w-4 h-4" />
          </IconButton>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Username" required hint="Lowercase letters, numbers, dots">
              <Input value={username} onChange={(e) => setUsername(e.target.value)} autoFocus autoComplete="off" />
            </Field>
            <Field label="Full name">
              <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Optional" />
            </Field>
            <Field label="Temporary password" required hint="At least 6 characters — they can change it after login">
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
            </Field>
            <Field label="Role" required>
              <Select value={role} onChange={(e) => setRole(e.target.value as Role)}>
                {(["super_admin", "manager", "reception", "technician"] as Role[]).map((r) => (
                  <option key={r} value={r}>
                    {ROLE_LABELS[r]}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Branch">
              <Select value={branchId} onChange={(e) => setBranchId(e.target.value)}>
                <option value="">No branch</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name_en}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
        </div>
        <div className="flex justify-end gap-2 px-5 py-4 border-t border-[var(--ad-border)]">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={submit}
            loading={saving}
            disabled={!username.trim() || password.length < 6}
          >
            Create user
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Branches panel
// ─────────────────────────────────────────────────────────────────
function BranchesPanel({ isSuper }: { isSuper: boolean }) {
  const toast = useToast();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/branches");
    if (res.ok) setBranches(await res.json());
    setLoading(false);
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  async function updateBranch(b: Branch, patch: Partial<Branch>) {
    try {
      const res = await fetch("/api/branches", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: b.id, ...patch }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Failed");
      const next = await res.json();
      setBranches((prev) => prev.map((x) => (x.id === b.id ? next : x)));
      toast.success("Branch updated");
    } catch (e) {
      toast.error("Couldn't save", (e as Error).message);
    }
  }

  async function deleteBranch(b: Branch) {
    if (!confirm(`Delete branch "${b.name_en}"?`)) return;
    try {
      const res = await fetch("/api/branches", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: b.id }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Failed");
      setBranches((prev) => prev.filter((x) => x.id !== b.id));
      toast.success("Branch deleted");
    } catch (e) {
      toast.error("Couldn't delete", (e as Error).message);
    }
  }

  if (!isSuper) {
    return (
      <Card>
        <EmptyState
          icon={<Shield className="w-5 h-5" />}
          title="Super admin access required"
          description="Only super admins can manage branches."
        />
      </Card>
    );
  }

  return (
    <Section
      title="Branches"
      description={`${branches.length} branch${branches.length === 1 ? "" : "es"}`}
      action={
        <Button variant="primary" icon={<Plus className="w-3.5 h-3.5" />} onClick={() => setAdding(true)}>
          Add branch
        </Button>
      }
    >
      <Card padded={false} className="overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-4">
            <Skeleton className="w-full h-14" />
            <Skeleton className="w-full h-14" />
          </div>
        ) : branches.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={<Building2 className="w-5 h-5" />}
              title="No branches yet"
              description="Add your first branch to start assigning users and bookings."
            />
          </div>
        ) : (
          <div>
            {branches.map((b, idx) => (
              <div
                key={b.id}
                className={`flex flex-wrap items-center gap-5 px-8 py-6 transition-colors hover:bg-[var(--ad-surface-2)]/40 ${idx > 0 ? "border-t border-[var(--ad-border)]" : ""} ${!b.is_active ? "opacity-60" : ""}`}
              >
                <div className="w-10 h-10 rounded-[10px] bg-[var(--ad-accent-bg)] border border-[var(--ad-border-accent)] flex items-center justify-center text-[var(--ad-accent)] flex-shrink-0">
                  <Building2 className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="text-[14.5px] font-medium text-[var(--ad-fg)]">{b.name_en}</span>
                    <span className="text-[13px] text-[var(--ad-fg-muted)]" dir="rtl">{b.name_ar}</span>
                    {!b.is_active && <Badge tone="danger">Inactive</Badge>}
                  </div>
                  <div className="text-[12.5px] text-[var(--ad-fg-muted)] mt-1 truncate">
                    {b.address || "No address set"} {b.phone && <span className="ml-2">· {b.phone}</span>}
                  </div>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => updateBranch(b, { is_active: !b.is_active })}
                  icon={b.is_active ? <X className="w-3 h-3" /> : <Check className="w-3 h-3" />}
                >
                  {b.is_active ? "Deactivate" : "Activate"}
                </Button>
                <IconButton size="sm" label="Delete branch" onClick={() => deleteBranch(b)}>
                  <Trash2 className="w-3.5 h-3.5" />
                </IconButton>
              </div>
            ))}
          </div>
        )}
      </Card>

      {adding && (
        <AddBranchDialog
          onClose={() => setAdding(false)}
          onCreated={(b) => {
            setBranches((prev) => [...prev, b]);
            setAdding(false);
          }}
        />
      )}
    </Section>
  );
}

function AddBranchDialog({ onClose, onCreated }: { onClose: () => void; onCreated: (b: Branch) => void }) {
  const toast = useToast();
  const [nameEn, setNameEn] = useState("");
  const [nameAr, setNameAr] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit() {
    if (!nameEn.trim() || !nameAr.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/branches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name_en: nameEn, name_ar: nameAr, address, phone }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Failed");
      onCreated(await res.json());
      toast.success("Branch created");
    } catch (e) {
      toast.error("Couldn't create branch", (e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="w-full max-w-lg bg-[var(--ad-surface)] border border-[var(--ad-border)] rounded-[12px] shadow-[var(--ad-shadow-lg)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--ad-border)]">
          <h2 className="text-[15px] font-semibold">Add branch</h2>
          <IconButton label="Close" onClick={onClose}>
            <X className="w-4 h-4" />
          </IconButton>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="English name" required>
              <Input value={nameEn} onChange={(e) => setNameEn(e.target.value)} placeholder="e.g. Jeddah Main" autoFocus />
            </Field>
            <Field label="Arabic name" required>
              <Input value={nameAr} onChange={(e) => setNameAr(e.target.value)} placeholder="مثال: جدة - الرئيسي" dir="rtl" />
            </Field>
            <Field label="Address">
              <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Street, district, city" />
            </Field>
            <Field label="Phone">
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+966..." />
            </Field>
          </div>
        </div>
        <div className="flex justify-end gap-2 px-5 py-4 border-t border-[var(--ad-border)]">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={submit} loading={saving} disabled={!nameEn.trim() || !nameAr.trim()}>
            Create branch
          </Button>
        </div>
      </div>
    </div>
  );
}
