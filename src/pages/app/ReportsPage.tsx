import React, { useEffect, useState } from "react";
import { getAllGems, getGemById, generateFullReport } from "../../api/api";

const ReportsPage: React.FC = () => {
  const [allGems, setAllGems]           = useState<any[]>([]);
  const [selectedGem, setSelectedGem]   = useState("");
  const [gemDetail, setGemDetail]       = useState<any>(null);
  const [loadingGems, setLoadingGems]   = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [generating, setGenerating]     = useState(false);
  const [reportGenerated, setReportGenerated] = useState(false);

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

  // Load full gem detail when selectedGem changes
  useEffect(() => {
    if (!selectedGem) return;
    const fetchGemDetail = async () => {
      setLoadingDetail(true);
      setReportGenerated(false);
      try {
        const res = await getGemById(selectedGem);
        if (res.success && res.data) setGemDetail(res.data);
        else setGemDetail(null);
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
      if (res.success) setReportGenerated(true);
    } catch (err) {
      console.error("Failed to generate report:", err);
    } finally {
      setGenerating(false);
    }
  };

  // Extract gem fields
  const gemId              = gemDetail?.gemId          || selectedGem;
  const gemType            = gemDetail?.gemType        || "—";
  const origin             = gemDetail?.origin         || "—";
  const miningDate         = gemDetail?.miningDate     || "—";
  const miner              = gemDetail?.miner          || "—";
  const currentWeight      = gemDetail?.currentWeight  || "—";
  const originalWeight     = gemDetail?.originalWeight || "—";
  const verified           = gemDetail?.verified       || false;
  const verificationStatus = gemDetail?.verificationStatus || "";
  const stageHistory: any[]= gemDetail?.stageHistory   || [];
  const currentPrice       = gemDetail?.currentPrice   || 0;
  const miningPrice        = gemDetail?.miningPrice    || 0;
  const currentOwner       = gemDetail?.currentOwner   || "—";
  const currentLocation    = gemDetail?.currentLocation || "—";
  const currentStageLabel  = gemDetail?.currentStageLabel || "—";

  const certStage         = stageHistory.find((s: any) => s.certificateNumber);
  const certificateNumber = certStage?.certificateNumber || "Pending";
  const issuingAuthority  = certStage?.issuingAuthority  || "Pending";

  const weightLoss        = Number(gemDetail?.weightLoss        || 0).toFixed(4);
  const weightLossPercent = Number(gemDetail?.weightLossPercent || 0).toFixed(2);
  const priceAppreciation = Number(gemDetail?.priceAppreciation || 0);
  const totalStages       = gemDetail?.totalStages || 0;

  // Print styles injected into head
  const printStyles = `
    @media print {
      body * { visibility: hidden !important; }
      #cert-doc, #cert-doc * { visibility: visible !important; }
      #cert-doc { position: fixed !important; left: 0; top: 0; width: 100%; }
      .no-print { display: none !important; }
    }
  `;

  return (
    <div className="p-8 space-y-6">
      <style>{printStyles}</style>

      {/* Gem selector */}
      <div className="max-w-lg">
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

      {/* Loading state */}
      {loadingDetail && (
        <div className="text-center py-12 text-text-muted text-sm">
          Loading gem details...
        </div>
      )}

      {/* Full Certificate Document */}
      {!loadingDetail && gemDetail && (
        <div
          id="cert-doc"
          style={{
            maxWidth: 760,
            margin: "0 auto",
            background: "white",
            border: "2px solid #1B4F8A",
            borderRadius: 12,
            overflow: "hidden",
            fontFamily: "Georgia, serif",
            color: "#0A0A0A",
          }}
        >
          {/* ── Header ── */}
          <div style={{ background: "#1B4F8A", padding: "28px 40px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ color: "white", fontSize: 18, fontWeight: 700, letterSpacing: 2, fontFamily: "Georgia, serif" }}>
                NATIONAL GEM AND JEWELLERY AUTHORITY
              </div>
              <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 12, marginTop: 4 }}>
                Sri Lanka — Official Gem Origin Certificate
              </div>
            </div>
            {/* Diamond logo */}
            <svg width={48} height={48} viewBox="0 0 32 32" fill="none">
              <polygon points="8,4 24,4 30,12 16,28 2,12" fill="rgba(255,255,255,0.2)" stroke="white" strokeWidth="1" />
              <polygon points="8,4 24,4 20,12 12,12" fill="rgba(255,255,255,0.4)" />
            </svg>
          </div>

          {/* ── Gold accent bar ── */}
          <div style={{ background: "#C9A84C", height: 4 }} />

          <div style={{ padding: "32px 40px", display: "flex", gap: 32 }}>

            {/* ── LEFT — Main content ── */}
            <div style={{ flex: 1 }}>

              {/* Gem ID badge */}
              <div style={{ display: "inline-block", border: "2px solid #1B4F8A", borderRadius: 6, padding: "6px 16px", marginBottom: 24 }}>
                <span style={{ fontFamily: "monospace", fontSize: 18, fontWeight: 700, color: "#1B4F8A", letterSpacing: 1 }}>
                  {gemId}
                </span>
              </div>

              {/* ── Section: Gem Overview ── */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ background: "#1B4F8A", color: "white", fontSize: 11, fontWeight: 700, letterSpacing: 1, padding: "4px 10px", borderRadius: 4, display: "inline-block", marginBottom: 10 }}>
                  GEM OVERVIEW
                </div>
                <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse" }}>
                  <tbody>
                    {[
                      ["Certificate No.",  certificateNumber],
                      ["Issuing Authority", issuingAuthority],
                      ["Gem Type",         gemType],
                      ["Origin",           origin],
                      ["Mining Date",      miningDate],
                      ["Miner",            miner],
                      ["Original Weight",  `${originalWeight} carats`],
                      ["Current Weight",   `${currentWeight} carats`],
                      ["Current Stage",    currentStageLabel],
                      ["Current Owner",    currentOwner],
                      ["Current Location", currentLocation],
                      ["Mining Price",     `Rs. ${Number(miningPrice).toLocaleString()}`],
                      ["Current Value",    `Rs. ${Number(currentPrice).toLocaleString()}`],
                    ].map(([label, value]) => (
                      <tr key={label} style={{ borderBottom: "1px solid #F0F0F0" }}>
                        <td style={{ padding: "5px 8px 5px 0", color: "#555", fontWeight: 600, whiteSpace: "nowrap", width: "42%" }}>{label}</td>
                        <td style={{ padding: "5px 0", color: "#0A0A0A", fontWeight: 500 }}>{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* ── Section: Full Journey Stage by Stage ── */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ background: "#1B4F8A", color: "white", fontSize: 11, fontWeight: 700, letterSpacing: 1, padding: "4px 10px", borderRadius: 4, display: "inline-block", marginBottom: 10 }}>
                  COMPLETE JOURNEY — {totalStages} STAGE{totalStages !== 1 ? "S" : ""}
                </div>

                {stageHistory.map((s: any, i: number) => (
                  <div
                    key={i}
                    style={{
                      border: s.isCurrent ? "2px solid #C9A84C" : "1px solid #E0E0E0",
                      borderRadius: 8,
                      padding: "10px 14px",
                      marginBottom: 10,
                      background: s.isCurrent ? "#FFFDF5" : "#FAFAFA",
                    }}
                  >
                    {/* Stage header */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{
                          background: s.isCurrent ? "#C9A84C" : "#1B4F8A",
                          color: "white", borderRadius: "50%", width: 22, height: 22,
                          display: "inline-flex", alignItems: "center", justifyContent: "center",
                          fontSize: 11, fontWeight: 700, flexShrink: 0,
                        }}>
                          {i + 1}
                        </span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: "#1B4F8A" }}>
                          {s.stageLabel || s.stageType}
                        </span>
                        {s.isCurrent && (
                          <span style={{ fontSize: 10, background: "#C9A84C", color: "white", padding: "1px 6px", borderRadius: 10, fontWeight: 700 }}>
                            CURRENT
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: 12, color: "#555" }}>{s.date}</span>
                    </div>

                    {/* Stage details grid */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3px 16px", fontSize: 11 }}>
                      <div><span style={{ color: "#777" }}>Location: </span><span style={{ fontWeight: 600 }}>{s.location}</span></div>
                      <div><span style={{ color: "#777" }}>Person: </span><span style={{ fontWeight: 600 }}>{s.personName}</span></div>
                      <div><span style={{ color: "#777" }}>Weight: </span><span style={{ fontWeight: 600 }}>{s.weightInCarats} ct</span></div>
                      <div><span style={{ color: "#777" }}>Price: </span><span style={{ fontWeight: 600 }}>Rs. {Number(s.priceInRupees).toLocaleString()}</span></div>
                      {s.personIdNumber && <div><span style={{ color: "#777" }}>NIC: </span><span style={{ fontWeight: 600 }}>{s.personIdNumber}</span></div>}
                      {s.contactNumber && <div><span style={{ color: "#777" }}>Contact: </span><span style={{ fontWeight: 600 }}>{s.contactNumber}</span></div>}
                      {s.certificateNumber && <div><span style={{ color: "#777" }}>Certificate: </span><span style={{ fontWeight: 600 }}>{s.certificateNumber}</span></div>}
                      {s.issuingAuthority && <div><span style={{ color: "#777" }}>Authority: </span><span style={{ fontWeight: 600 }}>{s.issuingAuthority}</span></div>}
                      {s.flightNumber && <div><span style={{ color: "#777" }}>Flight: </span><span style={{ fontWeight: 600 }}>{s.flightNumber}</span></div>}
                      {s.invoiceNumber && <div><span style={{ color: "#777" }}>Invoice: </span><span style={{ fontWeight: 600 }}>{s.invoiceNumber}</span></div>}
                      {s.destinationCountry && <div><span style={{ color: "#777" }}>Destination: </span><span style={{ fontWeight: 600 }}>{s.destinationCountry}</span></div>}
                      {s.priceIncreaseFromPrevious !== undefined && Number(s.priceIncreaseFromPrevious) > 0 && (
                        <div style={{ color: "#166534" }}>
                          <span style={{ color: "#777" }}>Value Added: </span>
                          <span style={{ fontWeight: 600 }}>+Rs. {Number(s.priceIncreaseFromPrevious).toLocaleString()}</span>
                        </div>
                      )}
                      {s.notes && (
                        <div style={{ gridColumn: "1 / -1" }}>
                          <span style={{ color: "#777" }}>Notes: </span>
                          <span style={{ fontWeight: 600 }}>{s.notes}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* ── Section: Analysis Summary ── */}
              <div style={{ marginBottom: 8 }}>
                <div style={{ background: "#1B4F8A", color: "white", fontSize: 11, fontWeight: 700, letterSpacing: 1, padding: "4px 10px", borderRadius: 4, display: "inline-block", marginBottom: 10 }}>
                  ANALYSIS SUMMARY
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 16px", fontSize: 12 }}>
                  <div style={{ background: "#F5F5F5", borderRadius: 6, padding: "8px 12px" }}>
                    <div style={{ color: "#777", fontSize: 11 }}>Original Weight</div>
                    <div style={{ fontWeight: 700, color: "#0A0A0A" }}>{originalWeight} ct</div>
                  </div>
                  <div style={{ background: "#F5F5F5", borderRadius: 6, padding: "8px 12px" }}>
                    <div style={{ color: "#777", fontSize: 11 }}>Current Weight</div>
                    <div style={{ fontWeight: 700, color: "#0A0A0A" }}>{currentWeight} ct</div>
                  </div>
                  <div style={{ background: "#FEF2F2", borderRadius: 6, padding: "8px 12px" }}>
                    <div style={{ color: "#777", fontSize: 11 }}>Weight Lost</div>
                    <div style={{ fontWeight: 700, color: "#991B1B" }}>{weightLoss} ct ({weightLossPercent}%)</div>
                  </div>
                  <div style={{ background: "#F0FDF4", borderRadius: 6, padding: "8px 12px" }}>
                    <div style={{ color: "#777", fontSize: 11 }}>Price Appreciation</div>
                    <div style={{ fontWeight: 700, color: "#166534" }}>Rs. {priceAppreciation.toLocaleString()}</div>
                  </div>
                  <div style={{ background: "#F5F5F5", borderRadius: 6, padding: "8px 12px" }}>
                    <div style={{ color: "#777", fontSize: 11 }}>Mining Price</div>
                    <div style={{ fontWeight: 700, color: "#0A0A0A" }}>Rs. {Number(miningPrice).toLocaleString()}</div>
                  </div>
                  <div style={{ background: "#EFF6FF", borderRadius: 6, padding: "8px 12px" }}>
                    <div style={{ color: "#777", fontSize: 11 }}>Current Value</div>
                    <div style={{ fontWeight: 700, color: "#1B4F8A" }}>Rs. {Number(currentPrice).toLocaleString()}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── RIGHT — Verification seal panel ── */}
            <div style={{
              width: 160,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 16,
              paddingTop: 8,
              borderLeft: "1px solid #E8E8E8",
              paddingLeft: 24,
            }}>
              {/* Main verification stamp */}
              <div style={{
                width: 130,
                height: 130,
                borderRadius: "50%",
                border: `4px solid ${verified ? "#166534" : "#991B1B"}`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                padding: 12,
                background: verified ? "#F0FDF4" : "#FEF2F2",
              }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: verified ? "#166534" : "#991B1B", letterSpacing: 1, lineHeight: 1.3 }}>
                  {verified ? "VERIFIED\nCEYLON GEM" : "UNVERIFIED\nGEM"}
                </div>
                <div style={{ marginTop: 4 }}>
                  <svg width={28} height={28} viewBox="0 0 32 32" fill="none">
                    <polygon points="8,4 24,4 30,12 16,28 2,12" fill={verified ? "#166534" : "#991B1B"} opacity="0.3" />
                    <polygon points="8,4 24,4 20,12 12,12" fill={verified ? "#166534" : "#991B1B"} opacity="0.6" />
                  </svg>
                </div>
              </div>

              {/* Status label */}
              <div style={{ fontSize: 10, color: "#555", textAlign: "center", lineHeight: 1.4 }}>
                {verificationStatus}
              </div>

              {/* Divider */}
              <div style={{ width: "100%", height: 1, background: "#E8E8E8" }} />

              {/* Authority badge */}
              <div style={{
                background: "#1B4F8A",
                color: "white",
                borderRadius: 8,
                padding: "10px 8px",
                textAlign: "center",
                width: "100%",
              }}>
                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1, marginBottom: 4 }}>ISSUED BY</div>
                <div style={{ fontSize: 10, fontWeight: 600, lineHeight: 1.4 }}>
                  Gem Origin Tracking System
                </div>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.7)", marginTop: 4 }}>
                  Ceylon Gem Digital Passport
                </div>
              </div>

              {/* Date of report */}
              <div style={{ fontSize: 10, color: "#777", textAlign: "center" }}>
                Generated on<br />
                <span style={{ fontWeight: 600, color: "#0A0A0A" }}>
                  {new Date().toLocaleDateString("en-LK", { year: "numeric", month: "long", day: "numeric" })}
                </span>
              </div>

              {/* Divider */}
              <div style={{ width: "100%", height: 1, background: "#E8E8E8" }} />

              {/* Stage count */}
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 28, fontWeight: 700, color: "#1B4F8A" }}>{totalStages}</div>
                <div style={{ fontSize: 10, color: "#777" }}>Total Stages<br />Recorded</div>
              </div>

              {/* Gold seal */}
              <div style={{
                width: 90,
                height: 90,
                borderRadius: "50%",
                border: "3px solid #C9A84C",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                background: "#FFFDF5",
                textAlign: "center",
                padding: 8,
              }}>
                <div style={{ fontSize: 8, fontWeight: 800, color: "#C9A84C", letterSpacing: 0.5, lineHeight: 1.4 }}>
                  NATIONAL GEM &amp;<br />JEWELLERY<br />AUTHORITY<br />SRI LANKA
                </div>
              </div>

              {/* NIBM label */}
              <div style={{
                fontSize: 9,
                color: "#777",
                textAlign: "center",
                lineHeight: 1.5,
                borderTop: "1px solid #E8E8E8",
                paddingTop: 12,
                width: "100%",
              }}>
                NIBM<br />HND Software Engineering<br />PDSA Coursework
              </div>
            </div>
          </div>

          {/* ── Footer ── */}
          <div style={{ background: "#C9A84C", height: 4 }} />
          <div style={{ background: "#1B4F8A", padding: "12px 40px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 10 }}>
              Ceylon Gem Origin Tracking System — Digital Passport
            </span>
            <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 10 }}>
              {gemId}
            </span>
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
            {generating ? "Generating..." : reportGenerated ? "✓ Report Saved" : "Generate Report"}
          </button>
          <button
            onClick={() => window.print()}
            className="h-10 px-6 rounded-lg text-sm font-semibold border border-border bg-card text-text-primary hover:bg-surface-2"
          >
            Print / Save PDF
          </button>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;