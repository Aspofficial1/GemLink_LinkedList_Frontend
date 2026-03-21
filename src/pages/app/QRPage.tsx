import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Download,
  RefreshCw,
  Eye,
  QrCode,
  CheckCircle,
  AlertCircle,
  Upload,
  X,
  ArrowLeft,
} from "lucide-react";
import {
  getAllGems,
  getQRStatus,
  generateQRCode,
  regenerateQRCode,
  previewQRContent,
  getQRDownloadUrl,
} from "../../api/api";

const QRPage: React.FC = () => {
  const [allGems, setAllGems]               = useState<any[]>([]);
  const [selectedGem, setSelectedGem]       = useState("");
  const [loadingGems, setLoadingGems]       = useState(true);
  const [qrStatus, setQrStatus]             = useState<any>(null);
  const [loadingStatus, setLoadingStatus]   = useState(false);
  const [generating, setGenerating]         = useState(false);
  const [regenerating, setRegenerating]     = useState(false);
  const [previewing, setPreviewing]         = useState(false);
  const [previewContent, setPreviewContent] = useState<string | null>(null);
  const [showPreview, setShowPreview]       = useState(false);
  const [message, setMessage]               = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [imageKey, setImageKey]             = useState(0);

  // Full screen QR view state
  const [showFullQR, setShowFullQR]         = useState(false);

  // Upload and read QR state
  const [uploadedQRImage, setUploadedQRImage] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string>("");
  const [readingQR, setReadingQR]           = useState(false);
  const [readResult, setReadResult]         = useState<string | null>(null);
  const fileInputRef                        = useRef<HTMLInputElement>(null);

  // Load all gems for the dropdown
  useEffect(() => {
    const fetchGems = async () => {
      try {
        const res = await getAllGems();
        if (res.success && res.data) {
          const gems = res.data as any[];
          setAllGems(gems);
          if (gems.length > 0) setSelectedGem(gems[0].gemId);
        }
      } catch (err) {
        console.error("Failed to load gems:", err);
      } finally {
        setLoadingGems(false);
      }
    };
    fetchGems();
  }, []);

  // Load QR status when selected gem changes
  useEffect(() => {
    if (!selectedGem) return;
    fetchQRStatus();
    setShowPreview(false);
    setPreviewContent(null);
    setMessage(null);
    setShowFullQR(false);
  }, [selectedGem]);

  const fetchQRStatus = async () => {
    setLoadingStatus(true);
    try {
      const res = await getQRStatus(selectedGem);
      if (res.success && res.data) setQrStatus(res.data);
      else setQrStatus(null);
    } catch (err) {
      setQrStatus(null);
    } finally {
      setLoadingStatus(false);
    }
  };

  // Generate QR code
  const handleGenerate = async () => {
    setGenerating(true);
    setMessage(null);
    try {
      const res = await generateQRCode(selectedGem);
      if (res.success) {
        setMessage({ text: "QR code generated successfully!", type: "success" });
        setImageKey(k => k + 1);
        await fetchQRStatus();
      } else {
        setMessage({ text: res.message || "Failed to generate QR code.", type: "error" });
      }
    } catch {
      setMessage({ text: "Could not connect to the server.", type: "error" });
    } finally {
      setGenerating(false);
    }
  };

  // Regenerate QR code
  const handleRegenerate = async () => {
    setRegenerating(true);
    setMessage(null);
    try {
      const res = await regenerateQRCode(selectedGem);
      if (res.success) {
        setMessage({ text: "QR code regenerated with latest journey data!", type: "success" });
        setImageKey(k => k + 1);
        await fetchQRStatus();
      } else {
        setMessage({ text: res.message || "Failed to regenerate QR code.", type: "error" });
      }
    } catch {
      setMessage({ text: "Could not connect to the server.", type: "error" });
    } finally {
      setRegenerating(false);
    }
  };

  // Preview QR content text
  const handlePreview = async () => {
    setPreviewing(true);
    setMessage(null);
    try {
      const res = await previewQRContent(selectedGem);
      if (res.success && res.data) {
        const data = res.data as any;
        setPreviewContent(data.fullContent || "No content available.");
        setShowPreview(true);
      } else {
        setMessage({ text: "Could not load QR content preview.", type: "error" });
      }
    } catch {
      setMessage({ text: "Could not connect to the server.", type: "error" });
    } finally {
      setPreviewing(false);
    }
  };

  // Download QR code as PNG — auto triggers browser download
  const handleDownload = async () => {
    try {
      const url = getQRDownloadUrl(selectedGem);
      const response = await fetch(url);
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = `${selectedGem}_QR.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(objectUrl);
      setMessage({ text: "QR code downloaded successfully!", type: "success" });
    } catch {
      setMessage({ text: "Download failed. Please try again.", type: "error" });
    }
  };

  // Handle QR image file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMessage({ text: "Please upload a valid image file (PNG, JPG).", type: "error" });
      return;
    }

    setUploadedFileName(file.name);
    setReadResult(null);

    const reader = new FileReader();
    reader.onload = (ev) => {
      setUploadedQRImage(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Read the uploaded QR code using jsQR via canvas
  const handleReadQR = async () => {
    if (!uploadedQRImage) return;
    setReadingQR(true);
    setReadResult(null);

    try {
      // Load the image into a canvas to extract pixel data
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width  = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          setReadResult("Could not process image.");
          setReadingQR(false);
          return;
        }
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        // Dynamically import jsQR for QR decoding
        import("jsqr").then(({ default: jsQR }) => {
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          if (code) {
            setReadResult(code.data);
          } else {
            setReadResult(
              "Could not decode QR code from this image.\n\n" +
              "Make sure the image is a clear, unobstructed QR code PNG file.\n" +
              "Try regenerating the QR code and downloading it fresh."
            );
          }
          setReadingQR(false);
        }).catch(() => {
          // jsQR not available — show the raw preview from API instead
          setReadResult(
            "QR reader library not available.\n\n" +
            "To read this QR code:\n" +
            "1. Run: npm install jsqr\n" +
            "2. Restart the frontend\n" +
            "3. Try again\n\n" +
            "Alternatively use the Read QR Content button above " +
            "to view the encoded text directly from the server."
          );
          setReadingQR(false);
        });
      };
      img.onerror = () => {
        setReadResult("Failed to load the image. Please try a different file.");
        setReadingQR(false);
      };
      img.src = uploadedQRImage;
    } catch {
      setReadResult("An error occurred while reading the QR code.");
      setReadingQR(false);
    }
  };

  const qrExists        = qrStatus?.exists || false;
  const qrDownloadUrl   = getQRDownloadUrl(selectedGem);
  const selectedGemData = allGems.find(g => g.gemId === selectedGem);

  return (
    <div className="p-8 space-y-6">

      {/* Page header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-text-primary">
          QR Code Manager
        </h1>
        <p className="text-sm text-text-muted mt-1">
          Generate, download, and read QR codes for gem digital passports
        </p>
      </div>

      {/* Gem selector */}
      <div className="max-w-md">
        <label className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2 block">
          Select Gem
        </label>
        <select
          value={selectedGem}
          onChange={e => setSelectedGem(e.target.value)}
          disabled={loadingGems}
          className="w-full h-11 px-3 border border-border rounded-xl text-sm bg-background focus:outline-none focus:ring-1 focus:ring-ring"
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
      </div>

      {/* Status message */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium max-w-lg ${
              message.type === "success"
                ? "bg-success-bg text-success"
                : "bg-danger-bg text-danger"
            }`}
          >
            {message.type === "success"
              ? <CheckCircle size={16} />
              : <AlertCircle size={16} />}
            {message.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      {selectedGem && (
        <div className="space-y-6">
          <div className="grid lg:grid-cols-[1fr_380px] gap-6">

            {/* Left — QR image display */}
            <div className="bg-card border border-border rounded-2xl p-8 flex flex-col items-center justify-center min-h-[400px]">
              {loadingStatus ? (
                <div className="text-text-muted text-sm">Loading QR status...</div>
              ) : qrExists ? (
                <motion.div
                  key={imageKey}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col items-center gap-6 w-full"
                >
                  {/* QR Image — clickable to show full screen */}
                  <div
                    className="border-2 border-border rounded-2xl p-4 bg-white shadow-sm cursor-pointer hover:border-gold transition-colors"
                    onClick={() => setShowFullQR(true)}
                    title="Click to view full size"
                  >
                    <img
                      src={`${qrDownloadUrl}?t=${imageKey}`}
                      alt={`QR Code for ${selectedGem}`}
                      width={240}
                      height={240}
                      style={{ imageRendering: "pixelated" }}
                      onError={e => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>
                  <p className="text-xs text-text-muted">Click the QR code to view full size</p>

                  {/* Gem info */}
                  <div className="text-center">
                    <p className="font-mono text-base font-bold text-blue-gem">{selectedGem}</p>
                    {selectedGemData && (
                      <p className="text-sm text-text-muted mt-1">
                        {selectedGemData.gemType} — {selectedGemData.origin || ""}
                      </p>
                    )}
                    {qrStatus?.fileSizeKB && (
                      <p className="text-xs text-text-muted mt-1">
                        File size: {qrStatus.fileSizeKB}
                      </p>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-3 flex-wrap justify-center">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleDownload}
                      className="h-10 px-5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold flex items-center gap-2"
                    >
                      <Download size={15} />
                      Download PNG
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleRegenerate}
                      disabled={regenerating}
                      className="h-10 px-5 border border-border bg-card text-text-primary rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-surface-2 disabled:opacity-50"
                    >
                      <RefreshCw size={15} className={regenerating ? "animate-spin" : ""} />
                      {regenerating ? "Regenerating..." : "Regenerate"}
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handlePreview}
                      disabled={previewing}
                      className="h-10 px-5 border border-border bg-card text-text-primary rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-surface-2 disabled:opacity-50"
                    >
                      <Eye size={15} />
                      {previewing ? "Loading..." : "Read QR Content"}
                    </motion.button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center gap-6 text-center"
                >
                  <div className="w-24 h-24 rounded-2xl bg-surface-2 flex items-center justify-center">
                    <QrCode size={40} className="text-text-muted" />
                  </div>
                  <div>
                    <p className="text-base font-semibold text-text-primary">
                      No QR Code Generated Yet
                    </p>
                    <p className="text-sm text-text-muted mt-1 max-w-xs">
                      Generate a QR code for this gem to create its digital passport.
                    </p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleGenerate}
                    disabled={generating}
                    className="h-11 px-8 bg-primary text-primary-foreground rounded-xl text-sm font-semibold flex items-center gap-2 disabled:opacity-50"
                  >
                    <QrCode size={16} />
                    {generating ? "Generating..." : "Generate QR Code"}
                  </motion.button>
                </motion.div>
              )}
            </div>

            {/* Right — Info panel */}
            <div className="space-y-4">
              {/* QR Status card */}
              <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
                <p className="text-sm font-semibold text-text-primary">QR Code Status</p>
                <div className="flex items-center gap-3">
                  <span className={`w-3 h-3 rounded-full ${qrExists ? "bg-success" : "bg-text-muted"}`} />
                  <span className="text-sm text-text-secondary">
                    {qrExists ? "QR Code Generated" : "Not Generated"}
                  </span>
                </div>
                {qrExists && qrStatus && (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-text-muted">Status</span>
                      <span className="font-medium text-success">{qrStatus.status}</span>
                    </div>
                    {qrStatus.fileSizeKB && (
                      <div className="flex justify-between">
                        <span className="text-text-muted">File Size</span>
                        <span className="font-medium">{qrStatus.fileSizeKB}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-text-muted">Gem ID</span>
                      <span className="font-mono font-medium text-blue-gem text-xs">{selectedGem}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* What is encoded */}
              <div className="bg-card border border-border rounded-2xl p-6 space-y-3">
                <p className="text-sm font-semibold text-text-primary">What is encoded in the QR?</p>
                <ul className="space-y-2">
                  {[
                    "Gem ID and type",
                    "Origin mine and district",
                    "Full stage-by-stage journey",
                    "Miner and owner names",
                    "Weight at each stage",
                    "Price at each stage",
                    "Verification status",
                  ].map(item => (
                    <li key={item} className="flex items-center gap-2 text-xs text-text-secondary">
                      <span className="w-1.5 h-1.5 rounded-full bg-gold flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* How to scan */}
              <div className="bg-card border border-border rounded-2xl p-6 space-y-3">
                <p className="text-sm font-semibold text-text-primary">How to scan</p>
                <ul className="space-y-2">
                  {[
                    "Open any QR scanner app on your phone",
                    "Point the camera at the QR code",
                    "The full gem journey will appear instantly",
                    "No app installation required",
                  ].map((step, i) => (
                    <li key={i} className="flex items-start gap-3 text-xs text-text-secondary">
                      <span className="w-5 h-5 rounded-full bg-surface-2 flex items-center justify-center text-[10px] font-bold text-text-primary flex-shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Upload and Read QR Section */}
          <div className="bg-card border border-border rounded-2xl p-8">
            <div className="mb-6">
              <p className="text-base font-semibold text-text-primary">Upload and Read QR Code</p>
              <p className="text-sm text-text-muted mt-1">
                Upload any Ceylon gem QR code image to decode and read its embedded journey data
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Upload area */}
              <div className="space-y-4">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-border rounded-2xl p-8 flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-gold hover:bg-[#FFFDF5] transition-all min-h-[200px]"
                >
                  {uploadedQRImage ? (
                    <img
                      src={uploadedQRImage}
                      alt="Uploaded QR"
                      className="max-w-[160px] max-h-[160px] object-contain rounded-xl"
                    />
                  ) : (
                    <>
                      <div className="w-16 h-16 rounded-2xl bg-surface-2 flex items-center justify-center">
                        <Upload size={28} className="text-text-muted" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-semibold text-text-primary">
                          Click to upload QR image
                        </p>
                        <p className="text-xs text-text-muted mt-1">PNG, JPG supported</p>
                      </div>
                    </>
                  )}
                </div>

                {uploadedFileName && (
                  <p className="text-xs text-text-muted text-center">{uploadedFileName}</p>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 h-10 border border-border bg-surface rounded-lg text-sm font-semibold text-text-primary flex items-center justify-center gap-2 hover:bg-surface-2"
                  >
                    <Upload size={15} />
                    {uploadedQRImage ? "Change Image" : "Choose File"}
                  </motion.button>

                  {uploadedQRImage && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleReadQR}
                      disabled={readingQR}
                      className="flex-1 h-10 bg-primary text-primary-foreground rounded-lg text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <Eye size={15} />
                      {readingQR ? "Reading..." : "Decode QR"}
                    </motion.button>
                  )}
                </div>

                {uploadedQRImage && (
                  <button
                    onClick={() => {
                      setUploadedQRImage(null);
                      setUploadedFileName("");
                      setReadResult(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className="w-full h-9 border border-border rounded-lg text-xs font-medium text-text-muted hover:bg-surface-2 flex items-center justify-center gap-2"
                  >
                    <X size={13} />
                    Clear
                  </button>
                )}
              </div>

              {/* Read result */}
              <div className="space-y-3">
                <p className="text-sm font-semibold text-text-primary">Decoded Content</p>
                {readResult ? (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-3"
                  >
                    <pre className="bg-surface-2 rounded-xl p-5 text-xs text-text-secondary font-mono whitespace-pre-wrap leading-relaxed overflow-auto max-h-[280px]">
                      {readResult}
                    </pre>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(readResult);
                        setMessage({ text: "Decoded content copied to clipboard!", type: "success" });
                      }}
                      className="h-9 px-4 border border-border rounded-lg text-xs font-medium text-text-secondary hover:bg-surface-2"
                    >
                      Copy to Clipboard
                    </button>
                  </motion.div>
                ) : (
                  <div className="bg-surface-2 rounded-xl p-8 flex flex-col items-center justify-center min-h-[200px] text-center">
                    <QrCode size={32} className="text-text-muted mb-3" />
                    <p className="text-sm text-text-muted">
                      Upload a QR code image and click Decode QR to read its content
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Full screen QR view modal */}
      <AnimatePresence>
        {showFullQR && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-6"
            onClick={() => setShowFullQR(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-3xl p-8 flex flex-col items-center gap-6 max-w-lg w-full"
            >
              {/* Close button */}
              <div className="w-full flex justify-between items-center">
                <div>
                  <p className="font-mono text-base font-bold text-blue-gem">{selectedGem}</p>
                  {selectedGemData && (
                    <p className="text-sm text-text-muted">{selectedGemData.gemType}</p>
                  )}
                </div>
                <button
                  onClick={() => setShowFullQR(false)}
                  className="w-9 h-9 rounded-xl bg-surface-2 flex items-center justify-center text-text-muted hover:bg-surface hover:text-text-primary transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Full size QR image */}
              <img
                src={`${qrDownloadUrl}?t=${imageKey}`}
                alt={`QR Code for ${selectedGem}`}
                style={{ width: 320, height: 320, imageRendering: "pixelated" }}
              />

              {/* Actions */}
              <div className="flex gap-3 w-full">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleDownload}
                  className="flex-1 h-11 bg-primary text-primary-foreground rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
                >
                  <Download size={15} />
                  Download PNG
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowFullQR(false)}
                  className="h-11 px-5 border border-border rounded-xl text-sm font-semibold text-text-primary flex items-center gap-2 hover:bg-surface-2"
                >
                  <ArrowLeft size={15} />
                  Back
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* QR Content Preview Modal */}
      <AnimatePresence>
        {showPreview && previewContent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6"
            onClick={() => setShowPreview(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-card border border-border rounded-2xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <div>
                  <p className="text-base font-semibold text-text-primary">QR Code Content</p>
                  <p className="text-xs text-text-muted mt-0.5">
                    This is the exact text encoded inside the QR code
                  </p>
                </div>
                <button
                  onClick={() => setShowPreview(false)}
                  className="w-8 h-8 rounded-lg bg-surface-2 flex items-center justify-center text-text-muted hover:bg-surface hover:text-text-primary transition-colors"
                >
                  <X size={15} />
                </button>
              </div>

              <pre className="bg-surface-2 rounded-xl p-5 text-xs text-text-secondary font-mono whitespace-pre-wrap leading-relaxed overflow-x-auto">
                {previewContent}
              </pre>

              <div className="mt-4 flex justify-end gap-3">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(previewContent);
                    setMessage({ text: "QR content copied to clipboard!", type: "success" });
                    setShowPreview(false);
                  }}
                  className="h-9 px-4 border border-border rounded-lg text-sm font-medium text-text-secondary hover:bg-surface-2"
                >
                  Copy to Clipboard
                </button>
                <button
                  onClick={() => setShowPreview(false)}
                  className="h-9 px-4 bg-primary text-primary-foreground rounded-lg text-sm font-semibold"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default QRPage;