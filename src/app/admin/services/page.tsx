"use client";

import { useEffect, useState, useRef } from "react";

interface Service {
  id: string;
  category: string;
  name_en: string;
  name_ar: string;
  warranty: string;
  price_small: number;
  price_large: number;
  image: string | null;
  image_small: string | null;
  image_large: string | null;
  parts_en: string | null;
  parts_ar: string | null;
  addon_tier: string | null;
  details_en: string | null;
  details_ar: string | null;
  tier: string | null;
  price_before_small: number | null;
  price_before_large: number | null;
  popular: boolean;
  sort_order: number;
  active: boolean;
}

const CATEGORY_BADGE: Record<string, { bg: string; color: string }> = {
  ppf:     { bg: "rgba(246,190,0,0.12)",  color: "#F6BE00" },
  tint:    { bg: "rgba(74,158,255,0.12)", color: "#4A9EFF" },
  ceramic: { bg: "rgba(52,211,153,0.12)", color: "#34D399" },
};

function CategoryBadge({ category }: { category: string }) {
  const style = CATEGORY_BADGE[category] ?? { bg: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.4)" };
  return (
    <span style={{
      background: style.bg,
      color: style.color,
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: "0.08em",
      textTransform: "uppercase",
      padding: "3px 8px",
      borderRadius: 6,
    }}>
      {category}
    </span>
  );
}

const INPUT_STYLE: React.CSSProperties = {
  width: "100%",
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.06)",
  borderRadius: 8,
  padding: "10px 14px",
  color: "#f5f5f5",
  fontSize: 14,
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 0.15s",
};

const LABEL_STYLE: React.CSSProperties = {
  display: "block",
  fontSize: 12,
  fontWeight: 600,
  color: "rgba(255,255,255,0.3)",
  marginBottom: 6,
};

function FocusInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      {...props}
      style={{ ...INPUT_STYLE, ...(focused ? { borderColor: "rgba(246,190,0,0.2)" } : {}), ...props.style }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    />
  );
}

function FocusSelect(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  const [focused, setFocused] = useState(false);
  return (
    <select
      {...props}
      style={{ ...INPUT_STYLE, ...(focused ? { borderColor: "rgba(246,190,0,0.2)" } : {}), ...props.style }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    />
  );
}

function FocusTextarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const [focused, setFocused] = useState(false);
  return (
    <textarea
      {...props}
      style={{ ...INPUT_STYLE, minHeight: 80, resize: "vertical", ...(focused ? { borderColor: "rgba(246,190,0,0.2)" } : {}), ...props.style }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    />
  );
}

function ImageUpload({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string | null;
  onChange: (url: string) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();

      if (res.ok && data.url) {
        onChange(data.url);
      } else {
        setError(data.error || "Upload failed");
      }
    } catch {
      setError("Upload failed");
    }

    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <div>
      <label style={LABEL_STYLE}>{label}</label>

      {value && (
        <div
          style={{
            width: "100%",
            height: 80,
            borderRadius: 8,
            marginBottom: 8,
            backgroundImage: `url(${value})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        />
      )}

      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/svg+xml"
          onChange={handleFile}
          style={{ display: "none" }}
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          style={{
            padding: "7px 16px",
            background: "rgba(246,190,0,0.08)",
            border: "1px solid rgba(246,190,0,0.25)",
            borderRadius: 8,
            color: "#F6BE00",
            fontSize: 12,
            fontWeight: 600,
            cursor: uploading ? "not-allowed" : "pointer",
            opacity: uploading ? 0.5 : 1,
            whiteSpace: "nowrap",
            transition: "background 0.15s",
          }}
          onMouseEnter={e => { if (!uploading) (e.currentTarget as HTMLButtonElement).style.background = "rgba(246,190,0,0.14)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(246,190,0,0.08)"; }}
        >
          {uploading ? "Uploading..." : value ? "Replace" : "Upload"}
        </button>

        {value && (
          <div
            title={value}
            style={{
              flex: 1,
              fontSize: 10,
              color: "rgba(255,255,255,0.3)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {value.split("/").pop()}
          </div>
        )}
      </div>

      {error && (
        <div style={{ fontSize: 11, color: "#ef4444", marginTop: 4 }}>{error}</div>
      )}
    </div>
  );
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Service>>({});
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [creating, setCreating] = useState(false);
  const [createData, setCreateData] = useState<Partial<Service>>({
    category: "ppf",
    name_en: "",
    name_ar: "",
    price_small: 0,
    price_large: 0,
    warranty: "",
    image: null,
    image_small: null,
    image_large: null,
    details_en: null,
    details_ar: null,
    tier: null,
    price_before_small: null,
    price_before_large: null,
    popular: false,
    active: true,
  });
  const [createSaving, setCreateSaving] = useState(false);

  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetch("/api/services?all=true")
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d)) setServices(d);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function startEdit(s: Service) {
    setEditingId(s.id);
    setEditData({ ...s });
    setSaveMsg("");
  }

  function cancelEdit() {
    setEditingId(null);
    setEditData({});
    setSaveMsg("");
  }

  async function saveEdit() {
    if (!editingId) return;
    setSaving(true);
    setSaveMsg("");
    try {
      const res = await fetch("/api/services", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingId, ...editData }),
      });
      if (res.ok) {
        const updated = await res.json();
        setServices((prev) => prev.map((s) => (s.id === editingId ? updated : s)));
        setEditingId(null);
        setEditData({});
        setSaveMsg("Saved!");
        setTimeout(() => setSaveMsg(""), 2000);
      } else {
        setSaveMsg("Error saving");
      }
    } catch {
      setSaveMsg("Error saving");
    }
    setSaving(false);
  }

  function startCreate() {
    setCreating(true);
    setCreateData({
      category: "ppf",
      name_en: "",
      name_ar: "",
      price_small: 0,
      price_large: 0,
      warranty: "",
      image: null,
      image_small: null,
      image_large: null,
      details_en: null,
      details_ar: null,
      tier: null,
      price_before_small: null,
      price_before_large: null,
      popular: false,
      active: true,
    });
  }

  function cancelCreate() {
    setCreating(false);
  }

  async function saveCreate() {
    setCreateSaving(true);
    setSaveMsg("");
    try {
      const res = await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createData),
      });
      if (res.ok) {
        const created = await res.json();
        setServices((prev) => [created, ...prev]);
        setCreating(false);
        setSaveMsg("Created!");
        setTimeout(() => setSaveMsg(""), 2000);
      } else {
        const err = await res.json();
        setSaveMsg(err.error || "Error creating");
      }
    } catch {
      setSaveMsg("Error creating");
    }
    setCreateSaving(false);
  }

  async function toggleField(id: string, field: "popular" | "active", value: boolean) {
    try {
      const res = await fetch("/api/services", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, [field]: value }),
      });
      if (res.ok) {
        const updated = await res.json();
        setServices((prev) => prev.map((s) => (s.id === id ? updated : s)));
      }
    } catch {
      // ignore
    }
  }

  const categoryCounts: Record<string, number> = {
    all: services.length,
    ppf: services.filter((s) => s.category === "ppf").length,
    tint: services.filter((s) => s.category === "tint").length,
    ceramic: services.filter((s) => s.category === "ceramic").length,
  };

  const filteredServices = services.filter((s) => {
    if (categoryFilter !== "all" && s.category !== categoryFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!s.name_en.toLowerCase().includes(q) && !s.name_ar.includes(q)) return false;
    }
    return true;
  });

  if (loading) {
    return (
      <div style={{ color: "rgba(255,255,255,0.4)", padding: "40px 0", textAlign: "center" }}>
        Loading services...
      </div>
    );
  }

  return (
    <div style={{ position: "relative", zIndex: 1 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "#f5f5f5", margin: 0 }}>Services</h1>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {saveMsg && (
            <span style={{ fontSize: 13, color: saveMsg.startsWith("Error") ? "#ef4444" : "#34D399", fontWeight: 600 }}>
              {saveMsg}
            </span>
          )}
          {!creating && (
            <button
              onClick={startCreate}
              style={{
                padding: "10px 24px",
                background: "#F6BE00",
                color: "#000",
                fontWeight: 700,
                fontSize: 14,
                borderRadius: 10,
                border: "none",
                cursor: "pointer",
                transition: "background 0.15s",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "#D4A300"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "#F6BE00"; }}
            >
              + New Service
            </button>
          )}
        </div>
      </div>

      {/* Category tabs + search */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {(["all", "ppf", "tint", "ceramic"] as const).map((cat) => {
            const isActive = categoryFilter === cat;
            const badgeStyle = cat !== "all" ? CATEGORY_BADGE[cat] : null;
            return (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                style={{
                  padding: "6px 16px",
                  borderRadius: 999,
                  border: isActive
                    ? `1px solid ${badgeStyle ? badgeStyle.color : "rgba(246,190,0,0.4)"}`
                    : "1px solid rgba(255,255,255,0.1)",
                  background: isActive
                    ? badgeStyle
                      ? badgeStyle.bg
                      : "rgba(246,190,0,0.1)"
                    : "transparent",
                  color: isActive
                    ? badgeStyle
                      ? badgeStyle.color
                      : "#F6BE00"
                    : "rgba(255,255,255,0.5)",
                  fontSize: 13,
                  fontWeight: isActive ? 700 : 400,
                  cursor: "pointer",
                  textTransform: "capitalize",
                  transition: "all 0.15s",
                }}
              >
                {cat} ({categoryCounts[cat]})
              </button>
            );
          })}
        </div>
        <SearchInput value={searchQuery} onChange={setSearchQuery} />
      </div>

      {/* Create form */}
      {creating && (
        <div style={{
          background: "#111111",
          border: "1px solid rgba(246,190,0,0.2)",
          borderRadius: 16,
          padding: 20,
          marginBottom: 16,
        }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#F6BE00", marginBottom: 16 }}>New Service</div>
          <div style={{ display: "grid", gap: 12 }}>
            <div>
              <label style={LABEL_STYLE}>Category</label>
              <FocusSelect
                value={createData.category || "ppf"}
                onChange={(e) => setCreateData({ ...createData, category: e.target.value })}
              >
                <option value="ppf">PPF</option>
                <option value="tint">Tint</option>
                <option value="ceramic">Ceramic</option>
              </FocusSelect>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <div>
                <label style={LABEL_STYLE}>Name (EN)</label>
                <FocusInput
                  value={createData.name_en || ""}
                  onChange={(e) => setCreateData({ ...createData, name_en: e.target.value })}
                  placeholder="Service name"
                />
              </div>
              <div>
                <label style={LABEL_STYLE}>Name (AR)</label>
                <FocusInput
                  dir="rtl"
                  style={{ textAlign: "right" }}
                  value={createData.name_ar || ""}
                  onChange={(e) => setCreateData({ ...createData, name_ar: e.target.value })}
                  placeholder="اسم الخدمة"
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <div>
                <label style={LABEL_STYLE}>Price Small (SAR)</label>
                <FocusInput
                  type="number"
                  value={createData.price_small || 0}
                  onChange={(e) => setCreateData({ ...createData, price_small: Number(e.target.value) })}
                />
              </div>
              <div>
                <label style={LABEL_STYLE}>Price Large (SAR)</label>
                <FocusInput
                  type="number"
                  value={createData.price_large || 0}
                  onChange={(e) => setCreateData({ ...createData, price_large: Number(e.target.value) })}
                />
              </div>
            </div>

            <div>
              <label style={LABEL_STYLE}>Warranty</label>
              <FocusInput
                value={createData.warranty || ""}
                onChange={(e) => setCreateData({ ...createData, warranty: e.target.value })}
                placeholder="e.g. 5 years"
              />
            </div>

            <div>
              <label style={LABEL_STYLE}>Tier</label>
              <FocusInput
                value={createData.tier || ""}
                onChange={(e) => setCreateData({ ...createData, tier: e.target.value || null })}
                placeholder="e.g. SPRINT, TURBO, Plus"
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <div>
                <label style={LABEL_STYLE}>Price Before Small (SAR)</label>
                <FocusInput
                  type="number"
                  value={createData.price_before_small ?? ""}
                  onChange={(e) =>
                    setCreateData({ ...createData, price_before_small: e.target.value ? Number(e.target.value) : null })
                  }
                  placeholder="Before discount"
                />
              </div>
              <div>
                <label style={LABEL_STYLE}>Price Before Large (SAR)</label>
                <FocusInput
                  type="number"
                  value={createData.price_before_large ?? ""}
                  onChange={(e) =>
                    setCreateData({ ...createData, price_before_large: e.target.value ? Number(e.target.value) : null })
                  }
                  placeholder="Before discount"
                />
              </div>
            </div>

            <div>
              <label style={LABEL_STYLE}>Details (EN)</label>
              <FocusTextarea
                value={createData.details_en || ""}
                onChange={(e) => setCreateData({ ...createData, details_en: e.target.value || null })}
                placeholder="One detail per line"
              />
            </div>
            <div>
              <label style={LABEL_STYLE}>Details (AR)</label>
              <FocusTextarea
                dir="rtl"
                style={{ textAlign: "right" }}
                value={createData.details_ar || ""}
                onChange={(e) => setCreateData({ ...createData, details_ar: e.target.value || null })}
                placeholder="تفصيل واحد لكل سطر"
              />
            </div>

            <ImageUpload
              label="Main Image"
              value={createData.image || null}
              onChange={(url) => setCreateData({ ...createData, image: url })}
            />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <ImageUpload
                label="Image Small"
                value={createData.image_small || null}
                onChange={(url) => setCreateData({ ...createData, image_small: url })}
              />
              <ImageUpload
                label="Image Large"
                value={createData.image_large || null}
                onChange={(url) => setCreateData({ ...createData, image_large: url })}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "rgba(255,255,255,0.5)", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  style={{ accentColor: "#F6BE00" }}
                  checked={createData.popular || false}
                  onChange={(e) => setCreateData({ ...createData, popular: e.target.checked })}
                />
                Popular
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "rgba(255,255,255,0.5)", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  style={{ accentColor: "#34D399" }}
                  checked={createData.active !== false}
                  onChange={(e) => setCreateData({ ...createData, active: e.target.checked })}
                />
                Active
              </label>
            </div>

            <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
              <button
                onClick={saveCreate}
                disabled={createSaving}
                style={{
                  flex: 1,
                  padding: "11px 16px",
                  background: createSaving ? "rgba(246,190,0,0.5)" : "#F6BE00",
                  color: "#000",
                  fontWeight: 700,
                  fontSize: 14,
                  borderRadius: 10,
                  border: "none",
                  cursor: createSaving ? "not-allowed" : "pointer",
                  transition: "background 0.15s",
                }}
              >
                {createSaving ? "Creating..." : "Create Service"}
              </button>
              <button
                onClick={cancelCreate}
                style={{
                  padding: "11px 16px",
                  background: "transparent",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 10,
                  color: "rgba(255,255,255,0.5)",
                  fontSize: 14,
                  cursor: "pointer",
                  transition: "color 0.15s",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.8)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.5)"; }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Service grid */}
      <div className="admin-service-grid" style={{ display: "grid", gap: 16 }}>
        {filteredServices.map((s) => {
          const isEditing = editingId === s.id;

          return (
            <ServiceCard
              key={s.id}
              s={s}
              isEditing={isEditing}
              editData={editData}
              setEditData={setEditData}
              saving={saving}
              onEdit={startEdit}
              onCancelEdit={cancelEdit}
              onSaveEdit={saveEdit}
              onToggle={toggleField}
            />
          );
        })}
      </div>

      <style>{`
        .admin-service-grid { grid-template-columns: 1fr; }
        @media (min-width: 640px) { .admin-service-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (min-width: 1280px) { .admin-service-grid { grid-template-columns: repeat(3, 1fr); } }
        .admin-service-grid select option { background: #111111; color: #f5f5f5; }
      `}</style>
    </div>
  );
}

function SearchInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      type="text"
      placeholder="Search services..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        ...INPUT_STYLE,
        width: "auto",
        minWidth: 200,
        maxWidth: 260,
        ...(focused ? { borderColor: "rgba(246,190,0,0.2)" } : {}),
      }}
    />
  );
}

function ServiceCard({
  s,
  isEditing,
  editData,
  setEditData,
  saving,
  onEdit,
  onCancelEdit,
  onSaveEdit,
  onToggle,
}: {
  s: Service;
  isEditing: boolean;
  editData: Partial<Service>;
  setEditData: (d: Partial<Service>) => void;
  saving: boolean;
  onEdit: (s: Service) => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  onToggle: (id: string, field: "popular" | "active", value: boolean) => void;
}) {
  const [hovered, setHovered] = useState(false);

  const borderColor = hovered && s.active
    ? "rgba(246,190,0,0.2)"
    : s.active
      ? "rgba(255,255,255,0.06)"
      : "rgba(239,68,68,0.2)";

  return (
    <div
      style={{
        background: "#111111",
        border: `1px solid ${borderColor}`,
        borderRadius: 16,
        overflow: "hidden",
        opacity: s.active ? 1 : 0.6,
        transition: "all 0.2s",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Thumbnail */}
      {s.image && (
        <div
          style={{
            height: 120,
            backgroundImage: `url(${s.image})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        />
      )}

      <div style={{ padding: 16 }}>
        {!isEditing ? (
          /* ---- VIEW MODE ---- */
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <CategoryBadge category={s.category} />
              {!s.active && (
                <span style={{ fontSize: 10, fontWeight: 700, color: "#ef4444", letterSpacing: "0.06em" }}>
                  INACTIVE
                </span>
              )}
              {s.tier && (
                <span style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: "rgba(255,255,255,0.4)",
                  background: "rgba(255,255,255,0.06)",
                  padding: "3px 7px",
                  borderRadius: 5,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                }}>
                  {s.tier}
                </span>
              )}
            </div>

            <div style={{ fontSize: 15, fontWeight: 700, color: "#f5f5f5", marginBottom: 2 }}>{s.name_en}</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 12 }} dir="rtl">{s.name_ar}</div>

            <div style={{ display: "flex", gap: 20, marginBottom: 8 }}>
              <div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", marginBottom: 2 }}>Small</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#f5f5f5" }}>
                  {(s.price_small || 0).toLocaleString()} <span style={{ color: "rgba(255,255,255,0.4)" }}>SAR</span>
                </div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", marginBottom: 2 }}>Large</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#f5f5f5" }}>
                  {(s.price_large || 0).toLocaleString()} <span style={{ color: "rgba(255,255,255,0.4)" }}>SAR</span>
                </div>
              </div>
            </div>

            {s.warranty && (
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginBottom: 12 }}>
                Warranty: {s.warranty}
              </div>
            )}

            <div style={{ display: "flex", gap: 16, marginBottom: 14 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "rgba(255,255,255,0.45)", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  style={{ accentColor: "#F6BE00" }}
                  checked={s.popular}
                  onChange={(e) => onToggle(s.id, "popular", e.target.checked)}
                />
                Popular
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "rgba(255,255,255,0.45)", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  style={{ accentColor: "#34D399" }}
                  checked={s.active}
                  onChange={(e) => onToggle(s.id, "active", e.target.checked)}
                />
                Active
              </label>
            </div>

            <EditButton onClick={() => onEdit(s)} />
          </>
        ) : (
          /* ---- EDIT MODE ---- */
          <div style={{ display: "grid", gap: 12 }}>
            <div>
              <label style={LABEL_STYLE}>Name (EN)</label>
              <FocusInput
                value={editData.name_en || ""}
                onChange={(e) => setEditData({ ...editData, name_en: e.target.value })}
              />
            </div>
            <div>
              <label style={LABEL_STYLE}>Name (AR)</label>
              <FocusInput
                dir="rtl"
                style={{ textAlign: "right" }}
                value={editData.name_ar || ""}
                onChange={(e) => setEditData({ ...editData, name_ar: e.target.value })}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <div>
                <label style={LABEL_STYLE}>Price Small (SAR)</label>
                <FocusInput
                  type="number"
                  value={editData.price_small || 0}
                  onChange={(e) => setEditData({ ...editData, price_small: Number(e.target.value) })}
                />
              </div>
              <div>
                <label style={LABEL_STYLE}>Price Large (SAR)</label>
                <FocusInput
                  type="number"
                  value={editData.price_large || 0}
                  onChange={(e) => setEditData({ ...editData, price_large: Number(e.target.value) })}
                />
              </div>
            </div>

            <div>
              <label style={LABEL_STYLE}>Warranty</label>
              <FocusInput
                value={editData.warranty || ""}
                onChange={(e) => setEditData({ ...editData, warranty: e.target.value })}
              />
            </div>

            <div>
              <label style={LABEL_STYLE}>Tier</label>
              <FocusInput
                value={editData.tier || ""}
                onChange={(e) => setEditData({ ...editData, tier: e.target.value || null })}
                placeholder="e.g. SPRINT, TURBO, Plus"
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <div>
                <label style={LABEL_STYLE}>Price Before Small (SAR)</label>
                <FocusInput
                  type="number"
                  value={editData.price_before_small ?? ""}
                  onChange={(e) =>
                    setEditData({ ...editData, price_before_small: e.target.value ? Number(e.target.value) : null })
                  }
                  placeholder="Before discount"
                />
              </div>
              <div>
                <label style={LABEL_STYLE}>Price Before Large (SAR)</label>
                <FocusInput
                  type="number"
                  value={editData.price_before_large ?? ""}
                  onChange={(e) =>
                    setEditData({ ...editData, price_before_large: e.target.value ? Number(e.target.value) : null })
                  }
                  placeholder="Before discount"
                />
              </div>
            </div>

            <div>
              <label style={LABEL_STYLE}>Details (EN)</label>
              <FocusTextarea
                value={editData.details_en || ""}
                onChange={(e) => setEditData({ ...editData, details_en: e.target.value || null })}
                placeholder="One detail per line"
              />
            </div>
            <div>
              <label style={LABEL_STYLE}>Details (AR)</label>
              <FocusTextarea
                dir="rtl"
                style={{ textAlign: "right" }}
                value={editData.details_ar || ""}
                onChange={(e) => setEditData({ ...editData, details_ar: e.target.value || null })}
                placeholder="تفصيل واحد لكل سطر"
              />
            </div>

            <ImageUpload
              label="Main Image"
              value={editData.image || null}
              onChange={(url) => setEditData({ ...editData, image: url })}
            />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <ImageUpload
                label="Image Small"
                value={editData.image_small || null}
                onChange={(url) => setEditData({ ...editData, image_small: url })}
              />
              <ImageUpload
                label="Image Large"
                value={editData.image_large || null}
                onChange={(url) => setEditData({ ...editData, image_large: url })}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "rgba(255,255,255,0.5)", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  style={{ accentColor: "#F6BE00" }}
                  checked={editData.popular || false}
                  onChange={(e) => setEditData({ ...editData, popular: e.target.checked })}
                />
                Popular
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "rgba(255,255,255,0.5)", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  style={{ accentColor: "#34D399" }}
                  checked={editData.active || false}
                  onChange={(e) => setEditData({ ...editData, active: e.target.checked })}
                />
                Active
              </label>
            </div>

            <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
              <button
                onClick={onSaveEdit}
                disabled={saving}
                style={{
                  flex: 1,
                  padding: "11px 16px",
                  background: saving ? "rgba(246,190,0,0.5)" : "#F6BE00",
                  color: "#000",
                  fontWeight: 700,
                  fontSize: 14,
                  borderRadius: 10,
                  border: "none",
                  cursor: saving ? "not-allowed" : "pointer",
                  transition: "background 0.15s",
                }}
              >
                {saving ? "Saving..." : "Save"}
              </button>
              <button
                onClick={onCancelEdit}
                style={{
                  padding: "11px 16px",
                  background: "transparent",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 10,
                  color: "rgba(255,255,255,0.5)",
                  fontSize: 14,
                  cursor: "pointer",
                  transition: "color 0.15s",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.8)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.5)"; }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function EditButton({ onClick }: { onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: "8px 18px",
        background: hovered ? "rgba(246,190,0,0.14)" : "rgba(246,190,0,0.08)",
        border: "1px solid rgba(246,190,0,0.25)",
        borderRadius: 8,
        color: "#F6BE00",
        fontSize: 12,
        fontWeight: 600,
        cursor: "pointer",
        transition: "background 0.15s",
      }}
    >
      Edit Details
    </button>
  );
}
