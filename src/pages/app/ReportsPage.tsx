import React, { useEffect, useState } from "react";
import { getAllGems, getGemById, generateFullReport } from "../../api/api";

const ReportsPage: React.FC = () => {
  const [allGems, setAllGems] = useState<any[]>([]);
  const [selectedGem, setSelectedGem] = useState("");
  const [gemDetail, setGemDetail] = useState<any>(null);
  const [loadingGems, setLoadingGems] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [reportGenerated, setReportGenerated] = useState(false);

  // Load all gems for the dropdown
  useEffect(() => {
    const fetchGems = async () => {
      try {
        const res = await getAllGems();
        if (res.success && res.data) {
          const gems = res.data as any[];
          setAllGems(gems);
          if (gems.length > 0) {
            setSelectedGem(gems[0].gemId);
          }
        }
      } catch (err) {
        console.error("Failed to load gems:", err);
      } finally {
        setLoadingGems(false);
      }
    };
    fetchGems();
  }, []);

  // Load full gem detail when selectedGem changes
  useEffect(() => {
    if (!selectedGem) return;

    const fetchGemDetail = async () => {
      setLoadingDetail(true);
      setReportGenerated(false);
      try {
        const res = await getGemById(selectedGem);
        if (res.success && res.data) {
          setGemDetail(res.data);
        } else {
          setGemDetail(null);
        }
      } catch (err) {
        console.error("Failed to load gem detail:", err);
        setGemDetail(null);
      } finally {
        setLoadingDetail(false);
      }
    };

    fetchGemDetail();
  }, [selectedGem]);

  // Handle generate and print report
  const handleGenerateReport = async () => {
    if (!selectedGem) return;
    setGenerating(true);
    try {
      const res = await generateFullReport(selectedGem);
      if (res.success) {
        setReportGenerated(true);
      }
    } catch (err) {
      console.error("Failed to generate report:", err);
    } finally {
      setGenerating(false);
    }
  };

  // Extract gem fields from API response
  const gemId       = gemDetail?.gemId || selectedGem;
  const gemType     = gemDetail?.gemType || "—";
  const origin      = gemDetail?.origin || "—";
  const miningDate  = gemDetail?.miningDate || "—";
  const miner       = gemDetail?.miner || "—";
  const currentWeight   = gemDetail?.currentWeight || "—";
  const originalWeight  = gemDetail?.originalWeight || "—";
  const verified        = gemDetail?.verified || false;
  const verificationStatus = gemDetail?.verificationStatus || "";
  const stageHistory: any[] = gemDetail?.stageHistory || [];

  // Find certificate from stages
  const certStage = stageHistory.find((s: any) => s.certificateNumber);
  const certificateNumber = certStage?.certificateNumber || "Pending";

  return (
    <div className="p-8 space-y-6">
      {/* Gem selector */}
      <select
        value={selectedGem}
        onChange={e => setSelectedGem(e.target.value)}
        className="w-full max-w-md h-10 px-3 border border-border rounded-lg text-sm bg-background"
        disabled={loadingGems}
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

      {/* Loading state */}
      {loadingDetail && (
        <div className="text-center py-12 text-text-muted text-sm">
          Loading gem details...
        </div>
      )}

      {/* Certificate document */}
      {!loadingDetail && gemDetail && (
        <div
          className="bg-card border border-border-strong rounded p-0 max-w-2xl mx-auto print:border-2 print:shadow-none"
          id="cert-doc"
        >
          {/* Header */}
          <div className="bg-primary text-primary-foreground text-center py-6 px-4">
            <p className="font-display text-base font-bold tracking-wider">
              NATIONAL GEM AND JEWELLERY AUTHORITY
            </p>
            <p className="text-xs mt-1 opacity-70">
              Sri Lanka — Official Gem Origin Certificate
            </p>
          </div>

          <div className="p-10 space-y-6">
            {/* Gem ID */}
            <div className="text-center border border-border-strong px-4 py-2 inline-block mx-auto font-mono text-lg font-bold text-text-primary">
              {gemId}
            </div>

            {/* Key details grid */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-text-muted">Certificate:</span>{" "}
                <span className="font-medium">{certificateNumber}</span>
              </div>
              <div>
                <span className="text-text-muted">Date:</span>{" "}
                <span className="font-medium">{miningDate}</span>
              </div>
              <div>
                <span className="text-text-muted">Type:</span>{" "}
                <span className="font-medium">{gemType}</span>
              </div>
              <div>
                <span className="text-text-muted">Origin:</span>{" "}
                <span className="font-medium">{origin}</span>
              </div>
              <div>
                <span className="text-text-muted">Weight:</span>{" "}
                <span className="font-medium">
                  {currentWeight} ct (original: {originalWeight} ct)
                </span>
              </div>
              <div>
                <span className="text-text-muted">Miner:</span>{" "}
                <span className="font-medium">{miner}</span>
              </div>
            </div>

            {/* Journey summary table */}
            <div>
              <h4 className="text-sm font-semibold mb-2 text-text-primary">
                Journey Summary
              </h4>
              <table className="w-full text-xs border border-border">
                <thead>
                  <tr className="bg-surface-2">
                    <th className="p-2 text-left">Stage</th>
                    <th className="p-2 text-left">Location</th>
                    <th className="p-2 text-left">Date</th>
                    <th className="p-2 text-right">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {stageHistory.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="p-4 text-center text-text-muted"
                      >
                        No stages recorded yet.
                      </td>
                    </tr>
                  ) : (
                    stageHistory.map((s: any, i: number) => (
                      <tr key={i} className="border-t border-border">
                        <td className="p-2">
                          {s.stageLabel || s.stageType}
                        </td>
                        <td className="p-2">{s.location}</td>
                        <td className="p-2">{s.date}</td>
                        <td className="p-2 text-right">
                          Rs. {Number(s.priceInRupees).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Weight and price analysis */}
            {gemDetail.weightLoss !== undefined && (
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-text-muted">Weight Loss:</span>{" "}
                  <span className="font-medium">
                    {Number(gemDetail.weightLoss).toFixed(4)} ct (
                    {Number(gemDetail.weightLossPercent).toFixed(2)}%)
                  </span>
                </div>
                <div>
                  <span className="text-text-muted">Price Appreciation:</span>{" "}
                  <span className="font-medium">
                    Rs. {Number(gemDetail.priceAppreciation).toLocaleString()}
                  </span>
                </div>
              </div>
            )}

            {/* Verification stamp */}
            <div className="flex justify-center pt-4">
              <div
                className={`w-[120px] h-[120px] rounded-full border-[3px] flex items-center justify-center text-center ${
                  verified
                    ? "border-success text-success"
                    : "border-danger text-danger"
                }`}
              >
                <span className="text-[11px] font-bold uppercase leading-tight">
                  {verified
                    ? "VERIFIED\nCEYLON GEM"
                    : "UNVERIFIED\nGEM"}
                </span>
              </div>
            </div>

            {/* Verification status label */}
            {verificationStatus && (
              <p className="text-center text-xs text-text-muted">
                {verificationStatus}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Action buttons */}
      {!loadingDetail && gemDetail && (
        <div className="flex gap-3 justify-center no-print">
          <button
            onClick={handleGenerateReport}
            disabled={generating}
            className="h-10 px-6 bg-primary text-primary-foreground rounded-lg text-sm font-semibold disabled:opacity-60"
          >
            {generating
              ? "Generating..."
              : reportGenerated
              ? "Report Saved"
              : "Generate Report"}
          </button>
          <button
            onClick={() => window.print()}
            className="h-10 px-6 bg-primary text-primary-foreground rounded-lg text-sm font-semibold"
          >
            Print Document
          </button>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;