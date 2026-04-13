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

const CATEGORY_COLORS: Record<string, string> = {
  ppf: "#F6BE00",
  tint: "#2196F3",
  ceramic: "#4CAF50",
};

function categoryBadgeClasses(category: string): string {
  const colors: Record<string, string> = {
    ppf: "bg-amber-500/10 text-amber-500",
    tint: "bg-blue-500/10 text-blue-500",
    ceramic: "bg-green-500/10 text-green-500",
  };
  return `px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${colors[category] || "bg-white/10 text-white/50"}`;
}

const inputCls = "w-full px-2.5 py-2 bg-[#050505] border border-white/10 rounded-lg text-white text-sm outline-none focus:border-gold/50 transition";
const labelCls = "block text-[11px] text-white/40 uppercase tracking-wider mb-1";

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
      <label className="block text-[11px] text-white/40 uppercase tracking-wider mb-1.5">
        {label}
      </label>

      {value && (
        <div
          className="w-full h-20 rounded-lg mb-2 bg-cover bg-center border border-white/[0.08]"
          style={{ backgroundImage: `url(${value})` }}
        />
      )}

      <div className="flex gap-1.5 items-center">
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/svg+xml"
          onChange={handleFile}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="px-3.5 py-1.5 bg-gold/10 border border-gold/30 rounded-md text-gold text-[11px] font-semibold cursor-pointer hover:bg-gold/20 transition disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
        >
          {uploading ? "Uploading..." : value ? "Replace" : "Upload"}
        </button>

        {value && (
          <div
            className="flex-1 text-[10px] text-white/30 overflow-hidden text-ellipsis whitespace-nowrap"
            title={value}
          >
            {value.split("/").pop()}
          </div>
        )}
      </div>

      {error && (
        <div className="text-[11px] text-red-500 mt-1">{error}</div>
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
      <div className="text-white/40 py-10 text-center">Loading services...</div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-white">Services</h1>
        <div className="flex items-center gap-3">
          {saveMsg && <span className="text-sm text-green-500">{saveMsg}</span>}
          {!creating && (
            <button
              onClick={startCreate}
              className="px-5 py-2 bg-gold hover:bg-gold-light text-black text-sm font-bold rounded-lg transition cursor-pointer border-none"
            >
              + New Service
            </button>
          )}
        </div>
      </div>

      {/* Category tabs + search */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
        <div className="flex gap-2 flex-wrap">
          {["all", "ppf", "tint", "ceramic"].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-4 py-1.5 rounded-full border text-sm cursor-pointer transition capitalize bg-transparent
                ${categoryFilter === cat
                  ? "border-gold bg-gold/10 text-gold font-semibold"
                  : "border-white/10 text-white/50 hover:border-white/20"
                }`}
            >
              {cat} ({categoryCounts[cat]})
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Search services..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full sm:w-auto sm:max-w-[240px] px-3.5 py-2 bg-[#111] border border-white/10 rounded-lg text-white text-sm placeholder:text-white/25 outline-none focus:border-gold/50 transition"
        />
      </div>

      {/* Create form */}
      {creating && (
        <div className="bg-[#111] border border-gold/30 rounded-xl p-5 mb-4">
          <div className="text-base font-bold text-gold mb-4">New Service</div>
          <div className="grid gap-3">
            <div>
              <label className={labelCls}>Category</label>
              <select
                className={inputCls}
                value={createData.category || "ppf"}
                onChange={(e) => setCreateData({ ...createData, category: e.target.value })}
              >
                <option value="ppf">PPF</option>
                <option value="tint">Tint</option>
                <option value="ceramic">Ceramic</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className={labelCls}>Name (EN)</label>
                <input
                  className={inputCls}
                  value={createData.name_en || ""}
                  onChange={(e) => setCreateData({ ...createData, name_en: e.target.value })}
                  placeholder="Service name"
                />
              </div>
              <div>
                <label className={labelCls}>Name (AR)</label>
                <input
                  className={`${inputCls} text-right`}
                  dir="rtl"
                  value={createData.name_ar || ""}
                  onChange={(e) => setCreateData({ ...createData, name_ar: e.target.value })}
                  placeholder="اسم الخدمة"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className={labelCls}>Price Small (SAR)</label>
                <input
                  type="number"
                  className={inputCls}
                  value={createData.price_small || 0}
                  onChange={(e) => setCreateData({ ...createData, price_small: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className={labelCls}>Price Large (SAR)</label>
                <input
                  type="number"
                  className={inputCls}
                  value={createData.price_large || 0}
                  onChange={(e) => setCreateData({ ...createData, price_large: Number(e.target.value) })}
                />
              </div>
            </div>

            <div>
              <label className={labelCls}>Warranty</label>
              <input
                className={inputCls}
                value={createData.warranty || ""}
                onChange={(e) => setCreateData({ ...createData, warranty: e.target.value })}
                placeholder="e.g. 5 years"
              />
            </div>

            <div>
              <label className={labelCls}>Tier</label>
              <input
                className={inputCls}
                value={createData.tier || ""}
                onChange={(e) => setCreateData({ ...createData, tier: e.target.value || null })}
                placeholder="e.g. SPRINT, TURBO, Plus"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className={labelCls}>Price Before Small (SAR)</label>
                <input
                  type="number"
                  className={inputCls}
                  value={createData.price_before_small ?? ""}
                  onChange={(e) =>
                    setCreateData({ ...createData, price_before_small: e.target.value ? Number(e.target.value) : null })
                  }
                  placeholder="Before discount"
                />
              </div>
              <div>
                <label className={labelCls}>Price Before Large (SAR)</label>
                <input
                  type="number"
                  className={inputCls}
                  value={createData.price_before_large ?? ""}
                  onChange={(e) =>
                    setCreateData({ ...createData, price_before_large: e.target.value ? Number(e.target.value) : null })
                  }
                  placeholder="Before discount"
                />
              </div>
            </div>

            <div>
              <label className={labelCls}>Details (EN)</label>
              <textarea
                className={`${inputCls} min-h-[80px] resize-y`}
                value={createData.details_en || ""}
                onChange={(e) => setCreateData({ ...createData, details_en: e.target.value || null })}
                placeholder="One detail per line"
              />
            </div>
            <div>
              <label className={labelCls}>Details (AR)</label>
              <textarea
                className={`${inputCls} min-h-[80px] resize-y text-right`}
                dir="rtl"
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
            <div className="grid grid-cols-2 gap-2">
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

            <div className="grid grid-cols-2 gap-2">
              <label className="flex items-center gap-1.5 text-xs text-white/50 cursor-pointer">
                <input
                  type="checkbox"
                  className="accent-gold"
                  checked={createData.popular || false}
                  onChange={(e) => setCreateData({ ...createData, popular: e.target.checked })}
                />
                Popular
              </label>
              <label className="flex items-center gap-1.5 text-xs text-white/50 cursor-pointer">
                <input
                  type="checkbox"
                  className="accent-green-500"
                  checked={createData.active !== false}
                  onChange={(e) => setCreateData({ ...createData, active: e.target.checked })}
                />
                Active
              </label>
            </div>

            <div className="flex gap-2 mt-1">
              <button
                onClick={saveCreate}
                disabled={createSaving}
                className="flex-1 px-4 py-2.5 bg-gold hover:bg-gold-light text-black text-sm font-bold rounded-lg transition cursor-pointer border-none disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createSaving ? "Creating..." : "Create Service"}
              </button>
              <button
                onClick={cancelCreate}
                className="px-4 py-2.5 bg-transparent border border-white/10 rounded-lg text-white/50 text-sm cursor-pointer hover:text-white/70 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Service grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredServices.map((s) => {
          const isEditing = editingId === s.id;

          return (
            <div
              key={s.id}
              className={`bg-[#111] border rounded-xl overflow-hidden ${s.active ? "border-white/[0.06]" : "border-red-500/20 opacity-60"}`}
            >
              {/* Thumbnail */}
              {s.image && (
                <div
                  className="h-[120px] bg-cover bg-center border-b border-white/[0.06]"
                  style={{ backgroundImage: `url(${s.image})` }}
                />
              )}

              <div className="p-4">
                {!isEditing ? (
                  <>
                    {/* View mode */}
                    <div className="flex items-center gap-2 mb-2">
                      <span className={categoryBadgeClasses(s.category)}>{s.category}</span>
                      {!s.active && (
                        <span className="text-[10px] text-red-500 font-semibold">INACTIVE</span>
                      )}
                    </div>

                    <div className="text-[15px] font-semibold text-white mb-0.5">{s.name_en}</div>
                    <div className="text-sm text-white/40 mb-2.5" dir="rtl">{s.name_ar}</div>

                    <div className="flex gap-4 mb-2">
                      <div>
                        <div className="text-[10px] text-white/30 uppercase">Small</div>
                        <div className="text-sm font-semibold text-white">
                          {(s.price_small || 0).toLocaleString()} SAR
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-white/30 uppercase">Large</div>
                        <div className="text-sm font-semibold text-white">
                          {(s.price_large || 0).toLocaleString()} SAR
                        </div>
                      </div>
                    </div>

                    {s.warranty && (
                      <div className="text-xs text-white/40 mb-2.5">Warranty: {s.warranty}</div>
                    )}

                    <div className="flex gap-3 mb-3">
                      <label className="flex items-center gap-1.5 text-xs text-white/50 cursor-pointer">
                        <input
                          type="checkbox"
                          className="accent-gold"
                          checked={s.popular}
                          onChange={(e) => toggleField(s.id, "popular", e.target.checked)}
                        />
                        Popular
                      </label>
                      <label className="flex items-center gap-1.5 text-xs text-white/50 cursor-pointer">
                        <input
                          type="checkbox"
                          className="accent-green-500"
                          checked={s.active}
                          onChange={(e) => toggleField(s.id, "active", e.target.checked)}
                        />
                        Active
                      </label>
                    </div>

                    <button
                      onClick={() => startEdit(s)}
                      className="px-4 py-2 bg-gold/10 border border-gold/30 rounded-lg text-gold text-xs font-semibold cursor-pointer hover:bg-gold/20 transition"
                    >
                      Edit Details
                    </button>
                  </>
                ) : (
                  <>
                    {/* Edit mode */}
                    <div className="grid gap-3">
                      <div>
                        <label className={labelCls}>Name (EN)</label>
                        <input
                          className={inputCls}
                          value={editData.name_en || ""}
                          onChange={(e) => setEditData({ ...editData, name_en: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className={labelCls}>Name (AR)</label>
                        <input
                          className={`${inputCls} text-right`}
                          dir="rtl"
                          value={editData.name_ar || ""}
                          onChange={(e) => setEditData({ ...editData, name_ar: e.target.value })}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className={labelCls}>Price Small (SAR)</label>
                          <input
                            type="number"
                            className={inputCls}
                            value={editData.price_small || 0}
                            onChange={(e) => setEditData({ ...editData, price_small: Number(e.target.value) })}
                          />
                        </div>
                        <div>
                          <label className={labelCls}>Price Large (SAR)</label>
                          <input
                            type="number"
                            className={inputCls}
                            value={editData.price_large || 0}
                            onChange={(e) => setEditData({ ...editData, price_large: Number(e.target.value) })}
                          />
                        </div>
                      </div>

                      <div>
                        <label className={labelCls}>Warranty</label>
                        <input
                          className={inputCls}
                          value={editData.warranty || ""}
                          onChange={(e) => setEditData({ ...editData, warranty: e.target.value })}
                        />
                      </div>

                      <div>
                        <label className={labelCls}>Tier</label>
                        <input
                          className={inputCls}
                          value={editData.tier || ""}
                          onChange={(e) => setEditData({ ...editData, tier: e.target.value || null })}
                          placeholder="e.g. SPRINT, TURBO, Plus"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className={labelCls}>Price Before Small (SAR)</label>
                          <input
                            type="number"
                            className={inputCls}
                            value={editData.price_before_small ?? ""}
                            onChange={(e) =>
                              setEditData({ ...editData, price_before_small: e.target.value ? Number(e.target.value) : null })
                            }
                            placeholder="Before discount"
                          />
                        </div>
                        <div>
                          <label className={labelCls}>Price Before Large (SAR)</label>
                          <input
                            type="number"
                            className={inputCls}
                            value={editData.price_before_large ?? ""}
                            onChange={(e) =>
                              setEditData({ ...editData, price_before_large: e.target.value ? Number(e.target.value) : null })
                            }
                            placeholder="Before discount"
                          />
                        </div>
                      </div>

                      <div>
                        <label className={labelCls}>Details (EN)</label>
                        <textarea
                          className={`${inputCls} min-h-[80px] resize-y`}
                          value={editData.details_en || ""}
                          onChange={(e) => setEditData({ ...editData, details_en: e.target.value || null })}
                          placeholder="One detail per line"
                        />
                      </div>
                      <div>
                        <label className={labelCls}>Details (AR)</label>
                        <textarea
                          className={`${inputCls} min-h-[80px] resize-y text-right`}
                          dir="rtl"
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
                      <div className="grid grid-cols-2 gap-2">
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

                      <div className="grid grid-cols-2 gap-2">
                        <label className="flex items-center gap-1.5 text-xs text-white/50 cursor-pointer">
                          <input
                            type="checkbox"
                            className="accent-gold"
                            checked={editData.popular || false}
                            onChange={(e) => setEditData({ ...editData, popular: e.target.checked })}
                          />
                          Popular
                        </label>
                        <label className="flex items-center gap-1.5 text-xs text-white/50 cursor-pointer">
                          <input
                            type="checkbox"
                            className="accent-green-500"
                            checked={editData.active || false}
                            onChange={(e) => setEditData({ ...editData, active: e.target.checked })}
                          />
                          Active
                        </label>
                      </div>

                      <div className="flex gap-2 mt-1">
                        <button
                          onClick={saveEdit}
                          disabled={saving}
                          className="flex-1 px-4 py-2.5 bg-gold hover:bg-gold-light text-black text-sm font-bold rounded-lg transition cursor-pointer border-none disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {saving ? "Saving..." : "Save"}
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="px-4 py-2.5 bg-transparent border border-white/10 rounded-lg text-white/50 text-sm cursor-pointer hover:text-white/70 transition"
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
