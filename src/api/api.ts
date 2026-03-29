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
  success:    boolean;
  message:    string;
  data:       T;
  timestamp:  number;
  statusCode: number;
}

// =============================================================
// Shared fetch helper
// Handles all requests and returns the parsed JSON response.
// =============================================================

async function request<T>(
  endpoint: string,
  options:  RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${BASE_URL}${endpoint}`;

  const defaultHeaders: HeadersInit = {
    "Content-Type": "application/json",
    Accept:         "application/json",
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
  type?:     string;
  district?: string;
}) {
  const query = new URLSearchParams();
  if (params.type)     query.append("type",     params.type);
  if (params.district) query.append("district", params.district);
  return request(`/gems/search?${query.toString()}`);
}

/**
 * GET /api/gems/ceylon
 * Returns only Ceylon verified gems.
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
  gemType:          string;
  colorDescription: string;
  originMine:       string;
  district:         string;
  village?:         string;
  minerName:        string;
  minerIdNumber:    string;
  minerContact:     string;
  weightInCarats:   number;
  priceInRupees:    number;
  miningDate:       string;
}) {
  return request("/gems", {
    method: "POST",
    body:   JSON.stringify(gemData),
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
 */
export async function getGemStages(gemId: string) {
  return request(`/gems/${gemId}/stages`);
}

/**
 * POST /api/gems/:id/stages
 * Add a new stage to a gem journey.
 */
export async function addStage(
  gemId:     string,
  stageData: {
    stageType:           string;
    location:            string;
    personName:          string;
    personIdNumber?:     string;
    contactNumber?:      string;
    weightInCarats:      number;
    priceInRupees:       number;
    stageDate:           string;
    flightNumber?:       string;
    invoiceNumber?:      string;
    destinationCountry?: string;
    certificateNumber?:  string;
    issuingAuthority?:   string;
    notes?:              string;
  }
) {
  return request(`/gems/${gemId}/stages`, {
    method: "POST",
    body:   JSON.stringify(stageData),
  });
}

/**
 * PUT /api/gems/:id/stages/:position
 * Update an existing stage at a specific position (0-based index).
 * Only fields included in the request body are updated.
 * Records old value and new value to the audit log automatically.
 *
 * Updatable fields:
 *   location, personName, personIdNumber, contactNumber,
 *   weightInCarats, priceInRupees, stageDate,
 *   certificateNumber, issuingAuthority,
 *   flightNumber, invoiceNumber, destinationCountry, notes
 */
export async function updateStage(
  gemId:    string,
  position: number,
  stageData: {
    location?:           string;
    personName?:         string;
    personIdNumber?:     string;
    contactNumber?:      string;
    weightInCarats?:     number;
    priceInRupees?:      number;
    stageDate?:          string;
    certificateNumber?:  string;
    issuingAuthority?:   string;
    flightNumber?:       string;
    invoiceNumber?:      string;
    destinationCountry?: string;
    notes?:              string;
  }
) {
  return request(`/gems/${gemId}/stages/${position}`, {
    method: "PUT",
    body:   JSON.stringify(stageData),
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
    issuingAuthority:  string;
  }
) {
  return request(`/gems/${gemId}/stages/current/certificate`, {
    method: "PUT",
    body:   JSON.stringify(data),
  });
}

/**
 * PUT /api/gems/:id/stages/current/export
 * Add export details to the current EXPORTING stage.
 */
export async function addExportDetails(
  gemId: string,
  data: {
    flightNumber:       string;
    invoiceNumber:      string;
    destinationCountry: string;
  }
) {
  return request(`/gems/${gemId}/stages/current/export`, {
    method: "PUT",
    body:   JSON.stringify(data),
  });
}

/**
 * PUT /api/gems/:id/stages/current/notes
 * Add a note to the current stage.
 */
export async function addNotes(gemId: string, notes: string) {
  return request(`/gems/${gemId}/stages/current/notes`, {
    method: "PUT",
    body:   JSON.stringify({ notes }),
  });
}

// =============================================================
// VERIFICATION
// =============================================================

/**
 * GET /api/gems/:id/verify
 * Run full authentication on a gem.
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
 */
export async function verifyAllGems() {
  return request("/verify/all");
}

/**
 * GET /api/verify/locations
 * Returns the list of valid Sri Lankan gem mining locations.
 */
export async function getValidLocations() {
  return request("/verify/locations");
}

/**
 * GET /api/gems/:id/risk
 * Returns the fraud risk score for a gem (0 to 100).
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
 */
export async function getUnresolvedAlerts() {
  return request("/alerts/unresolved");
}

/**
 * GET /api/alerts/gem/:gemId
 * Returns all alerts for a specific gem.
 */
export async function getAlertsByGem(gemId: string) {
  return request(`/alerts/gem/${gemId}`);
}

/**
 * PUT /api/alerts/:id/resolve
 * Mark a specific alert as resolved.
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
 */
export async function getAllStats() {
  return request("/stats");
}

/**
 * GET /api/stats/summary
 * Returns a brief summary for the four dashboard stat cards.
 */
export async function getDashboardSummary() {
  return request("/stats/summary");
}

/**
 * GET /api/gems/:id/price
 * Returns price history for a gem at each stage.
 */
export async function getPriceHistory(gemId: string) {
  return request(`/gems/${gemId}/price`);
}

/**
 * GET /api/gems/:id/weight
 * Returns weight analysis for a gem across all stages.
 */
export async function getWeightAnalysis(gemId: string) {
  return request(`/gems/${gemId}/weight`);
}

/**
 * GET /api/gems/compare?gem1=BS-123&gem2=RB-456
 * Returns a side by side comparison of two gems.
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
 */
export async function getQRStatus(gemId: string) {
  return request(`/gems/${gemId}/qr`);
}

/**
 * POST /api/gems/:id/qr
 * Generate a new QR code for a gem.
 */
export async function generateQRCode(gemId: string) {
  return request(`/gems/${gemId}/qr`, {
    method: "POST",
  });
}

/**
 * PUT /api/gems/:id/qr
 * Regenerate the QR code with the latest journey data.
 */
export async function regenerateQRCode(gemId: string) {
  return request(`/gems/${gemId}/qr`, {
    method: "PUT",
  });
}

/**
 * GET /api/gems/:id/qr/download
 * Returns the direct URL to the QR code PNG image.
 */
export function getQRDownloadUrl(gemId: string): string {
  return `${BASE_URL}/gems/${gemId}/qr/download`;
}

/**
 * GET /api/gems/:id/qr/preview
 * Returns the text content encoded inside the QR code.
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
 */
export async function generateFullReport(gemId: string) {
  return request(`/gems/${gemId}/report/full`, {
    method: "POST",
  });
}

/**
 * POST /api/gems/:id/report/summary
 * Generate a summary report for a gem.
 */
export async function generateSummaryReport(gemId: string) {
  return request(`/gems/${gemId}/report/summary`, {
    method: "POST",
  });
}

/**
 * POST /api/report/all
 * Generate a full system report covering all gems.
 */
export async function generateAllGemsReport() {
  return request("/report/all", {
    method: "POST",
  });
}

/**
 * GET /api/reports
 * Returns a list of all saved report files on the server.
 */
export async function listSavedReports() {
  return request("/reports");
}

// =============================================================
// AUDIT TRAIL — Feature 1
// Complete change history for all gems and stages.
// Every addition, update, and deletion is recorded.
// =============================================================

/**
 * GET /api/audit
 * Returns all audit log entries across all gems.
 * Supports optional query params:
 *   ?action=STAGE_ADDED  — filter by action type
 *   ?limit=50            — limit number of results
 */
export async function getAllAuditLogs(params?: {
  action?: string;
  limit?:  number;
}) {
  const query = new URLSearchParams();
  if (params?.action) query.append("action", params.action);
  if (params?.limit)  query.append("limit",  String(params.limit));
  const qs = query.toString();
  return request(`/audit${qs ? `?${qs}` : ""}`);
}

/**
 * GET /api/audit/summary
 * Returns a summary count of each action type across all gems.
 * Used on the audit dashboard to show stat cards:
 *   totalChanges, stagesAdded, stagesUpdated, stagesDeleted,
 *   gemsRegistered, gemsDeleted, certificatesAdded, etc.
 */
export async function getAuditSummary() {
  return request("/audit/summary");
}

/**
 * GET /api/audit/recent?limit=20
 * Returns the most recent N audit log entries.
 * Used on the dashboard activity feed widget.
 *
 * @param limit max number of entries to return (default 20)
 */
export async function getRecentAuditLogs(limit: number = 20) {
  return request(`/audit/recent?limit=${limit}`);
}

/**
 * GET /api/audit/gem/:gemId
 * Returns all audit log entries for a specific gem.
 * Supports optional filter:
 *   ?action=STAGE_DELETED — filter by action type
 *
 * Response includes:
 *   gemId, totalChanges, logs[], changeBreakdown
 */
export async function getAuditLogsForGem(
  gemId:   string,
  action?: string,
) {
  const qs = action ? `?action=${action}` : "";
  return request(`/audit/gem/${gemId}${qs}`);
}

/**
 * GET /api/audit/action/:action
 * Returns all audit log entries for a specific action type.
 *
 * Valid action types:
 *   STAGE_ADDED, STAGE_UPDATED, STAGE_DELETED,
 *   GEM_REGISTERED, GEM_DELETED,
 *   CERTIFICATE_ADDED, EXPORT_ADDED, NOTE_ADDED
 */
export async function getAuditLogsByAction(action: string) {
  return request(`/audit/action/${action}`);
}

// =============================================================
// PRICE ESTIMATOR — Feature 2
// Market value estimation based on linked list journey data.
// Uses gem type, weight, origin, and stage count multipliers.
// =============================================================

/**
 * GET /api/estimate/:gemId
 * Returns a full price estimation for a specific gem.
 *
 * Response includes:
 *   estimatedLow, estimatedMid, estimatedHigh,
 *   pricingStatus (UNDERPRICED / FAIRLY_PRICED / OVERPRICED),
 *   deviationPercent, deviationLabel,
 *   calculationBreakdown[], priceHistory[],
 *   recommendation, weightMultiplier, originMultiplier,
 *   stageMultiplier, basePrice, priceGrowthRate
 */
export async function getEstimateForGem(gemId: string) {
  return request(`/estimate/${gemId}`);
}

/**
 * GET /api/estimate/:gemId/summary
 * Returns a brief price estimation summary for a specific gem.
 * Lighter than the full estimation — key fields only.
 * Used on the dashboard and track page pricing indicator.
 */
export async function getEstimateSummaryForGem(gemId: string) {
  return request(`/estimate/${gemId}/summary`);
}

/**
 * GET /api/estimate/all
 * Returns brief price estimation summaries for all gems.
 * Supports optional filtering:
 *   ?status=UNDERPRICED   — filter by pricing status
 *   ?status=OVERPRICED
 *   ?status=FAIRLY_PRICED
 *
 * Response includes:
 *   estimates[], totalGems, underpricedCount,
 *   overpricedCount, fairlyPricedCount
 */
export async function getAllEstimates(status?: string) {
  const qs = status ? `?status=${status}` : "";
  return request(`/estimate/all${qs}`);
}

/**
 * GET /api/estimate/overview
 * Returns portfolio-level market overview statistics.
 *
 * Response includes:
 *   totalGems, totalEstimatedValue, totalActualValue,
 *   underpricedCount, overpricedCount, fairlyPricedCount,
 *   averageDeviation, portfolioDifference, gems[]
 */
export async function getMarketOverview() {
  return request("/estimate/overview");
}

/**
 * GET /api/estimate/compare?gem1=BS-123&gem2=RB-456
 * Returns and compares price estimates for two gems side by side.
 * Similar to compareGems but focused on estimation data.
 *
 * Response includes:
 *   gem1Id, gem2Id, gem1Wins, gem2Wins,
 *   overallWinner, comparisonRows[], estimate1, estimate2
 */
export async function compareEstimates(gemId1: string, gemId2: string) {
  return request(`/estimate/compare?gem1=${gemId1}&gem2=${gemId2}`);
}

// =============================================================
// JOURNEY MAP — Feature 3
// GPS coordinate map data built from Doubly Linked List traversal.
// Each node becomes a map pin with coordinates and route line.
// =============================================================

/**
 * GET /api/map/:gemId
 * Returns the complete map data for a gem journey.
 * Traverses the Doubly Linked List head → tail and converts
 * each node into a GPS-coordinate map pin.
 *
 * Response includes:
 *   gemId, gemType, isCeylonVerified, totalStages,
 *   pins[], routeCoordinates[], totalDistance,
 *   domesticStages, internationalStages,
 *   originPin, currentPin, mapBounds, mapCenter,
 *   reverseRoute[], routeStats
 */
export async function getJourneyMapData(gemId: string) {
  return request(`/map/${gemId}`);
}

/**
 * GET /api/map/:gemId/pins
 * Returns only the map pin list for a gem journey.
 * Lighter than full map data — pins only, no route or bounds.
 *
 * Each pin includes:
 *   stageNumber, stageType, stageLabel, location, personName,
 *   date, weightInCarats, priceInRupees, lat, lng,
 *   isHead, isTail, isCurrent, isInternational,
 *   pinColor, pinIcon, popupContent
 */
export async function getJourneyPins(gemId: string) {
  return request(`/map/${gemId}/pins`);
}

/**
 * GET /api/map/:gemId/route
 * Returns only the route coordinate list for a gem journey.
 * Each coordinate is a [latitude, longitude] pair.
 * Also returns reverseRoute for backward traversal demonstration.
 *
 * Response includes:
 *   routeCoordinates[], reverseRoute[],
 *   mapBounds, mapCenter, totalDistance,
 *   domesticStages, internationalStages
 */
export async function getJourneyRoute(gemId: string) {
  return request(`/map/${gemId}/route`);
}

/**
 * GET /api/map/:gemId/stats
 * Returns route statistics for a gem journey.
 * Used on the map page right panel stats summary.
 *
 * Response includes:
 *   totalDistanceKm, domesticStages, internationalStages,
 *   totalStages, uniqueLocations, journeyDays,
 *   totalPriceAppreciation, appreciationPercent,
 *   originPin, currentPin
 */
export async function getJourneyStats(gemId: string) {
  return request(`/map/${gemId}/stats`);
}

/**
 * GET /api/map/overview
 * Returns a simplified overview map showing the origin pin
 * for every gem in the system on a single map.
 * Supports optional filtering:
 *   ?verified=true  — show only Ceylon verified gems
 *   ?verified=false — show only unverified gems
 *
 * Response includes:
 *   pins[], totalGems, verifiedCount, unverifiedCount,
 *   mapCenter, defaultZoom
 */
export async function getAllGemsMapOverview(verified?: boolean) {
  const qs = verified !== undefined ? `?verified=${verified}` : "";
  return request(`/map/overview${qs}`);
}

/**
 * GET /api/map/locations
 * Returns the list of all known Sri Lankan gem mining and trading
 * locations with their GPS coordinates.
 * Used to populate a reference layer on the map.
 *
 * Response includes:
 *   locations[], totalLocations, mapCenter
 */
export async function getKnownMapLocations() {
  return request("/map/locations");
}