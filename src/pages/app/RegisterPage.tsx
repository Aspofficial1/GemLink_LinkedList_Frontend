import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ArrowRight, ArrowLeft, ChevronDown } from 'lucide-react';
import { registerGem } from '../../api/api';

// =============================================================
// Known Sri Lankan gem mining districts and villages
// Matches the KNOWN_LOCATIONS in JourneyMapService.java
// =============================================================
const CEYLON_DISTRICTS = [
  "Ratnapura",
  "Matale",
  "Ampara",
  "Badulla",
  "Kandy",
  "Kalutara",
  "Galle",
  "Matara",
  "Hambantota",
  "Trincomalee",
  "Kurunegala",
  "Polonnaruwa",
  "Anuradhapura",
  "Moneragala",
];

const VILLAGES_BY_DISTRICT: Record<string, string[]> = {
  Ratnapura:    ["Pelmadulla", "Elapatha", "Kuruwita", "Ratnapura", "Eheliyagoda", "Balangoda", "Rakwana"],
  Matale:       ["Elahera", "Matale", "Dambulla"],
  Ampara:       ["Okanda", "Ampara", "Kalmunai"],
  Badulla:      ["Bibile", "Okkampitiya", "Badulla", "Bandarawela"],
  Kandy:        ["Hasalaka", "Kandy", "Peradeniya"],
  Kalutara:     ["Meetiyagoda", "Kalutara", "Beruwala", "Panadura"],
  Galle:        ["Galle", "Hikkaduwa", "Ambalangoda"],
  Matara:       ["Matara", "Weligama", "Dikwella"],
  Hambantota:   ["Hambantota", "Tangalle", "Tissamaharama"],
  Trincomalee:  ["Trincomalee", "Kinniya"],
  Kurunegala:   ["Kurunegala", "Kuliyapitiya", "Nikaweratiya"],
  Polonnaruwa:  ["Polonnaruwa", "Hingurakgoda"],
  Anuradhapura: ["Anuradhapura", "Kekirawa", "Medawachchiya"],
  Moneragala:   ["Moneragala", "Wellawaya", "Bibile"],
};

const GEM_TYPES = [
  "Blue Sapphire",
  "Ruby",
  "Yellow Sapphire",
  "Pink Sapphire",
  "Alexandrite",
  "Cat's Eye",
  "Spinel",
  "Chrysoberyl",
  "Tourmaline",
  "Topaz",
  "Amethyst",
  "Garnet",
  "Moonstone",
  "Zircon",
  "Aquamarine",
  "Emerald",
];

const MINE_NAMES_BY_DISTRICT: Record<string, string[]> = {
  Ratnapura:    ["Pelmadulla Mine", "Elapatha Gem Pit", "Kuruwita Mine", "Ratnapura City Mine"],
  Matale:       ["Elahera Mine", "Matale Pit"],
  Ampara:       ["Okanda Mine"],
  Badulla:      ["Bibile Mine", "Okkampitiya Mine"],
  Kandy:        ["Hasalaka Mine"],
  Kalutara:     ["Meetiyagoda Mine"],
  Galle:        ["Galle Mine"],
  Matara:       ["Matara Pit"],
  Hambantota:   ["Hambantota Mine"],
  Trincomalee:  ["Trincomalee Mine"],
  Kurunegala:   ["Kurunegala Mine"],
  Polonnaruwa:  ["Polonnaruwa Mine"],
  Anuradhapura: ["Anuradhapura Mine"],
  Moneragala:   ["Moneragala Mine"],
};

// =============================================================
// Shared input style helpers
// =============================================================
const INPUT_STYLE: React.CSSProperties = {
  width: "100%", height: 44, border: "1px solid #E8E8E8",
  borderRadius: 9, padding: "0 14px", fontSize: 14, outline: "none",
  background: "white", appearance: "none" as any,
};

const FOCUS_IN  = (e: React.FocusEvent<any>) => {
  e.target.style.borderColor = "#C9A84C";
  e.target.style.boxShadow   = "0 0 0 3px rgba(201,168,76,0.12)";
};
const FOCUS_OUT = (e: React.FocusEvent<any>) => {
  e.target.style.borderColor = "#E8E8E8";
  e.target.style.boxShadow   = "none";
};

// =============================================================
// Sub-components
// =============================================================
const StepIndicator = ({
  currentStep,
  steps,
}: {
  currentStep: number;
  steps: string[];
}) => (
  <div style={{ display: "flex", alignItems: "center", marginBottom: 40 }}>
    {steps.map((step, i) => (
      <div key={i} style={{ display: "contents" }}>
        <div
          style={{
            display:       "flex",
            flexDirection: "column",
            alignItems:    "center",
            gap:           8,
          }}
        >
          <motion.div
            animate={{
              background:
                i < currentStep
                  ? "#166534"
                  : i === currentStep
                  ? "#0A0A0A"
                  : "#E8E8E8",
              scale: i === currentStep ? 1.1 : 1,
            }}
            style={{
              width: 40, height: 40, borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            {i < currentStep ? (
              <Check size={18} color="white" />
            ) : (
              <span
                className="font-inter"
                style={{
                  fontSize: 15, fontWeight: 700,
                  color: i === currentStep ? "white" : "#888888",
                }}
              >
                {i + 1}
              </span>
            )}
          </motion.div>
          <span
            className="font-inter"
            style={{
              fontSize: 12, fontWeight: 500,
              color: i === currentStep ? "#0A0A0A" : "#888888",
            }}
          >
            {step}
          </span>
        </div>
        {i < steps.length - 1 && (
          <div
            style={{
              flex:       1,
              height:     1,
              background: i < currentStep ? "#166534" : "#E8E8E8",
              margin:     "0 12px",
              marginBottom: 28,
            }}
          />
        )}
      </div>
    ))}
  </div>
);

const FormInput = ({
  label,
  placeholder,
  value,
  onChange,
  type = "text",
  required = false,
}: {
  label:       string;
  placeholder: string;
  value:       string;
  onChange:    (v: string) => void;
  type?:       string;
  required?:   boolean;
}) => (
  <div style={{ marginBottom: 20 }}>
    <label
      className="font-inter"
      style={{
        fontSize: 13, fontWeight: 600, color: "#0A0A0A",
        marginBottom: 6, display: "block",
      }}
    >
      {label}{required && <span style={{ color: "#991B1B" }}> *</span>}
    </label>
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="font-inter"
      style={INPUT_STYLE}
      onFocus={FOCUS_IN}
      onBlur={FOCUS_OUT}
    />
  </div>
);

const FormSelect = ({
  label,
  value,
  onChange,
  options,
  placeholder,
  required = false,
}: {
  label:       string;
  value:       string;
  onChange:    (v: string) => void;
  options:     string[];
  placeholder: string;
  required?:   boolean;
}) => (
  <div style={{ marginBottom: 20 }}>
    <label
      className="font-inter"
      style={{
        fontSize: 13, fontWeight: 600, color: "#0A0A0A",
        marginBottom: 6, display: "block",
      }}
    >
      {label}{required && <span style={{ color: "#991B1B" }}> *</span>}
    </label>
    <div style={{ position: "relative" }}>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="font-inter"
        style={{ ...INPUT_STYLE, paddingRight: 36, cursor: "pointer" }}
        onFocus={FOCUS_IN}
        onBlur={FOCUS_OUT}
      >
        <option value="">{placeholder}</option>
        {options.map(opt => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
      <ChevronDown
        size={16}
        style={{
          position:      "absolute",
          right:         12,
          top:           "50%",
          transform:     "translateY(-50%)",
          pointerEvents: "none",
          color:         "#888",
        }}
      />
    </div>
  </div>
);

// =============================================================
// Main RegisterPage
// =============================================================
const RegisterPage = () => {
  const [step, setStep]       = useState(0);
  const [form, setForm]       = useState({
    type:         "",
    weight:       "",
    color:        "",
    clarity:      "",
    price:        "",
    location:     "",
    district:     "",
    village:      "",
    gpsLat:       "",
    gpsLng:       "",
    minerName:    "",
    minerId:      "",
    minerContact: "",
    date:         "",
    notes:        "",
  });

  const [submitted,       setSubmitted]       = useState(false);
  const [registeredGemId, setRegisteredGemId] = useState("");
  const [submitting,      setSubmitting]       = useState(false);
  const [error,           setError]           = useState("");
  const [validationError, setValidationError] = useState("");

  const steps  = ["Gem Details", "Mining Location", "Miner Details"];
  const update = (key: string, val: string) =>
    setForm(prev => ({ ...prev, [key]: val }));

  // When district changes, reset village and mine name
  const handleDistrictChange = (district: string) => {
    update("district", district);
    update("village",  "");
    update("location", "");
  };

  // Validate current step
  const validateStep = (): boolean => {
    setValidationError("");

    if (step === 0) {
      if (!form.type.trim()) {
        setValidationError("Gem Type is required.");
        return false;
      }
      if (!form.weight.trim() || isNaN(Number(form.weight)) || Number(form.weight) <= 0) {
        setValidationError("A valid weight in carats is required.");
        return false;
      }
      if (!form.price.trim() || isNaN(Number(form.price)) || Number(form.price) <= 0) {
        setValidationError("A valid initial price in rupees is required.");
        return false;
      }
    }

    if (step === 1) {
      if (!form.location.trim()) {
        setValidationError("Mining Location / Mine Name is required.");
        return false;
      }
      if (!form.district.trim()) {
        setValidationError("District is required.");
        return false;
      }
    }

    if (step === 2) {
      if (!form.minerName.trim()) {
        setValidationError("Miner Name is required.");
        return false;
      }
      if (!form.minerId.trim()) {
        setValidationError("Miner NIC Number is required.");
        return false;
      }
      if (!form.minerContact.trim()) {
        setValidationError("Miner Contact is required.");
        return false;
      }
      if (!form.date.trim()) {
        setValidationError("Mining Date is required.");
        return false;
      }
    }

    return true;
  };

  // Handle next step or final submission
  const handleNext = async () => {
    if (!validateStep()) return;

    if (step < 2) {
      setStep(s => s + 1);
      return;
    }

    // Final step — submit to API
    setSubmitting(true);
    setError("");

    try {
      const res = await registerGem({
        gemType:          form.type.trim(),
        colorDescription: `${form.color} — ${form.clarity}`.trim(),
        originMine:       form.location.trim(),
        district:         form.district.trim(),
        village:          form.village.trim(),
        minerName:        form.minerName.trim(),
        minerIdNumber:    form.minerId.trim(),
        minerContact:     form.minerContact.trim(),
        weightInCarats:   Number(form.weight),
        priceInRupees:    Number(form.price),
        miningDate:       form.date.trim(),
      });

      if (res.success && res.data) {
        const data = res.data as any;
        setRegisteredGemId(data.gemId || "Unknown");
        setSubmitted(true);
      } else {
        setError(res.message || "Registration failed. Please check your details.");
      }
    } catch (err) {
      console.error("Registration error:", err);
      setError(
        "Could not connect to the server. Make sure the API is running on port 4567."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Reset form
  const handleReset = () => {
    setSubmitted(false);
    setStep(0);
    setError("");
    setValidationError("");
    setRegisteredGemId("");
    setForm({
      type: "", weight: "", color: "", clarity: "", price: "",
      location: "", district: "", village: "", gpsLat: "", gpsLng: "",
      minerName: "", minerId: "", minerContact: "", date: "", notes: "",
    });
  };

  // Villages available for selected district
  const villages  = form.district ? (VILLAGES_BY_DISTRICT[form.district] || []) : [];
  const mineNames = form.district ? (MINE_NAMES_BY_DISTRICT[form.district] || []) : [];

  // =============================================================
  // Success screen
  // =============================================================
  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{ textAlign: "center", padding: "80px 40px" }}
      >
        <div
          style={{
            width: 80, height: 80, borderRadius: "50%", background: "#DCFCE7",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 24px",
          }}
        >
          <Check size={36} color="#166534" />
        </div>
        <h2
          className="font-playfair"
          style={{ fontSize: 28, fontWeight: 700, marginBottom: 12 }}
        >
          Gem Registered Successfully
        </h2>
        <p
          className="font-inter"
          style={{ fontSize: 14, color: "#888888", marginBottom: 24 }}
        >
          Your gem has been added to the tracking system
        </p>
        <div
          style={{
            background: "#FAFAFA", border: "1px solid #E8E8E8", borderRadius: 12,
            padding: "16px 24px", display: "inline-block",
          }}
        >
          <span className="font-inter" style={{ fontSize: 12, color: "#888888" }}>
            Gem ID
          </span>
          <div
            style={{
              fontFamily: "monospace", fontSize: 22, fontWeight: 700,
              color: "#1B4F8A", marginTop: 4,
            }}
          >
            {registeredGemId}
          </div>
        </div>
        <p
          className="font-inter"
          style={{ fontSize: 12, color: "#888888", marginTop: 12 }}
        >
          Save this Gem ID. Use Track Gem to add Cutting, Trading, Exporting and Buying stages.
        </p>
        <div style={{ marginTop: 24, display: "flex", gap: 12, justifyContent: "center" }}>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleReset}
            className="font-inter"
            style={{
              height: 44, padding: "0 24px", borderRadius: 9,
              background: "#0A0A0A", color: "white",
              fontSize: 14, fontWeight: 600, border: "none", cursor: "pointer",
            }}
          >
            Register Another Gem
          </motion.button>
        </div>
      </motion.div>
    );
  }

  // =============================================================
  // Main form
  // =============================================================
  return (
    <div className="p-8">
      <h1
        className="font-playfair"
        style={{ fontSize: 22, fontWeight: 700, marginBottom: 32 }}
      >
        Register New Gem
      </h1>

      <div style={{ maxWidth: 600 }}>
        <StepIndicator currentStep={step} steps={steps} />

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ x: 60, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -60, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >

            {/* ── Step 1 — Gem Details ────────────────────────── */}
            {step === 0 && (
              <div>
                {/* Gem Type — dropdown with known gem types */}
                <FormSelect
                  label="Gem Type"
                  value={form.type}
                  onChange={v => update("type", v)}
                  options={GEM_TYPES}
                  placeholder="Select gem type..."
                  required
                />
                {/* Allow typing custom type if not in list */}
                {form.type === "" && (
                  <div style={{ marginTop: -12, marginBottom: 20 }}>
                    <input
                      type="text"
                      placeholder="Or type a custom gem type..."
                      className="font-inter"
                      style={{ ...INPUT_STYLE, fontSize: 13, color: "#555" }}
                      onChange={e => update("type", e.target.value)}
                      onFocus={FOCUS_IN}
                      onBlur={FOCUS_OUT}
                    />
                  </div>
                )}

                <FormInput
                  label="Weight (carats)"
                  placeholder="e.g. 4.8"
                  value={form.weight}
                  onChange={v => update("weight", v)}
                  required
                />
                <FormInput
                  label="Initial Mining Price (Rs.)"
                  placeholder="e.g. 50000"
                  value={form.price}
                  onChange={v => update("price", v)}
                  required
                />
                <FormInput
                  label="Color"
                  placeholder="e.g. Royal Blue"
                  value={form.color}
                  onChange={v => update("color", v)}
                />
                <FormInput
                  label="Clarity"
                  placeholder="e.g. Eye Clean"
                  value={form.clarity}
                  onChange={v => update("clarity", v)}
                />
              </div>
            )}

            {/* ── Step 2 — Mining Location ─────────────────────── */}
            {step === 1 && (
              <div>
                {/* District dropdown — matches backend KNOWN_LOCATIONS */}
                <FormSelect
                  label="District"
                  value={form.district}
                  onChange={handleDistrictChange}
                  options={CEYLON_DISTRICTS}
                  placeholder="Select mining district..."
                  required
                />

                {/* Village dropdown — populated based on district */}
                {form.district && villages.length > 0 && (
                  <FormSelect
                    label="Village / Town"
                    value={form.village}
                    onChange={v => update("village", v)}
                    options={villages}
                    placeholder="Select village..."
                  />
                )}
                {/* Allow manual village entry */}
                {form.district && (
                  <FormInput
                    label={villages.length > 0 ? "Or Enter Village Manually" : "Village / Town"}
                    placeholder="e.g. Pelmadulla"
                    value={villages.includes(form.village) ? "" : form.village}
                    onChange={v => update("village", v)}
                  />
                )}

                {/* Mine name dropdown — populated based on district */}
                {form.district && mineNames.length > 0 && (
                  <FormSelect
                    label="Mine Name / Origin"
                    value={form.location}
                    onChange={v => update("location", v)}
                    options={mineNames}
                    placeholder="Select mine name..."
                    required
                  />
                )}
                {/* Always allow manual mine name entry */}
                <FormInput
                  label={
                    mineNames.length > 0
                      ? "Or Enter Mine Name Manually"
                      : "Mine Name / Origin"
                  }
                  placeholder="e.g. Pelmadulla Mine"
                  value={mineNames.includes(form.location) ? "" : form.location}
                  onChange={v => update("location", v)}
                  required={mineNames.length === 0}
                />

                {/* GPS coords — optional, auto-hint if district known */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 16,
                  }}
                >
                  <FormInput
                    label="GPS Latitude"
                    placeholder="e.g. 6.6828"
                    value={form.gpsLat}
                    onChange={v => update("gpsLat", v)}
                  />
                  <FormInput
                    label="GPS Longitude"
                    placeholder="e.g. 80.3992"
                    value={form.gpsLng}
                    onChange={v => update("gpsLng", v)}
                  />
                </div>

                {/* Location hint */}
                {form.district && (
                  <div
                    style={{
                      background:   "#EFF6FF",
                      border:       "1px solid #BFDBFE",
                      borderRadius: 9,
                      padding:      "10px 14px",
                      marginBottom: 20,
                      fontSize:     12,
                      color:        "#1E40AF",
                    }}
                  >
                    <strong>Map tip:</strong> {form.district} will be matched on the
                    Journey Map to show the correct GPS location on the Sri Lanka map.
                    Make sure the district name is spelled correctly.
                  </div>
                )}
              </div>
            )}

            {/* ── Step 3 — Miner Details ───────────────────────── */}
            {step === 2 && (
              <div>
                <FormInput
                  label="Miner Full Name"
                  placeholder="e.g. Sumith Perera"
                  value={form.minerName}
                  onChange={v => update("minerName", v)}
                  required
                />
                <FormInput
                  label="Miner NIC Number"
                  placeholder="e.g. 199012345678"
                  value={form.minerId}
                  onChange={v => update("minerId", v)}
                  required
                />
                <FormInput
                  label="Miner Contact Number"
                  placeholder="e.g. 0771234567"
                  value={form.minerContact}
                  onChange={v => update("minerContact", v)}
                  required
                />
                <FormInput
                  label="Mining Date"
                  placeholder="2025-01-15"
                  value={form.date}
                  onChange={v => update("date", v)}
                  type="date"
                  required
                />
                <FormInput
                  label="Notes"
                  placeholder="Any additional information about this gem..."
                  value={form.notes}
                  onChange={v => update("notes", v)}
                />

                {/* Registration summary */}
                <div
                  style={{
                    background:   "#F8FAFC",
                    border:       "1px solid #E8E8E8",
                    borderRadius: 10,
                    padding:      "14px 18px",
                    marginBottom: 8,
                  }}
                >
                  <p
                    className="font-inter"
                    style={{
                      fontSize:      11,
                      fontWeight:    700,
                      color:         "#888",
                      letterSpacing: 1,
                      textTransform: "uppercase",
                      marginBottom:  10,
                    }}
                  >
                    Registration Summary
                  </p>
                  {[
                    { label: "Gem Type",   value: form.type     || "—" },
                    { label: "Weight",     value: form.weight ? `${form.weight} ct` : "—" },
                    { label: "Price",      value: form.price  ? `Rs. ${Number(form.price).toLocaleString()}` : "—" },
                    { label: "District",   value: form.district || "—" },
                    { label: "Village",    value: form.village  || "—" },
                    { label: "Mine",       value: form.location || "—" },
                  ].map(row => (
                    <div
                      key={row.label}
                      style={{
                        display:        "flex",
                        justifyContent: "space-between",
                        fontSize:       13,
                        paddingBottom:  6,
                        marginBottom:   6,
                        borderBottom:   "1px solid #F0F0F0",
                      }}
                    >
                      <span style={{ color: "#888" }}>{row.label}</span>
                      <span style={{ fontWeight: 600, color: "#0A0A0A" }}>
                        {row.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Validation error */}
        {validationError && (
          <p
            className="font-inter"
            style={{ fontSize: 13, color: "#991B1B", marginTop: 8 }}
          >
            {validationError}
          </p>
        )}

        {/* API error */}
        {error && (
          <p
            className="font-inter"
            style={{ fontSize: 13, color: "#991B1B", marginTop: 8 }}
          >
            {error}
          </p>
        )}

        {/* Navigation buttons */}
        <div
          style={{
            display:        "flex",
            justifyContent: "space-between",
            marginTop:      32,
          }}
        >
          {step > 0 ? (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setStep(s => s - 1);
                setValidationError("");
                setError("");
              }}
              className="font-inter"
              style={{
                display:     "flex",
                alignItems:  "center",
                gap:         8,
                height:      44,
                padding:     "0 20px",
                borderRadius:9,
                border:      "1px solid #E8E8E8",
                background:  "white",
                color:       "#555555",
                fontSize:    14,
                fontWeight:  600,
                cursor:      "pointer",
              }}
            >
              <ArrowLeft size={14} /> Previous
            </motion.button>
          ) : (
            <div />
          )}

          <motion.button
            whileHover={{ scale: submitting ? 1 : 1.02 }}
            whileTap={{ scale: submitting ? 1 : 0.98 }}
            onClick={handleNext}
            disabled={submitting}
            className="font-inter"
            style={{
              display:    "flex",
              alignItems: "center",
              gap:        8,
              height:     44,
              padding:    "0 24px",
              borderRadius:9,
              background: submitting ? "#555555" : "#0A0A0A",
              color:      "white",
              fontSize:   14,
              fontWeight: 600,
              border:     "none",
              cursor:     submitting ? "not-allowed" : "pointer",
              opacity:    submitting ? 0.7 : 1,
            }}
          >
            {submitting
              ? "Registering..."
              : step < 2
              ? "Next"
              : "Register Gem"}
            {!submitting && <ArrowRight size={14} />}
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;