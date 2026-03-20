import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ArrowRight, ArrowLeft } from 'lucide-react';
import { registerGem } from '../../api/api';

const StepIndicator = ({ currentStep, steps }: { currentStep: number; steps: string[] }) => (
  <div style={{ display: 'flex', alignItems: 'center', marginBottom: 40 }}>
    {steps.map((step, i) => (
      <div key={i} style={{ display: 'contents' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <motion.div
            animate={{
              background: i < currentStep ? '#166534' : i === currentStep ? '#0A0A0A' : '#E8E8E8',
              scale: i === currentStep ? 1.1 : 1
            }}
            style={{ width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            {i < currentStep ? (
              <Check size={18} color="white" />
            ) : (
              <span className="font-inter" style={{ fontSize: 15, fontWeight: 700, color: i === currentStep ? 'white' : '#888888' }}>{i + 1}</span>
            )}
          </motion.div>
          <span className="font-inter" style={{ fontSize: 12, fontWeight: 500, color: i === currentStep ? '#0A0A0A' : '#888888' }}>{step}</span>
        </div>
        {i < steps.length - 1 && (
          <div style={{ flex: 1, height: 1, background: i < currentStep ? '#166534' : '#E8E8E8', margin: '0 12px', marginBottom: 28 }} />
        )}
      </div>
    ))}
  </div>
);

const FormInput = ({ label, placeholder, value, onChange, type = 'text' }: {
  label: string; placeholder: string; value: string; onChange: (v: string) => void; type?: string;
}) => (
  <div style={{ marginBottom: 20 }}>
    <label className="font-inter" style={{ fontSize: 13, fontWeight: 600, color: '#0A0A0A', marginBottom: 6, display: 'block' }}>{label}</label>
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="font-inter"
      style={{
        width: '100%', height: 44, border: '1px solid #E8E8E8', borderRadius: 9,
        padding: '0 14px', fontSize: 14, outline: 'none',
      }}
      onFocus={e => { e.target.style.borderColor = '#C9A84C'; e.target.style.boxShadow = '0 0 0 3px rgba(201,168,76,0.12)'; }}
      onBlur={e => { e.target.style.borderColor = '#E8E8E8'; e.target.style.boxShadow = 'none'; }}
    />
  </div>
);

const RegisterPage = () => {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    type: '',
    weight: '',
    color: '',
    clarity: '',
    location: '',
    district: '',
    gpsLat: '',
    gpsLng: '',
    minerName: '',
    minerId: '',
    minerContact: '',
    date: '',
    notes: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [registeredGemId, setRegisteredGemId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [validationError, setValidationError] = useState('');

  const steps = ['Gem Details', 'Mining Location', 'Miner Details'];
  const update = (key: string, val: string) => setForm(prev => ({ ...prev, [key]: val }));

  // Validate current step before proceeding
  const validateStep = (): boolean => {
    setValidationError('');

    if (step === 0) {
      if (!form.type.trim()) {
        setValidationError('Gem Type is required.');
        return false;
      }
      if (!form.weight.trim() || isNaN(Number(form.weight)) || Number(form.weight) <= 0) {
        setValidationError('A valid weight in carats is required.');
        return false;
      }
    }

    if (step === 1) {
      if (!form.location.trim()) {
        setValidationError('Mining Location is required.');
        return false;
      }
      if (!form.district.trim()) {
        setValidationError('District is required.');
        return false;
      }
    }

    if (step === 2) {
      if (!form.minerName.trim()) {
        setValidationError('Miner Name is required.');
        return false;
      }
      if (!form.minerId.trim()) {
        setValidationError('Miner ID is required.');
        return false;
      }
      if (!form.minerContact.trim()) {
        setValidationError('Miner Contact is required.');
        return false;
      }
      if (!form.date.trim()) {
        setValidationError('Mining Date is required.');
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
    setError('');

    try {
      // Parse location into originMine and village
      const locationParts = form.location.split(',');
      const originMine = locationParts[0]?.trim() || form.location;
      const village = locationParts[1]?.trim() || '';

      const res = await registerGem({
        gemType: form.type.trim(),
        colorDescription: `${form.color} — ${form.clarity}`.trim(),
        originMine: originMine,
        district: form.district.trim(),
        village: village,
        minerName: form.minerName.trim(),
        minerIdNumber: form.minerId.trim(),
        minerContact: form.minerContact.trim(),
        weightInCarats: Number(form.weight),
        priceInRupees: 10000, // Default starting price — can be updated via stage
        miningDate: form.date.trim(),
      });

      if (res.success && res.data) {
        const data = res.data as any;
        setRegisteredGemId(data.gemId || 'Unknown');
        setSubmitted(true);
      } else {
        setError(res.message || 'Registration failed. Please check your details.');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('Could not connect to the server. Make sure the API is running.');
    } finally {
      setSubmitting(false);
    }
  };

  // Reset form for registering another gem
  const handleReset = () => {
    setSubmitted(false);
    setStep(0);
    setError('');
    setValidationError('');
    setRegisteredGemId('');
    setForm({
      type: '',
      weight: '',
      color: '',
      clarity: '',
      location: '',
      district: '',
      gpsLat: '',
      gpsLng: '',
      minerName: '',
      minerId: '',
      minerContact: '',
      date: '',
      notes: '',
    });
  };

  // Success screen
  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{ textAlign: 'center', padding: '80px 40px' }}
      >
        <div style={{
          width: 80, height: 80, borderRadius: '50%', background: '#DCFCE7',
          display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px'
        }}>
          <Check size={36} color="#166534" />
        </div>
        <h2 className="font-playfair" style={{ fontSize: 28, fontWeight: 700, marginBottom: 12 }}>
          Gem Registered Successfully
        </h2>
        <p className="font-inter" style={{ fontSize: 14, color: '#888888', marginBottom: 24 }}>
          Your gem has been added to the tracking system
        </p>
        <div style={{
          background: '#FAFAFA', border: '1px solid #E8E8E8', borderRadius: 12,
          padding: '16px 24px', display: 'inline-block'
        }}>
          <span className="font-inter" style={{ fontSize: 12, color: '#888888' }}>Gem ID</span>
          <div style={{ fontFamily: 'monospace', fontSize: 22, fontWeight: 700, color: '#1B4F8A', marginTop: 4 }}>
            {registeredGemId}
          </div>
        </div>
        <p className="font-inter" style={{ fontSize: 12, color: '#888888', marginTop: 12 }}>
          Save this Gem ID to track your gem or add stages later.
        </p>
        <div style={{ marginTop: 24 }}>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleReset}
            className="font-inter"
            style={{
              height: 44, padding: '0 24px', borderRadius: 9, background: '#0A0A0A',
              color: 'white', fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer'
            }}
          >
            Register Another Gem
          </motion.button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="font-playfair" style={{ fontSize: 22, fontWeight: 700, marginBottom: 32 }}>
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
            {step === 0 && (
              <div>
                <FormInput label="Gem Type *" placeholder="e.g. Blue Sapphire" value={form.type} onChange={v => update('type', v)} />
                <FormInput label="Weight (carats) *" placeholder="e.g. 4.8" value={form.weight} onChange={v => update('weight', v)} />
                <FormInput label="Color" placeholder="e.g. Royal Blue" value={form.color} onChange={v => update('color', v)} />
                <FormInput label="Clarity" placeholder="e.g. Eye Clean" value={form.clarity} onChange={v => update('clarity', v)} />
              </div>
            )}
            {step === 1 && (
              <div>
                <FormInput label="Mining Location *" placeholder="e.g. Pelmadulla Mine, Ratnapura" value={form.location} onChange={v => update('location', v)} />
                <FormInput label="District *" placeholder="e.g. Ratnapura" value={form.district} onChange={v => update('district', v)} />
                <FormInput label="GPS Latitude" placeholder="e.g. 6.6828" value={form.gpsLat} onChange={v => update('gpsLat', v)} />
                <FormInput label="GPS Longitude" placeholder="e.g. 80.3992" value={form.gpsLng} onChange={v => update('gpsLng', v)} />
              </div>
            )}
            {step === 2 && (
              <div>
                <FormInput label="Miner Name *" placeholder="e.g. Sumith Perera" value={form.minerName} onChange={v => update('minerName', v)} />
                <FormInput label="Miner NIC Number *" placeholder="e.g. 199012345678" value={form.minerId} onChange={v => update('minerId', v)} />
                <FormInput label="Miner Contact *" placeholder="e.g. 0771234567" value={form.minerContact} onChange={v => update('minerContact', v)} />
                <FormInput label="Mining Date *" placeholder="2025-01-15" value={form.date} onChange={v => update('date', v)} type="date" />
                <FormInput label="Notes" placeholder="Additional notes..." value={form.notes} onChange={v => update('notes', v)} />
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Validation error */}
        {validationError && (
          <p className="font-inter" style={{ fontSize: 13, color: '#991B1B', marginTop: 8 }}>
            {validationError}
          </p>
        )}

        {/* API error */}
        {error && (
          <p className="font-inter" style={{ fontSize: 13, color: '#991B1B', marginTop: 8 }}>
            {error}
          </p>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 32 }}>
          {step > 0 ? (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => { setStep(s => s - 1); setValidationError(''); setError(''); }}
              className="font-inter"
              style={{
                display: 'flex', alignItems: 'center', gap: 8, height: 44, padding: '0 20px',
                borderRadius: 9, border: '1px solid #E8E8E8', background: 'white',
                color: '#555555', fontSize: 14, fontWeight: 600, cursor: 'pointer'
              }}
            >
              <ArrowLeft size={14} /> Previous
            </motion.button>
          ) : <div />}

          <motion.button
            whileHover={{ scale: submitting ? 1 : 1.02 }}
            whileTap={{ scale: submitting ? 1 : 0.98 }}
            onClick={handleNext}
            disabled={submitting}
            className="font-inter"
            style={{
              display: 'flex', alignItems: 'center', gap: 8, height: 44, padding: '0 24px',
              borderRadius: 9, background: submitting ? '#555555' : '#0A0A0A', color: 'white',
              fontSize: 14, fontWeight: 600, border: 'none',
              cursor: submitting ? 'not-allowed' : 'pointer',
              opacity: submitting ? 0.7 : 1,
            }}
          >
            {submitting
              ? 'Registering...'
              : step < 2
              ? 'Next'
              : 'Register Gem'}
            {!submitting && <ArrowRight size={14} />}
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;