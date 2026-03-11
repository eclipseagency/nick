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
  popular: boolean;
  sort_order: number;
  active: boolean;
}

const CATEGORY_COLORS: Record<string, string> = {
  ppf: "#F6BE00",
  tint: "#2196F3",
  ceramic: "#4CAF50",
};

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
      <label
        style={{
          fontSize: 11,
          color: "rgba(255,255,255,0.4)",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          marginBottom: 6,
          display: "block",
        }}
      >
        {label}
      </label>

      {/* Preview */}
      {value && (
        <div
          style={{
            width: "100%",
            height: 80,
            borderRadius: 8,
            marginBottom: 8,
            background: `url(${value}) center/cover`,
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        />
      )}

      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
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
            padding: "6px 14px",
            background: uploading ? "rgba(246,190,0,0.3)" : "rgba(246,190,0,0.1)",
            border: "1px solid rgba(246,190,0,0.3)",
            borderRadius: 6,
            color: "#F6BE00",
            fontSize: 11,
            fontWeight: 600,
            cursor: uploading ? "not-allowed" : "pointer",
            whiteSpace: "nowrap",
          }}
        >
          {uploading ? "Uploading..." : value ? "Replace" : "Upload"}
        </button>

        {value && (
          <div
            style={{
              flex: 1,
              fontSize: 10,
              color: "rgba(255,255,255,0.3)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
            title={value}
          >
            {value.split("/").pop()}
          </div>
        )}
      </div>

      {error && (
        <div style={{ fontSize: 11, color: "#f44336", marginTop: 4 }}>{error}</div>
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
    popular: false,
    active: true,
  });
  const [createSaving, setCreateSaving] = useState(false);

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

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "8px 10px",
    background: "#050505",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 8,
    color: "#fff",
    fontSize: 13,
    outline: "none",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 11,
    color: "rgba(255,255,255,0.4)",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    marginBottom: 4,
    display: "block",
  };

  if (loading) {
    return (
      <div style={{ color: "rgba(255,255,255,0.4)", padding: 40, textAlign: "center" }}>
        Loading services...
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#fff" }}>Services</h1>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {saveMsg && (
            <span style={{ fontSize: 13, color: "#4CAF50" }}>{saveMsg}</span>
          )}
          {!creating && (
            <button
              onClick={startCreate}
              style={{
                padding: "8px 20px",
                background: "#F6BE00",
                border: "none",
                borderRadius: 8,
                color: "#000",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              + New Service
            </button>
          )}
        </div>
      </div>

      {/* Create form */}
      {creating && (
        <div
          style={{
            background: "#111",
            border: "1px solid rgba(246,190,0,0.3)",
            borderRadius: 14,
            padding: 20,
            marginBottom: 16,
          }}
        >
          <div style={{ fontSize: 16, fontWeight: 700, color: "#F6BE00", marginBottom: 16 }}>
            New Service
          </div>
          <div style={{ display: "grid", gap: 12 }}>
            <div>
              <label style={labelStyle}>Category</label>
              <select
                style={inputStyle}
                value={createData.category || "ppf"}
                onChange={(e) => setCreateData({ ...createData, category: e.target.value })}
              >
                <option value="ppf">PPF</option>
                <option value="tint">Tint</option>
                <option value="ceramic">Ceramic</option>
              </select>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <div>
                <label style={labelStyle}>Name (EN)</label>
                <input
                  style={inputStyle}
                  value={createData.name_en || ""}
                  onChange={(e) => setCreateData({ ...createData, name_en: e.target.value })}
                  placeholder="Service name"
                />
              </div>
              <div>
                <label style={labelStyle}>Name (AR)</label>
                <input
                  style={{ ...inputStyle, direction: "rtl" as const }}
                  value={createData.name_ar || ""}
                  onChange={(e) => setCreateData({ ...createData, name_ar: e.target.value })}
                  placeholder="اسم الخدمة"
                />
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <div>
                <label style={labelStyle}>Price Small (SAR)</label>
                <input
                  type="number"
                  style={inputStyle}
                  value={createData.price_small || 0}
                  onChange={(e) => setCreateData({ ...createData, price_small: Number(e.target.value) })}
                />
              </div>
              <div>
                <label style={labelStyle}>Price Large (SAR)</label>
                <input
                  type="number"
                  style={inputStyle}
                  value={createData.price_large || 0}
                  onChange={(e) => setCreateData({ ...createData, price_large: Number(e.target.value) })}
                />
              </div>
            </div>
            <div>
              <label style={labelStyle}>Warranty</label>
              <input
                style={inputStyle}
                value={createData.warranty || ""}
                onChange={(e) => setCreateData({ ...createData, warranty: e.target.value })}
                placeholder="e.g. 5 years"
              />
            </div>

            {/* Image uploads */}
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
                  checked={createData.popular || false}
                  onChange={(e) => setCreateData({ ...createData, popular: e.target.checked })}
                  style={{ accentColor: "#F6BE00" }}
                />
                Popular
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "rgba(255,255,255,0.5)", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={createData.active !== false}
                  onChange={(e) => setCreateData({ ...createData, active: e.target.checked })}
                  style={{ accentColor: "#4CAF50" }}
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
                  padding: "10px 16px",
                  background: createSaving ? "rgba(246,190,0,0.5)" : "#F6BE00",
                  border: "none",
                  borderRadius: 8,
                  color: "#000",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: createSaving ? "not-allowed" : "pointer",
                }}
              >
                {createSaving ? "Creating..." : "Create Service"}
              </button>
              <button
                onClick={cancelCreate}
                style={{
                  padding: "10px 16px",
                  background: "transparent",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 8,
                  color: "rgba(255,255,255,0.5)",
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 16 }}>
        {services.map((s) => {
          const isEditing = editingId === s.id;

          return (
            <div
              key={s.id}
              style={{
                background: "#111",
                border: `1px solid ${s.active ? "rgba(255,255,255,0.06)" : "rgba(244,67,54,0.2)"}`,
                borderRadius: 14,
                overflow: "hidden",
                opacity: s.active ? 1 : 0.6,
              }}
            >
              {/* Thumbnail */}
              {s.image && (
                <div
                  style={{
                    height: 120,
                    background: `url(${s.image}) center/cover`,
                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                  }}
                />
              )}

              <div style={{ padding: 16 }}>
                {!isEditing ? (
                  <>
                    {/* View mode */}
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      <span
                        style={{
                          padding: "2px 8px",
                          borderRadius: 6,
                          fontSize: 10,
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          background: `${CATEGORY_COLORS[s.category] || "#666"}20`,
                          color: CATEGORY_COLORS[s.category] || "#666",
                        }}
                      >
                        {s.category}
                      </span>
                      {!s.active && (
                        <span style={{ fontSize: 10, color: "#f44336", fontWeight: 600 }}>
                          INACTIVE
                        </span>
                      )}
                    </div>

                    <div style={{ fontSize: 15, fontWeight: 600, color: "#fff", marginBottom: 2 }}>
                      {s.name_en}
                    </div>
                    <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 10, direction: "rtl" }}>
                      {s.name_ar}
                    </div>

                    <div style={{ display: "flex", gap: 16, marginBottom: 8 }}>
                      <div>
                        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", textTransform: "uppercase" }}>Small</div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>
                          {(s.price_small || 0).toLocaleString()} SAR
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", textTransform: "uppercase" }}>Large</div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>
                          {(s.price_large || 0).toLocaleString()} SAR
                        </div>
                      </div>
                    </div>

                    {s.warranty && (
                      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 10 }}>
                        Warranty: {s.warranty}
                      </div>
                    )}

                    {/* Toggles */}
                    <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
                      <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "rgba(255,255,255,0.5)", cursor: "pointer" }}>
                        <input
                          type="checkbox"
                          checked={s.popular}
                          onChange={(e) => toggleField(s.id, "popular", e.target.checked)}
                          style={{ accentColor: "#F6BE00" }}
                        />
                        Popular
                      </label>
                      <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "rgba(255,255,255,0.5)", cursor: "pointer" }}>
                        <input
                          type="checkbox"
                          checked={s.active}
                          onChange={(e) => toggleField(s.id, "active", e.target.checked)}
                          style={{ accentColor: "#4CAF50" }}
                        />
                        Active
                      </label>
                    </div>

                    <button
                      onClick={() => startEdit(s)}
                      style={{
                        padding: "8px 16px",
                        background: "rgba(246,190,0,0.1)",
                        border: "1px solid rgba(246,190,0,0.3)",
                        borderRadius: 8,
                        color: "#F6BE00",
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: "pointer",
                        transition: "all 0.15s",
                      }}
                    >
                      Edit Details
                    </button>
                  </>
                ) : (
                  <>
                    {/* Edit mode */}
                    <div style={{ display: "grid", gap: 12 }}>
                      <div>
                        <label style={labelStyle}>Name (EN)</label>
                        <input
                          style={inputStyle}
                          value={editData.name_en || ""}
                          onChange={(e) => setEditData({ ...editData, name_en: e.target.value })}
                        />
                      </div>
                      <div>
                        <label style={labelStyle}>Name (AR)</label>
                        <input
                          style={{ ...inputStyle, direction: "rtl" as const }}
                          value={editData.name_ar || ""}
                          onChange={(e) => setEditData({ ...editData, name_ar: e.target.value })}
                        />
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                        <div>
                          <label style={labelStyle}>Price Small (SAR)</label>
                          <input
                            type="number"
                            style={inputStyle}
                            value={editData.price_small || 0}
                            onChange={(e) => setEditData({ ...editData, price_small: Number(e.target.value) })}
                          />
                        </div>
                        <div>
                          <label style={labelStyle}>Price Large (SAR)</label>
                          <input
                            type="number"
                            style={inputStyle}
                            value={editData.price_large || 0}
                            onChange={(e) => setEditData({ ...editData, price_large: Number(e.target.value) })}
                          />
                        </div>
                      </div>
                      <div>
                        <label style={labelStyle}>Warranty</label>
                        <input
                          style={inputStyle}
                          value={editData.warranty || ""}
                          onChange={(e) => setEditData({ ...editData, warranty: e.target.value })}
                        />
                      </div>

                      {/* Image uploads */}
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
                            checked={editData.popular || false}
                            onChange={(e) => setEditData({ ...editData, popular: e.target.checked })}
                            style={{ accentColor: "#F6BE00" }}
                          />
                          Popular
                        </label>
                        <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "rgba(255,255,255,0.5)", cursor: "pointer" }}>
                          <input
                            type="checkbox"
                            checked={editData.active || false}
                            onChange={(e) => setEditData({ ...editData, active: e.target.checked })}
                            style={{ accentColor: "#4CAF50" }}
                          />
                          Active
                        </label>
                      </div>

                      <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                        <button
                          onClick={saveEdit}
                          disabled={saving}
                          style={{
                            flex: 1,
                            padding: "10px 16px",
                            background: saving ? "rgba(246,190,0,0.5)" : "#F6BE00",
                            border: "none",
                            borderRadius: 8,
                            color: "#000",
                            fontSize: 13,
                            fontWeight: 700,
                            cursor: saving ? "not-allowed" : "pointer",
                          }}
                        >
                          {saving ? "Saving..." : "Save"}
                        </button>
                        <button
                          onClick={cancelEdit}
                          style={{
                            padding: "10px 16px",
                            background: "transparent",
                            border: "1px solid rgba(255,255,255,0.1)",
                            borderRadius: 8,
                            color: "rgba(255,255,255,0.5)",
                            fontSize: 13,
                            cursor: "pointer",
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
