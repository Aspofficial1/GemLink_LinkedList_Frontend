// =============================================================
// api.ts — Ceylon Gem Origin Tracking System
// All backend API calls go through this file.
// Base URL points to the Java Spark server on port 4567.
// =============================================================

const BASE_URL = "http://localhost:4567/api";

// =============================================================
// Response type that matches ApiResponse.java exactly
// =============================================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
  timestamp: number;
  statusCode: number;
}

// =============================================================
// Shared fetch helper
// Handles all requests and returns the parsed JSON response.
// Throws an error if the response is not ok.
// =============================================================

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${BASE_URL}${endpoint}`;

  const defaultHeaders: HeadersInit = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  const data: ApiResponse<T> = await response.json();
  return data;
}

// =============================================================
// HEALTH
// =============================================================

/**
 * GET /api/health
 * Check if the API server is running.
 * Call this on app startup to confirm the backend is available.
 */
export async function checkHealth() {
  return request("/health");
}

// =============================================================
// GEMS
// =============================================================

/**
 * GET /api/gems
 * Returns all gem summaries for the dashboard table.
 */
export async function getAllGems() {
  return request("/gems");
}

/**
 * GET /api/gems/:id
 * Returns the full journey of a specific gem including all stages.
 * Used on the Track Gem page timeline.
 */
export async function getGemById(gemId: string) {
  return request(`/gems/${gemId}`);
}

/**
 * GET /api/gems/search?type=Blue+Sapphire
 * GET /api/gems/search?district=Ratnapura
 * Search gems by type or origin district.
 */
export async function searchGems(params: {
  type?: string;
  district?: string;
}) {
  const query = new URLSearchParams();
  if (params.type) query.append("type", params.type);
  if (params.district) query.append("district", params.district);
  return request(`/gems/search?${query.toString()}`);
}

/**
 * GET /api/gems/ceylon
 * Returns only Ceylon verified gems.
 * Used for the Ceylon Verified filter on the dashboard.
 */
export async function getCeylonGems() {
  return request("/gems/ceylon");
}

/**
 * POST /api/gems
 * Register a new gem in the system.
 * Body must include all mining stage details.
 */
export async function registerGem(gemData: {
  gemType: string;
  colorDescription: string;
  originMine: string;
  district: string;
  village?: string;
  minerName: string;
  minerIdNumber: string;
  minerContact: string;
  weightInCarats: number;
  priceInRupees: number;
  miningDate: string;
}) {
  return request("/gems", {
    method: "POST",
    body: JSON.stringify(gemData),
  });
}

/**
 * DELETE /api/gems/:id
 * Delete a gem and all its stages permanently.
 */
export async function deleteGem(gemId: string) {
  return request(`/gems/${gemId}`, {
    method: "DELETE",
  });
}

// =============================================================
// STAGES
// =============================================================

/**
 * GET /api/gems/:id/stages
 * Returns all stages for a gem as an ordered list.
 * Used to build the journey timeline on the Track Gem page.
 */
export async function getGemStages(gemId: string) {
  return request(`/gems/${gemId}/stages`);
}

/**
 * POST /api/gems/:id/stages
 * Add a new stage to a gem journey.
 * Called every time a gem moves to the next stage.
 */
export async function addStage(
  gemId: string,
  stageData: {
    stageType: string;
    location: string;
    personName: string;
    personIdNumber?: string;
    contactNumber?: string;
    weightInCarats: number;
    priceInRupees: number;
    stageDate: string;
    flightNumber?: string;
    invoiceNumber?: string;
    destinationCountry?: string;
    certificateNumber?: string;
    issuingAuthority?: string;
    notes?: string;
  }
) {
  return request(`/gems/${gemId}/stages`, {
    method: "POST",
    body: JSON.stringify(stageData),
  });
}

/**
 * DELETE /api/gems/:id/stages/:position
 * Remove a stage at a specific position (0-based index).
 */
export async function removeStage(gemId: string, position: number) {
  return request(`/gems/${gemId}/stages/${position}`, {
    method: "DELETE",
  });
}

/**
 * PUT /api/gems/:id/stages/current/certificate
 * Add certificate details to the current stage.
 */
export async function addCertificate(
  gemId: string,
  data: {
    certificateNumber: string;
    issuingAuthority: string;
  }
) {
  return request(`/gems/${gemId}/stages/current/certificate`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

/**
 * PUT /api/gems/:id/stages/current/export
 * Add export details to the current EXPORTING stage.
 */
export async function addExportDetails(
  gemId: string,
  data: {
    flightNumber: string;
    invoiceNumber: string;
    destinationCountry: string;
  }
) {
  return request(`/gems/${gemId}/stages/current/export`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

/**
 * PUT /api/gems/:id/stages/current/notes
 * Add a note to the current stage.
 */
export async function addNotes(gemId: string, notes: string) {
  return request(`/gems/${gemId}/stages/current/notes`, {
    method: "PUT",
    body: JSON.stringify({ notes }),
  });
}

// =============================================================
// VERIFICATION
// =============================================================

/**
 * GET /api/gems/:id/verify
 * Run full authentication on a gem.
 * Returns all three check results — origin, certificate, location.
 */
export async function verifyGem(gemId: string) {
  return request(`/gems/${gemId}/verify`);
}

/**
 * GET /api/gems/:id/verify/origin
 * Check only the origin location of a gem.
 */
export async function verifyOrigin(gemId: string) {
  return request(`/gems/${gemId}/verify/origin`);
}

/**
 * GET /api/gems/:id/verify/certificate
 * Check whether a certificate exists for the gem.
 */
export async function verifyCertificate(gemId: string) {
  return request(`/gems/${gemId}/verify/certificate`);
}

/**
 * GET /api/verify/all
 * Run origin verification on every gem in the system.
 * Returns a summary of pass and fail counts.
 */
export async function verifyAllGems() {
  return request("/verify/all");
}

/**
 * GET /api/verify/locations
 * Returns the list of valid Sri Lankan gem mining locations.
 * Used to populate the location hints on the register form.
 */
export async function getValidLocations() {
  return request("/verify/locations");
}

/**
 * GET /api/gems/:id/risk
 * Returns the fraud risk score for a gem (0 to 100).
 * Used to display the circular risk gauge on the Track Gem page.
 */
export async function getFraudRiskScore(gemId: string) {
  return request(`/gems/${gemId}/risk`);
}

// =============================================================
// ALERTS
// =============================================================

/**
 * GET /api/alerts
 * Returns all fraud alerts including resolved and unresolved.
 */
export async function getAllAlerts() {
  return request("/alerts");
}

/**
 * GET /api/alerts/unresolved
 * Returns only unresolved fraud alerts.
 * Used by the dashboard bell notification and the alerts page.
 */
export async function getUnresolvedAlerts() {
  return request("/alerts/unresolved");
}

/**
 * GET /api/alerts/gem/:gemId
 * Returns all alerts for a specific gem.
 * Used on the Track Gem page to show alerts for the viewed gem.
 */
export async function getAlertsByGem(gemId: string) {
  return request(`/alerts/gem/${gemId}`);
}

/**
 * PUT /api/alerts/:id/resolve
 * Mark a specific alert as resolved.
 * Called when an administrator clears an alert.
 */
export async function resolveAlert(alertId: number) {
  return request(`/alerts/${alertId}/resolve`, {
    method: "PUT",
  });
}

// =============================================================
// STATISTICS
// =============================================================

/**
 * GET /api/stats
 * Returns all system statistics for the dashboard.
 * Includes gem counts, Ceylon rate, alert count, top types.
 */
export async function getAllStats() {
  return request("/stats");
}

/**
 * GET /api/stats/summary
 * Returns a brief summary for the four dashboard stat cards.
 * Lighter version of getAllStats — call this more frequently.
 */
export async function getDashboardSummary() {
  return request("/stats/summary");
}

/**
 * GET /api/gems/:id/price
 * Returns price history for a gem at each stage.
 * Used by the Recharts line chart on the dashboard.
 */
export async function getPriceHistory(gemId: string) {
  return request(`/gems/${gemId}/price`);
}

/**
 * GET /api/gems/:id/weight
 * Returns weight analysis for a gem across all stages.
 * Shows original weight, current weight, and weight lost.
 */
export async function getWeightAnalysis(gemId: string) {
  return request(`/gems/${gemId}/weight`);
}

/**
 * GET /api/gems/compare?gem1=BS-123&gem2=RB-456
 * Returns a side by side comparison of two gems.
 * Used on the Compare Gems page table and bar chart.
 */
export async function compareGems(gemId1: string, gemId2: string) {
  return request(`/gems/compare?gem1=${gemId1}&gem2=${gemId2}`);
}

// =============================================================
// QR CODES
// =============================================================

/**
 * GET /api/gems/:id/qr
 * Check if a QR code exists for a gem.
 * Returns the download URL if it exists.
 */
export async function getQRStatus(gemId: string) {
  return request(`/gems/${gemId}/qr`);
}

/**
 * POST /api/gems/:id/qr
 * Generate a new QR code for a gem.
 * Returns the download URL for the generated image.
 */
export async function generateQRCode(gemId: string) {
  return request(`/gems/${gemId}/qr`, {
    method: "POST",
  });
}

/**
 * PUT /api/gems/:id/qr
 * Regenerate the QR code with the latest journey data.
 * Call this after adding a new stage to a gem.
 */
export async function regenerateQRCode(gemId: string) {
  return request(`/gems/${gemId}/qr`, {
    method: "PUT",
  });
}

/**
 * GET /api/gems/:id/qr/download
 * Returns the direct URL to the QR code PNG image.
 * Use this as the src attribute of an img tag directly.
 * Example: <img src={getQRDownloadUrl("BS-123")} />
 */
export function getQRDownloadUrl(gemId: string): string {
  return `${BASE_URL}/gems/${gemId}/qr/download`;
}

/**
 * GET /api/gems/:id/qr/preview
 * Returns the text content encoded inside the QR code.
 * Used to show a preview of QR content before generating.
 */
export async function previewQRContent(gemId: string) {
  return request(`/gems/${gemId}/qr/preview`);
}

/**
 * GET /api/qr/status
 * Returns QR code status for all gems in the system.
 */
export async function getAllQRStatus() {
  return request("/qr/status");
}

// =============================================================
// REPORTS
// =============================================================

/**
 * POST /api/gems/:id/report/full
 * Generate a full journey report for a gem.
 * Returns the report content and file path.
 */
export async function generateFullReport(gemId: string) {
  return request(`/gems/${gemId}/report/full`, {
    method: "POST",
  });
}

/**
 * POST /api/gems/:id/report/summary
 * Generate a summary report for a gem.
 * Shorter than the full report — key stats only.
 */
export async function generateSummaryReport(gemId: string) {
  return request(`/gems/${gemId}/report/summary`, {
    method: "POST",
  });
}

/**
 * POST /api/report/all
 * Generate a full system report covering all gems.
 * Used by administrators for auditing.
 */
export async function generateAllGemsReport() {
  return request("/report/all", {
    method: "POST",
  });
}

/**
 * GET /api/reports
 * Returns a list of all saved report files on the server.
 * Used on the Reports page to show previously generated reports.
 */
export async function listSavedReports() {
  return request("/reports");
}