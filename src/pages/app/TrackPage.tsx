import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, X } from "lucide-react";
import BlurText from "../../components/reactbits/BlurText";
import { getAllGems, getGemById, getFraudRiskScore, addStage } from "../../api/api";

// Stage type options matching the backend GemStage enum exactly
const STAGE_TYPES = [
  { value: "CUTTING",   label: "Cutting and Polishing Stage" },
  { value: "TRADING",   label: "Trading Stage" },
  { value: "EXPORTING", label: "Exporting Stage" },
  { value: "BUYING",    label: "Buying Stage" },
];

const TrackPage: React.FC = () => {
  const [searchInput, setSearchInput]     = useState("BS-1773990209789");
  const [selectedGem, setSelectedGem]     = useState<string | null>("BS-1773990209789");
  const [reversed, setReversed]           = useState(false);
  const [allGems, setAllGems]             = useState<any[]>([]);
  const [gemDetail, setGemDetail]         = useState<any>(null);
  const [riskData, setRiskData]           = useState<any>(null);
  const [loading, setLoading]             = useState(false);
  const [loadingGems, setLoadingGems]     = useState(true);

  // Add stage form state
  const [showAddStage, setShowAddStage]   = useState(false);
  const [addingStage, setAddingStage]     = useState(false);
  const [stageError, setStageError]       = useState("");
  const [stageSuccess, setStageSuccess]   = useState("");
  const [stageForm, setStageForm]         = useState({
    stageType:      "CUTTING",
    location:       "",
    personName:     "",
    personIdNumber: "",
    contactNumber:  "",
    weightInCarats: "",
    priceInRupees:  "",
    stageDate:      "",
    // Export specific
    flightNumber:       "",
    invoiceNumber:      "",
    destinationCountry: "",
    // Certificate
    certificateNumber:  "",
    issuingAuthority:   "",
    notes:              "",
  });

  const updateStageForm = (key: string, val: string) =>
    setStageForm(prev => ({ ...prev, [key]: val }));

  // Load all gem IDs for the quick select chips
  useEffect(() => {
    const fetchAllGems = async () => {
      try {
        const res = await getAllGems();
        if (res.success && res.data) {
          setAllGems(res.data as any[]);
        }
      } catch (err) {
        console.error("Failed to load gems:", err);
      } finally {
        setLoadingGems(false);
      }
    };
    fetchAllGems();
  }, []);

  // Load gem detail and risk score when selectedGem changes
  useEffect(() => {
    if (!selectedGem) return;
    fetchGemData(selectedGem);
  }, [selectedGem]);

  const fetchGemData = async (gemId: string) => {
    setLoading(true);
    try {
      const [gemRes, riskRes] = await Promise.all([
        getGemById(gemId),
        getFraudRiskScore(gemId),
      ]);
      if (gemRes.success && gemRes.data) setGemDetail(gemRes.data);
      else setGemDetail(null);
      if (riskRes.success && riskRes.data) setRiskData(riskRes.data);
      else setRiskData(null);
    } catch (err) {
      console.error("Failed to load gem detail:", err);
      setGemDetail(null);
      setRiskData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (searchInput.trim()) {
      setSelectedGem(searchInput.trim());
      setReversed(false);
      setShowAddStage(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  // Handle add stage form submission
  const handleAddStage = async () => {
    if (!selectedGem) return;
    setStageError("");
    setStageSuccess("");

    // Validate required fields
    if (!stageForm.location.trim()) {
      setStageError("Location is required.");
      return;
    }
    if (!stageForm.personName.trim()) {
      setStageError("Person Name is required.");
      return;
    }
    if (!stageForm.weightInCarats.trim() || isNaN(Number(stageForm.weightInCarats)) || Number(stageForm.weightInCarats) <= 0) {
      setStageError("A valid weight in carats is required.");
      return;
    }
    if (!stageForm.priceInRupees.trim() || isNaN(Number(stageForm.priceInRupees)) || Number(stageForm.priceInRupees) <= 0) {
      setStageError("A valid price in rupees is required.");
      return;
    }
    if (!stageForm.stageDate.trim()) {
      setStageError("Stage date is required.");
      return;
    }

    setAddingStage(true);
    try {
      const payload: any = {
        stageType:      stageForm.stageType,
        location:       stageForm.location.trim(),
        personName:     stageForm.personName.trim(),
        personIdNumber: stageForm.personIdNumber.trim(),
        contactNumber:  stageForm.contactNumber.trim(),
        weightInCarats: Number(stageForm.weightInCarats),
        priceInRupees:  Number(stageForm.priceInRupees),
        stageDate:      stageForm.stageDate.trim(),
      };

      // Add export details if EXPORTING stage
      if (stageForm.stageType === "EXPORTING") {
        if (stageForm.flightNumber.trim())       payload.flightNumber       = stageForm.flightNumber.trim();
        if (stageForm.invoiceNumber.trim())      payload.invoiceNumber      = stageForm.invoiceNumber.trim();
        if (stageForm.destinationCountry.trim()) payload.destinationCountry = stageForm.destinationCountry.trim();
      }

      // Add certificate details if provided
      if (stageForm.certificateNumber.trim()) {
        payload.certificateNumber = stageForm.certificateNumber.trim();
        payload.issuingAuthority  = stageForm.issuingAuthority.trim();
      }

      // Add notes if provided
      if (stageForm.notes.trim()) {
        payload.notes = stageForm.notes.trim();
      }

      const res = await addStage(selectedGem, payload);

      if (res.success) {
        setStageSuccess(`${stageForm.stageType} stage added successfully!`);
        // Reset form
        setStageForm({
          stageType: "CUTTING", location: "", personName: "",
          personIdNumber: "", contactNumber: "", weightInCarats: "",
          priceInRupees: "", stageDate: "", flightNumber: "",
          invoiceNumber: "", destinationCountry: "", certificateNumber: "",
          issuingAuthority: "", notes: "",
        });
        // Refresh gem data to show new stage
        setTimeout(() => {
          setStageSuccess("");
          setShowAddStage(false);
          fetchGemData(selectedGem);
          // Refresh all gems list
          getAllGems().then(r => { if (r.success) setAllGems(r.data as any[]); });
        }, 1500);
      } else {
        setStageError(res.message || "Failed to add stage.");
      }
    } catch (err) {
      console.error("Add stage error:", err);
      setStageError("Could not connect to the server.");
    } finally {
      setAddingStage(false);
    }
  };

  const stageHistory: any[] = gemDetail?.stageHistory || [];
  const displayJourney = reversed ? [...stageHistory].reverse() : stageHistory;
  const riskScore     = riskData?.score ?? 0;
  const riskColor     = riskScore <= 30 ? "#166534" : riskScore <= 60 ? "#92400E" : "#991B1B";
  const circumference = 2 * Math.PI * 65;
  const riskFactors: any[] = riskData?.riskFactors || [];

  // Inline input style for add stage form
  const inputStyle: React.CSSProperties = {
    width: "100%", height: 40, border: "1px solid #E8E8E8", borderRadius: 8,
    padding: "0 12px", fontSize: 13, outline: "none", background: "white",
  };
  const labelStyle: React.CSSProperties = {
    fontSize: 12, fontWeight: 600, color: "#0A0A0A",
    marginBottom: 4, display: "block",
  };
  const fieldStyle: React.CSSProperties = { marginBottom: 14 };

  return (
    <div className="p-8 space-y-6">
      {/* Search bar */}
      <div className="relative">
        <Search size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          placeholder="Enter Gem ID, gem type, or miner name..."
          value={searchInput}
          onChange={e => setSearchInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full h-14 pl-12 pr-36 border-[1.5px] border-border rounded-xl text-base bg-background focus:outline-none focus:ring-1 focus:ring-ring"
        />
        <button
          onClick={handleSearch}
          className="absolute right-2 top-1/2 -translate-y-1/2 h-10 px-5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold"
        >
          Search
        </button>
      </div>

      {/* Quick select chips */}
      <div className="flex gap-2 flex-wrap">
        {loadingGems ? (
          <span className="text-xs text-text-muted">Loading gems...</span>
        ) : (
          allGems.map(g => (
            <button
              key={g.gemId}
              onClick={() => {
                setSelectedGem(g.gemId);
                setSearchInput(g.gemId);
                setReversed(false);
                setShowAddStage(false);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                selectedGem === g.gemId
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-surface border-border text-text-secondary hover:bg-surface-2"
              }`}
            >
              {(g.gemId || "").slice(0, 15)}
            </button>
          ))
        )}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="text-center py-12 text-text-muted text-sm">
          Loading gem journey...
        </div>
      )}

      {/* Not found state */}
      {!loading && selectedGem && !gemDetail && (
        <div className="text-center py-12 text-text-muted text-sm">
          Gem not found: {selectedGem}
        </div>
      )}

      {/* Journey timeline and risk score */}
      {!loading && displayJourney.length > 0 && (
        <div className="grid lg:grid-cols-[1fr_280px] gap-6">
          {/* Timeline */}
          <div className="bg-surface border border-border rounded-2xl p-8 overflow-x-auto">
            <div className="flex gap-4 min-w-max">
              {displayJourney.map((s: any, i: number) => {
                const isCurrent = s.isCurrent;
                return (
                  <React.Fragment key={i}>
                    <motion.div
                      initial={{ opacity: 0, x: reversed ? 20 : -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className={`w-[200px] border rounded-xl p-5 flex-shrink-0 ${
                        isCurrent ? "border-2 border-gold bg-[#FFFDF5]" : "border-border bg-card"
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold mx-auto mb-3">
                        {reversed ? stageHistory.length - i : i + 1}
                      </div>
                      <p className="text-[13px] font-semibold text-text-primary text-center">
                        {s.stageLabel || s.stageType}
                      </p>
                      <p className="text-xs text-text-muted text-center mt-1">{s.location}</p>
                      <p className="text-xs text-text-muted text-center">{s.personName}</p>
                      <p className="text-[11px] text-text-muted text-center mt-1">{s.date}</p>
                      <div className="text-xs font-semibold text-text-primary text-center mt-2">
                        {s.weightInCarats} ct | Rs. {Number(s.priceInRupees).toLocaleString()}
                      </div>
                    </motion.div>
                    {i < displayJourney.length - 1 && (
                      <div className="flex items-center flex-shrink-0">
                        <svg width="60" height="24" viewBox="0 0 60 24">
                          <path d="M0,12 L48,12 M42,6 L48,12 L42,18" stroke="#D0D0D0" strokeWidth="1.5" fill="none" />
                        </svg>
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            {/* Timeline buttons */}
            <div className="mt-6 flex items-center gap-4 flex-wrap">
              <button
                onClick={() => setReversed(!reversed)}
                className="h-9 px-4 bg-primary text-primary-foreground rounded-lg text-sm font-semibold"
              >
                {reversed ? "View Forward" : "View Backward"}
              </button>
              <span className="text-sm text-text-muted">
                {reversed ? "Backward traversal using prev pointer" : "Forward traversal using next pointer"} — only possible with Doubly Linked List
              </span>
              <button
                onClick={() => { setShowAddStage(!showAddStage); setStageError(""); setStageSuccess(""); }}
                className="h-9 px-4 rounded-lg text-sm font-semibold flex items-center gap-2 ml-auto border border-border bg-card text-text-primary hover:bg-surface-2 transition-colors"
              >
                {showAddStage ? <X size={14} /> : <Plus size={14} />}
                {showAddStage ? "Cancel" : "Add Next Stage"}
              </button>
            </div>

            {/* Add Stage Form */}
            <AnimatePresence>
              {showAddStage && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                  className="mt-6 border border-border rounded-xl p-6 bg-card"
                >
                  <p className="text-sm font-semibold text-text-primary mb-4">
                    Add New Stage to {selectedGem}
                  </p>

                  <div className="grid md:grid-cols-2 gap-x-6">
                    {/* Stage Type */}
                    <div style={fieldStyle}>
                      <label style={labelStyle}>Stage Type *</label>
                      <select
                        value={stageForm.stageType}
                        onChange={e => updateStageForm("stageType", e.target.value)}
                        style={{ ...inputStyle }}
                      >
                        {STAGE_TYPES.map(s => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>
                    </div>

                    {/* Stage Date */}
                    <div style={fieldStyle}>
                      <label style={labelStyle}>Stage Date *</label>
                      <input
                        type="date"
                        value={stageForm.stageDate}
                        onChange={e => updateStageForm("stageDate", e.target.value)}
                        style={inputStyle}
                      />
                    </div>

                    {/* Location */}
                    <div style={fieldStyle}>
                      <label style={labelStyle}>Location *</label>
                      <input
                        type="text"
                        placeholder="e.g. Beruwala, Gem Street"
                        value={stageForm.location}
                        onChange={e => updateStageForm("location", e.target.value)}
                        style={inputStyle}
                      />
                    </div>

                    {/* Person Name */}
                    <div style={fieldStyle}>
                      <label style={labelStyle}>Person Name *</label>
                      <input
                        type="text"
                        placeholder="e.g. Mohammed Cassim"
                        value={stageForm.personName}
                        onChange={e => updateStageForm("personName", e.target.value)}
                        style={inputStyle}
                      />
                    </div>

                    {/* Person ID */}
                    <div style={fieldStyle}>
                      <label style={labelStyle}>Person NIC Number</label>
                      <input
                        type="text"
                        placeholder="e.g. 198756781234"
                        value={stageForm.personIdNumber}
                        onChange={e => updateStageForm("personIdNumber", e.target.value)}
                        style={inputStyle}
                      />
                    </div>

                    {/* Contact */}
                    <div style={fieldStyle}>
                      <label style={labelStyle}>Contact Number</label>
                      <input
                        type="text"
                        placeholder="e.g. 0712345678"
                        value={stageForm.contactNumber}
                        onChange={e => updateStageForm("contactNumber", e.target.value)}
                        style={inputStyle}
                      />
                    </div>

                    {/* Weight */}
                    <div style={fieldStyle}>
                      <label style={labelStyle}>Weight (carats) *</label>
                      <input
                        type="number"
                        placeholder="e.g. 4.8"
                        value={stageForm.weightInCarats}
                        onChange={e => updateStageForm("weightInCarats", e.target.value)}
                        style={inputStyle}
                      />
                    </div>

                    {/* Price */}
                    <div style={fieldStyle}>
                      <label style={labelStyle}>Price (Rs.) *</label>
                      <input
                        type="number"
                        placeholder="e.g. 150000"
                        value={stageForm.priceInRupees}
                        onChange={e => updateStageForm("priceInRupees", e.target.value)}
                        style={inputStyle}
                      />
                    </div>

                    {/* Certificate Number */}
                    <div style={fieldStyle}>
                      <label style={labelStyle}>Certificate Number</label>
                      <input
                        type="text"
                        placeholder="e.g. GIC-2025-001"
                        value={stageForm.certificateNumber}
                        onChange={e => updateStageForm("certificateNumber", e.target.value)}
                        style={inputStyle}
                      />
                    </div>

                    {/* Issuing Authority */}
                    <div style={fieldStyle}>
                      <label style={labelStyle}>Issuing Authority</label>
                      <input
                        type="text"
                        placeholder="e.g. National Gem Authority"
                        value={stageForm.issuingAuthority}
                        onChange={e => updateStageForm("issuingAuthority", e.target.value)}
                        style={inputStyle}
                      />
                    </div>

                    {/* Export fields — only shown for EXPORTING stage */}
                    {stageForm.stageType === "EXPORTING" && (
                      <>
                        <div style={fieldStyle}>
                          <label style={labelStyle}>Flight Number</label>
                          <input
                            type="text"
                            placeholder="e.g. EK-653"
                            value={stageForm.flightNumber}
                            onChange={e => updateStageForm("flightNumber", e.target.value)}
                            style={inputStyle}
                          />
                        </div>
                        <div style={fieldStyle}>
                          <label style={labelStyle}>Invoice Number</label>
                          <input
                            type="text"
                            placeholder="e.g. INV-2025-001"
                            value={stageForm.invoiceNumber}
                            onChange={e => updateStageForm("invoiceNumber", e.target.value)}
                            style={inputStyle}
                          />
                        </div>
                        <div style={fieldStyle}>
                          <label style={labelStyle}>Destination Country</label>
                          <input
                            type="text"
                            placeholder="e.g. Dubai"
                            value={stageForm.destinationCountry}
                            onChange={e => updateStageForm("destinationCountry", e.target.value)}
                            style={inputStyle}
                          />
                        </div>
                      </>
                    )}

                    {/* Notes — full width */}
                    <div style={{ ...fieldStyle, gridColumn: "1 / -1" }}>
                      <label style={labelStyle}>Notes</label>
                      <input
                        type="text"
                        placeholder="Additional information about this stage..."
                        value={stageForm.notes}
                        onChange={e => updateStageForm("notes", e.target.value)}
                        style={inputStyle}
                      />
                    </div>
                  </div>

                  {/* Error and success messages */}
                  {stageError && (
                    <p style={{ fontSize: 13, color: "#991B1B", marginBottom: 12 }}>{stageError}</p>
                  )}
                  {stageSuccess && (
                    <p style={{ fontSize: 13, color: "#166534", marginBottom: 12 }}>{stageSuccess}</p>
                  )}

                  {/* Submit button */}
                  <button
                    onClick={handleAddStage}
                    disabled={addingStage}
                    className="h-10 px-6 bg-primary text-primary-foreground rounded-lg text-sm font-semibold disabled:opacity-50"
                  >
                    {addingStage ? "Adding Stage..." : "Add Stage"}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Fraud Risk Score */}
          <div className="bg-card border border-border rounded-2xl p-6 flex flex-col items-center">
            <BlurText
              text="Fraud Risk Score"
              delay={60}
              direction="top"
              animateBy="words"
              className="text-sm font-semibold text-text-primary mb-4"
            />
            <svg width="160" height="160" viewBox="0 0 160 160">
              <circle cx="80" cy="80" r="65" fill="none" stroke="#E8E8E8" strokeWidth="10" />
              <motion.circle
                cx="80" cy="80" r="65" fill="none" stroke={riskColor} strokeWidth="10"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: circumference - (circumference * riskScore) / 100 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                strokeLinecap="round"
                transform="rotate(-90 80 80)"
              />
              <text x="80" y="75" textAnchor="middle" className="font-display text-4xl font-extrabold" fill={riskColor}>
                {riskScore}
              </text>
              <text x="80" y="95" textAnchor="middle" className="text-xs" fill="#888">Risk Score</text>
            </svg>

            <div className="w-full mt-4 space-y-2">
              {riskFactors.length > 0
                ? riskFactors.map((f: any) => (
                    <div key={f.factorName} className="flex items-center justify-between text-[13px]">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${f.active ? "bg-danger" : "bg-success"}`} />
                        <span className="text-text-secondary">{f.factorName}</span>
                      </div>
                      <span className={f.active ? "text-danger font-medium" : "text-success font-medium"}>
                        {f.active ? `+${f.points}` : "0"}
                      </span>
                    </div>
                  ))
                : [
                    { factor: "Missing Certificate", active: false },
                    { factor: "Origin Verified", active: false },
                    { factor: "Weight Discrepancy", active: false },
                    { factor: "Multiple Owners", active: false },
                  ].map(f => (
                    <div key={f.factor} className="flex items-center justify-between text-[13px]">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-success" />
                        <span className="text-text-secondary">{f.factor}</span>
                      </div>
                      <span className="text-success font-medium">0</span>
                    </div>
                  ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackPage;