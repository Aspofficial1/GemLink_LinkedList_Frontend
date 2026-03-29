import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Edit3, Trash2, Save, X,
  ChevronDown, ChevronUp, RefreshCw, AlertTriangle,
} from "lucide-react";
import { getAllGems, getGemById, removeStage } from "../../api/api";

// =============================================================
// API helpers
// =============================================================
const BASE_URL = "http://localhost:4567/api";

async function updateStageApi(
  gemId: string,
  position: number,
  data: Record<string, any>
) {
  const res = await fetch(
    `${BASE_URL}/gems/${gemId}/stages/${position}`,
    {
      method:  "PUT",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(data),
    }
  );
  return res.json();
}

// =============================================================
// Editable fields config per stage type
// =============================================================
const EDITABLE_FIELDS: Record<string, { key: string; label: string; type: string }[]> = {
  MINING: [
    { key: "location",       label: "Location",         type: "text"   },
    { key: "personName",     label: "Miner Name",       type: "text"   },
    { key: "personIdNumber", label: "NIC Number",       type: "text"   },
    { key: "contactNumber",  label: "Contact Number",   type: "text"   },
    { key: "weightInCarats", label: "Weight (carats)",  type: "number" },
    { key: "priceInRupees",  label: "Price (Rs.)",      type: "number" },
    { key: "stageDate",      label: "Mining Date",      type: "date"   },
    { key: "notes",          label: "Notes",            type: "text"   },
  ],
  CUTTING: [
    { key: "location",       label: "Location",         type: "text"   },
    { key: "personName",     label: "Cutter Name",      type: "text"   },
    { key: "personIdNumber", label: "NIC Number",       type: "text"   },
    { key: "contactNumber",  label: "Contact Number",   type: "text"   },
    { key: "weightInCarats", label: "Weight (carats)",  type: "number" },
    { key: "priceInRupees",  label: "Price (Rs.)",      type: "number" },
    { key: "stageDate",      label: "Stage Date",       type: "date"   },
    { key: "certificateNumber", label: "Certificate No", type: "text"  },
    { key: "issuingAuthority",  label: "Issuing Authority", type: "text"},
    { key: "notes",          label: "Notes",            type: "text"   },
  ],
  TRADING: [
    { key: "location",       label: "Location",         type: "text"   },
    { key: "personName",     label: "Trader Name",      type: "text"   },
    { key: "personIdNumber", label: "NIC Number",       type: "text"   },
    { key: "contactNumber",  label: "Contact Number",   type: "text"   },
    { key: "weightInCarats", label: "Weight (carats)",  type: "number" },
    { key: "priceInRupees",  label: "Price (Rs.)",      type: "number" },
    { key: "stageDate",      label: "Stage Date",       type: "date"   },
    { key: "certificateNumber", label: "Certificate No", type: "text"  },
    { key: "issuingAuthority",  label: "Issuing Authority", type: "text"},
    { key: "notes",          label: "Notes",            type: "text"   },
  ],
  EXPORTING: [
    { key: "location",           label: "Location",           type: "text"   },
    { key: "personName",         label: "Exporter Name",      type: "text"   },
    { key: "personIdNumber",     label: "NIC Number",         type: "text"   },
    { key: "contactNumber",      label: "Contact Number",     type: "text"   },
    { key: "weightInCarats",     label: "Weight (carats)",    type: "number" },
    { key: "priceInRupees",      label: "Price (Rs.)",        type: "number" },
    { key: "stageDate",          label: "Stage Date",         type: "date"   },
    { key: "flightNumber",       label: "Flight Number",      type: "text"   },
    { key: "invoiceNumber",      label: "Invoice Number",     type: "text"   },
    { key: "destinationCountry", label: "Destination Country",type: "text"   },
    { key: "certificateNumber",  label: "Certificate No",     type: "text"   },
    { key: "issuingAuthority",   label: "Issuing Authority",  type: "text"   },
    { key: "notes",              label: "Notes",              type: "text"   },
  ],
  BUYING: [
    { key: "location",       label: "Location",         type: "text"   },
    { key: "personName",     label: "Buyer Name",       type: "text"   },
    { key: "personIdNumber", label: "NIC Number",       type: "text"   },
    { key: "contactNumber",  label: "Contact Number",   type: "text"   },
    { key: "weightInCarats", label: "Weight (carats)",  type: "number" },
    { key: "priceInRupees",  label: "Price (Rs.)",      type: "number" },
    { key: "stageDate",      label: "Stage Date",       type: "date"   },
    { key: "notes",          label: "Notes",            type: "text"   },
  ],
};

const DEFAULT_FIELDS = EDITABLE_FIELDS["CUTTING"];

const STAGE_COLORS: Record<string, string> = {
  MINING:    "#1B4F8A",
  CUTTING:   "#C9A84C",
  TRADING:   "#166534",
  EXPORTING: "#7C3AED",
  BUYING:    "#DC2626",
};

const inputStyle: React.CSSProperties = {
  width: "100%", height: 38, border: "1px solid #E8E8E8",
  borderRadius: 8, padding: "0 12px", fontSize: 13,
  outline: "none", background: "white",
};

const labelStyle: React.CSSProperties = {
  fontSize: 11, fontWeight: 600, color: "#555",
  marginBottom: 3, display: "block", textTransform: "uppercase",
  letterSpacing: 0.3,
};

const StageCard: React.FC<{
  stage:      any;
  index:      number;
  gemId:      string;
  totalStages:number;
  onDeleted:  () => void;
  onUpdated:  () => void;
}> = ({ stage, index, gemId, totalStages, onDeleted, onUpdated }) => {
  const [isEditing,    setIsEditing]    = useState(false);
  const [isSaving,     setIsSaving]     = useState(false);
  const [isDeleting,   setIsDeleting]   = useState(false);
  const [confirmDelete,setConfirmDelete]= useState(false);
  const [saveError,    setSaveError]    = useState("");
  const [saveSuccess,  setSaveSuccess]  = useState("");
  const [formData,     setFormData]     = useState<Record<string, string>>({});

  const stageType = stage.stageType || "CUTTING";
  const color     = STAGE_COLORS[stageType] || "#1B4F8A";
  const fields    = EDITABLE_FIELDS[stageType] || DEFAULT_FIELDS;

  const initForm = () => {
    const init: Record<string, string> = {};
    fields.forEach(f => {
      const val = stage[f.key];
      init[f.key] = val !== undefined && val !== null ? String(val) : "";
    });
    setFormData(init);
  };

  const handleEditClick = () => {
    initForm();
    setIsEditing(true);
    setSaveError("");
    setSaveSuccess("");
  };

  const handleCancel = () => {
    setIsEditing(false);
    setSaveError("");
    setSaveSuccess("");
    setFormData({});
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError("");
    setSaveSuccess("");
    try {
      const payload: Record<string, any> = {};
      fields.forEach(f => {
        const val = formData[f.key];
        if (val !== undefined && val !== "") {
          payload[f.key] = f.type === "number" ? Number(val) : val;
        }
      });

      const res = await updateStageApi(gemId, index, payload);
      if (res.success) {
        setSaveSuccess("Stage updated successfully!");
        setTimeout(() => {
          setIsEditing(false);
          setSaveSuccess("");
          onUpdated();
        }, 1200);
      } else {
        setSaveError(res.message || "Failed to update stage.");
      }
    } catch (e) {
      setSaveError("Could not connect to server.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    setSaveError("");
    try {
      const res = await removeStage(gemId, index);
      if (res.success) {
        onDeleted();
      } else {
        setSaveError(res.message || "Failed to delete stage.");
        setConfirmDelete(false);
      }
    } catch (e) {
      setSaveError("Could not connect to server.");
      setConfirmDelete(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-card border border-border rounded-2xl overflow-hidden"
      style={{ borderLeft: `4px solid ${color}` }}
    >
      {/* Stage header */}
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
            style={{ background: color }}
          >
            {index + 1}
          </div>
          <div>
            <p className="font-semibold text-text-primary text-sm">
              {stage.stageLabel || stageType}
            </p>
            <p className="text-xs text-text-muted mt-0.5">
              {stage.location} &middot; {stage.personName} &middot; {stage.date}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isEditing && (
            <>
              <button
                onClick={handleEditClick}
                className="h-8 px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-border bg-surface hover:bg-surface-2 transition-colors text-text-primary"
              >
                <Edit3 size={13} /> Edit
              </button>
              {!confirmDelete ? (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="h-8 px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 transition-colors"
                >
                  <Trash2 size={13} /> Delete
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-red-700 font-medium">Sure?</span>
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="h-8 px-3 rounded-lg text-xs font-bold bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    {isDeleting ? "Deleting..." : "Yes, Delete"}
                  </button>
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="h-8 px-3 rounded-lg text-xs font-semibold border border-border bg-card text-text-secondary hover:bg-surface-2"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </>
          )}
          {isEditing && (
            <button
              onClick={handleCancel}
              className="h-8 px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-border bg-card text-text-secondary hover:bg-surface-2"
            >
              <X size={13} /> Cancel
            </button>
          )}
        </div>
      </div>

      {/* Key values — always visible when not editing */}
      {!isEditing && (
        <div className="px-6 pb-4 grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-surface rounded-xl p-3">
            <p className="text-[10px] text-text-muted uppercase tracking-wider mb-0.5">Weight</p>
            <p className="text-sm font-bold text-text-primary">{stage.weightInCarats} ct</p>
          </div>
          <div className="bg-surface rounded-xl p-3">
            <p className="text-[10px] text-text-muted uppercase tracking-wider mb-0.5">Price</p>
            <p className="text-sm font-bold text-text-primary">
              Rs. {Number(stage.priceInRupees).toLocaleString()}
            </p>
          </div>
          {stage.certificateNumber && (
            <div className="bg-surface rounded-xl p-3">
              <p className="text-[10px] text-text-muted uppercase tracking-wider mb-0.5">Certificate</p>
              <p className="text-sm font-bold text-text-primary">{stage.certificateNumber}</p>
            </div>
          )}
          {stage.flightNumber && (
            <div className="bg-surface rounded-xl p-3">
              <p className="text-[10px] text-text-muted uppercase tracking-wider mb-0.5">Flight</p>
              <p className="text-sm font-bold text-text-primary">{stage.flightNumber}</p>
            </div>
          )}
        </div>
      )}

      {/* Error */}
      {saveError && (
        <div className="mx-6 mb-4 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
          {saveError}
        </div>
      )}

      {/* Edit form */}
      <AnimatePresence>
        {isEditing && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden border-t border-border"
          >
            <div className="px-6 py-5">
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-4">
                Editing Stage {index + 1} — {stage.stageLabel || stageType}
              </p>

              <div className="grid md:grid-cols-2 gap-4">
                {fields.map(field => (
                  <div key={field.key}>
                    <label style={labelStyle}>{field.label}</label>
                    <input
                      type={field.type}
                      value={formData[field.key] || ""}
                      onChange={e =>
                        setFormData(prev => ({
                          ...prev,
                          [field.key]: e.target.value,
                        }))
                      }
                      style={inputStyle}
                      onFocus={e => {
                        e.target.style.borderColor = "#C9A84C";
                        e.target.style.boxShadow = "0 0 0 3px rgba(201,168,76,0.12)";
                      }}
                      onBlur={e => {
                        e.target.style.borderColor = "#E8E8E8";
                        e.target.style.boxShadow = "none";
                      }}
                    />
                  </div>
                ))}
              </div>

              {saveSuccess && (
                <p className="mt-3 text-xs text-green-700 font-medium">
                  ✓ {saveSuccess}
                </p>
              )}

              <div className="flex items-center gap-3 mt-5">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="h-10 px-6 bg-primary text-primary-foreground rounded-lg text-sm font-semibold flex items-center gap-2 disabled:opacity-50"
                >
                  <Save size={14} />
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
                <button
                  onClick={handleCancel}
                  className="h-10 px-4 rounded-lg text-sm font-semibold border border-border bg-card text-text-secondary hover:bg-surface-2"
                >
                  Cancel
                </button>
                <p className="text-xs text-text-muted ml-auto">
                  Only changed fields will be saved to the audit log
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// =============================================================
// Main EditPage
// =============================================================
const EditPage: React.FC = () => {
  const [allGems, setAllGems]         = useState<any[]>([]);
  const [selectedGem, setSelectedGem] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [gemDetail, setGemDetail]     = useState<any>(null);
  const [loading, setLoading]         = useState(false);
  const [loadingGems, setLoadingGems] = useState(true);
  const [error, setError]             = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await getAllGems();
        if (res.success && res.data) {
          const gems = res.data as any[];
          setAllGems(gems);
          if (gems.length > 0) setSelectedGem(gems[0].gemId);
        }
      } catch (e) { console.error(e); }
      finally { setLoadingGems(false); }
    })();
  }, []);

  useEffect(() => {
    if (selectedGem) loadGemDetail(selectedGem);
  }, [selectedGem]);

  const loadGemDetail = async (gemId: string) => {
    setLoading(true);
    setError("");
    setGemDetail(null);
    try {
      const res = await getGemById(gemId);
      if (res.success && res.data) setGemDetail(res.data);
      else setError(res.message || "Gem not found.");
    } catch (e) {
      setError("Could not connect to server.");
    } finally { setLoading(false); }
  };

  const handleSearch = () => {
    if (searchInput.trim()) setSelectedGem(searchInput.trim());
  };

  const stages: any[] = gemDetail?.stageHistory || [];

  return (
    <div className="p-8 space-y-6">

      {/* Page header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-text-primary">
          Edit &amp; Delete Stages
        </h1>
        <p className="text-sm text-text-muted mt-1">
          Select a gem, then edit or delete any stage in its Doubly Linked List journey.
          Every change is saved to the audit trail automatically.
        </p>
      </div>

      {/* Gem selector */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            placeholder="Type Gem ID to load journey..."
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSearch()}
            className="w-full h-11 pl-11 pr-28 border border-border rounded-xl text-sm bg-background focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <button
            onClick={handleSearch}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-7 px-3 bg-primary text-primary-foreground rounded-lg text-xs font-semibold"
          >
            Load
          </button>
        </div>

        <div className="flex gap-2">
          <select
            value={selectedGem}
            onChange={e => {
              setSelectedGem(e.target.value);
              setSearchInput(e.target.value);
            }}
            disabled={loadingGems}
            className="flex-1 h-11 px-3 border border-border rounded-xl text-sm bg-background focus:outline-none focus:ring-1 focus:ring-ring"
          >
            {loadingGems ? (
              <option>Loading gems...</option>
            ) : (
              allGems.map(g => (
                <option key={g.gemId} value={g.gemId}>
                  {g.gemId} — {g.gemType || "Unknown"}
                </option>
              ))
            )}
          </select>
          <button
            onClick={() => selectedGem && loadGemDetail(selectedGem)}
            className="h-11 w-11 flex items-center justify-center border border-border rounded-xl bg-card hover:bg-surface-2 transition-colors"
          >
            <RefreshCw
              size={16}
              className={loading ? "animate-spin text-primary" : "text-text-muted"}
            />
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="border border-red-200 bg-red-50 rounded-xl px-4 py-3 text-sm text-red-700 flex items-center gap-2">
          <AlertTriangle size={16} />
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="text-center py-16 text-text-muted text-sm">
          Loading gem journey...
        </div>
      )}

      {/* Gem overview + stage cards */}
      {!loading && gemDetail && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          {/* Gem summary */}
          <div className="bg-card border border-border rounded-2xl px-6 py-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="font-mono text-xs text-text-muted">{gemDetail.gemId}</p>
                <p className="text-lg font-bold text-text-primary mt-0.5">
                  {gemDetail.gemType}
                </p>
                <p className="text-sm text-text-muted mt-1">
                  {stages.length} stage{stages.length !== 1 ? "s" : ""} in linked list &middot;{" "}
                  Origin: {gemDetail.origin} &middot;{" "}
                  {gemDetail.verified ? "✓ Ceylon Verified" : "Unverified"}
                </p>
              </div>
              <div className="flex gap-3">
                <div className="bg-surface border border-border rounded-xl px-4 py-3 text-center">
                  <p className="text-[10px] text-text-muted uppercase tracking-wider">
                    Current Weight
                  </p>
                  <p className="text-base font-bold text-text-primary mt-0.5">
                    {gemDetail.currentWeight} ct
                  </p>
                </div>
                <div className="bg-surface border border-border rounded-xl px-4 py-3 text-center">
                  <p className="text-[10px] text-text-muted uppercase tracking-wider">
                    Current Value
                  </p>
                  <p className="text-base font-bold text-primary mt-0.5">
                    Rs. {Number(gemDetail.currentPrice).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Info banner */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-xs text-blue-700 flex items-start gap-2">
            <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
            <span>
              Click <strong>Edit</strong> on any stage to modify its fields.
              Only fields you change will be saved. Click <strong>Delete</strong> to
              permanently remove a stage from the linked list.
              All changes are recorded in the <strong>Audit Trail</strong> automatically.
            </span>
          </div>

          {/* Stage cards */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">
              Linked List — {stages.length} Node{stages.length !== 1 ? "s" : ""}
            </p>

            {stages.length === 0 && (
              <div className="bg-card border border-border rounded-2xl p-8 text-center text-text-muted text-sm">
                No stages found for this gem.
              </div>
            )}

            {stages.map((stage: any, i: number) => (
              <StageCard
                key={`${gemDetail.gemId}-${i}`}
                stage={stage}
                index={i}
                gemId={gemDetail.gemId}
                totalStages={stages.length}
                onDeleted={() => loadGemDetail(gemDetail.gemId)}
                onUpdated={() => loadGemDetail(gemDetail.gemId)}
              />
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default EditPage;