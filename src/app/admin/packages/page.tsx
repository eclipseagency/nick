"use client";

import { useEffect, useState } from "react";

interface Package {
  id: string;
  name_en: string;
  name_ar: string;
  desc_en: string | null;
  desc_ar: string | null;
  tier: string;
  discount: number;
  warranty_en: string | null;
  warranty_ar: string | null;
  service_ids: string[];
  sort_order: number;
  active: boolean;
}

interface Service {
  id: string;
  name_en: string;
  category: string;
}

const TIER_COLORS: Record<string, string> = {
  basic: "#9E9E9E",
  premium: "#F6BE00",
  vip: "#E040FB",
};

export default function PackagesPage() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Package>>({});
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/packages?all=true").then((r) => r.json()),
      fetch("/api/services?all=true").then((r) => r.json()),
    ])
      .then(([pkgs, svcs]) => {
        if (Array.isArray(pkgs)) setPackages(pkgs);
        if (Array.isArray(svcs)) setServices(svcs);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function getServiceName(id: string) {
    const s = services.find((sv) => sv.id === id);
    return s ? s.name_en : id;
  }

  function startEdit(p: Package) {
    setEditingId(p.id);
    setEditData({ ...p });
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
      const res = await fetch("/api/packages", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingId, ...editData }),
      });
      if (res.ok) {
        const updated = await res.json();
        setPackages((prev) => prev.map((p) => (p.id === editingId ? updated : p)));
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

  function toggleServiceId(sid: string) {
    const current = editData.service_ids || [];
    if (current.includes(sid)) {
      setEditData({ ...editData, service_ids: current.filter((id) => id !== sid) });
    } else {
      setEditData({ ...editData, service_ids: [...current, sid] });
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
        Loading packages...
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#fff" }}>Packages</h1>
        {saveMsg && (
          <span style={{ fontSize: 13, color: "#4CAF50" }}>{saveMsg}</span>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: 16 }}>
        {packages.map((p) => {
          const isEditing = editingId === p.id;
          const tierColor = TIER_COLORS[p.tier] || "#666";

          return (
            <div
              key={p.id}
              style={{
                background: "#111",
                border: `1px solid ${tierColor}30`,
                borderRadius: 14,
                padding: 20,
                opacity: p.active ? 1 : 0.6,
              }}
            >
              {!isEditing ? (
                <>
                  {/* View mode */}
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                    <span
                      style={{
                        padding: "3px 10px",
                        borderRadius: 6,
                        fontSize: 11,
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        background: `${tierColor}20`,
                        color: tierColor,
                      }}
                    >
                      {p.tier}
                    </span>
                    {!p.active && (
                      <span style={{ fontSize: 10, color: "#f44336", fontWeight: 600 }}>
                        INACTIVE
                      </span>
                    )}
                  </div>

                  <div style={{ fontSize: 18, fontWeight: 700, color: "#fff", marginBottom: 2 }}>
                    {p.name_en}
                  </div>
                  <div style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", marginBottom: 12, direction: "rtl" }}>
                    {p.name_ar}
                  </div>

                  {p.desc_en && (
                    <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 12, lineHeight: 1.5 }}>
                      {p.desc_en}
                    </div>
                  )}

                  <div style={{ display: "flex", gap: 20, marginBottom: 12 }}>
                    {p.discount > 0 && (
                      <div>
                        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", textTransform: "uppercase" }}>Discount</div>
                        <div style={{ fontSize: 16, fontWeight: 700, color: "#4CAF50" }}>
                          {p.discount}%
                        </div>
                      </div>
                    )}
                    {p.warranty_en && (
                      <div>
                        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", textTransform: "uppercase" }}>Warranty</div>
                        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)" }}>
                          {p.warranty_en}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Included services */}
                  {p.service_ids?.length > 0 && (
                    <div style={{ marginBottom: 14 }}>
                      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
                        Included Services ({p.service_ids.length})
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {p.service_ids.map((sid) => (
                          <span
                            key={sid}
                            style={{
                              padding: "3px 10px",
                              background: "rgba(255,255,255,0.05)",
                              borderRadius: 6,
                              fontSize: 11,
                              color: "rgba(255,255,255,0.6)",
                            }}
                          >
                            {getServiceName(sid)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => startEdit(p)}
                    style={{
                      padding: "8px 16px",
                      background: `${tierColor}15`,
                      border: `1px solid ${tierColor}40`,
                      borderRadius: 8,
                      color: tierColor,
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                  >
                    Edit Package
                  </button>
                </>
              ) : (
                <>
                  {/* Edit mode */}
                  <div style={{ display: "grid", gap: 12 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
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
                    </div>

                    <div>
                      <label style={labelStyle}>Description (EN)</label>
                      <textarea
                        style={{ ...inputStyle, minHeight: 60, resize: "vertical" }}
                        value={editData.desc_en || ""}
                        onChange={(e) => setEditData({ ...editData, desc_en: e.target.value })}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Description (AR)</label>
                      <textarea
                        style={{ ...inputStyle, minHeight: 60, resize: "vertical", direction: "rtl" as const }}
                        value={editData.desc_ar || ""}
                        onChange={(e) => setEditData({ ...editData, desc_ar: e.target.value })}
                      />
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                      <div>
                        <label style={labelStyle}>Discount (%)</label>
                        <input
                          type="number"
                          style={inputStyle}
                          value={editData.discount || 0}
                          onChange={(e) => setEditData({ ...editData, discount: Number(e.target.value) })}
                        />
                      </div>
                      <div>
                        <label style={labelStyle}>Tier</label>
                        <select
                          style={inputStyle}
                          value={editData.tier || "basic"}
                          onChange={(e) => setEditData({ ...editData, tier: e.target.value })}
                        >
                          <option value="basic">Basic</option>
                          <option value="premium">Premium</option>
                          <option value="vip">VIP</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                      <div>
                        <label style={labelStyle}>Warranty (EN)</label>
                        <input
                          style={inputStyle}
                          value={editData.warranty_en || ""}
                          onChange={(e) => setEditData({ ...editData, warranty_en: e.target.value })}
                        />
                      </div>
                      <div>
                        <label style={labelStyle}>Warranty (AR)</label>
                        <input
                          style={{ ...inputStyle, direction: "rtl" as const }}
                          value={editData.warranty_ar || ""}
                          onChange={(e) => setEditData({ ...editData, warranty_ar: e.target.value })}
                        />
                      </div>
                    </div>

                    {/* Service picker */}
                    <div>
                      <label style={labelStyle}>Included Services</label>
                      <div
                        style={{
                          background: "#050505",
                          border: "1px solid rgba(255,255,255,0.1)",
                          borderRadius: 8,
                          padding: 10,
                          maxHeight: 180,
                          overflowY: "auto",
                          display: "flex",
                          flexDirection: "column",
                          gap: 4,
                        }}
                      >
                        {services.map((svc) => {
                          const checked = (editData.service_ids || []).includes(svc.id);
                          return (
                            <label
                              key={svc.id}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                padding: "4px 6px",
                                borderRadius: 6,
                                fontSize: 12,
                                color: checked ? "#fff" : "rgba(255,255,255,0.5)",
                                cursor: "pointer",
                                background: checked ? "rgba(246,190,0,0.08)" : "transparent",
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => toggleServiceId(svc.id)}
                                style={{ accentColor: "#F6BE00" }}
                              />
                              <span style={{ flex: 1 }}>{svc.name_en}</span>
                              <span
                                style={{
                                  fontSize: 9,
                                  textTransform: "uppercase",
                                  color: "rgba(255,255,255,0.3)",
                                }}
                              >
                                {svc.category}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "rgba(255,255,255,0.5)", cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={editData.active || false}
                        onChange={(e) => setEditData({ ...editData, active: e.target.checked })}
                        style={{ accentColor: "#4CAF50" }}
                      />
                      Active
                    </label>

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
          );
        })}
      </div>
    </div>
  );
}
