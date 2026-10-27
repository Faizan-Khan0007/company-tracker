import { INITIAL_COMPANIES } from "../data/initialCompanies";
import { sortCompaniesByDateDesc } from "./dateHelper";

const STORAGE_KEY = "careerpulse_company_tracker_v1";

/**
 * Merges a list of companies with the default initial 30 companies.
 * Ensures user modifications (like attached resumes) are preserved,
 * while NEVER wiping out the default companies.
 */
export function mergeCompaniesWithDefaults(list) {
  const map = new Map();

  // 1. Preload defaults
  for (const c of INITIAL_COMPANIES) {
    if (c && c.id) map.set(c.id, { ...c });
  }

  // 2. Overlay incoming list (custom user updates, new companies, attached resumes)
  if (Array.isArray(list)) {
    for (const c of list) {
      if (c && c.id) {
        const existing = map.get(c.id);
        map.set(c.id, { ...existing, ...c });
      }
    }
  }

  const merged = Array.from(map.values());
  // Sort descending by date so latest is on top
  return merged.sort(sortCompaniesByDateDesc);
}

export function loadCompanies() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const sorted = [...INITIAL_COMPANIES].sort(sortCompaniesByDateDesc);
      saveCompanies(sorted);
      return sorted;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Merge with defaults so no initial applications are accidentally lost!
      const merged = mergeCompaniesWithDefaults(parsed);
      saveCompanies(merged);
      return merged;
    }
  } catch (err) {
    console.error("Failed to load companies from localStorage:", err);
  }
  const fallback = [...INITIAL_COMPANIES].sort(sortCompaniesByDateDesc);
  saveCompanies(fallback);
  return fallback;
}

export function saveCompanies(companies) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(companies));
  } catch (err) {
    console.error("Failed to save companies to localStorage:", err);
  }
}

export function resetToDefaultCompanies() {
  const sorted = [...INITIAL_COMPANIES].sort(sortCompaniesByDateDesc);
  saveCompanies(sorted);
  return sorted;
}

export function exportToCSV(companies) {
  const headers = [
    "Date",
    "Company",
    "Role",
    "Priority",
    "Applied",
    "Total People Contacted",
    "Replies",
    "Status",
    "OA",
    "Interview",
    "Notes",
    "Links",
    "POCs",
  ];

  const escapeCSV = (str) => {
    if (str === null || str === undefined) return '""';
    const s = String(str).replace(/"/g, '""');
    return `"${s}"`;
  };

  const rows = companies.map((c) => {
    const priorityIcon = c.priority === "high" ? "🔥" : c.priority === "medium" ? "⚡" : "low";
    const appliedIcon = c.applied === "applied" ? "✅" : c.applied === "closed" ? "❌" : "⏳";
    const pocsSerialized = (c.pocs || [])
      .map((p) => `${p.name || ""}${p.role ? ` (${p.role})` : ""}${p.status ? ` [${p.status}]` : ""}`)
      .join("; ");

    return [
      escapeCSV(c.date || ""),
      escapeCSV(c.company || ""),
      escapeCSV(c.role || ""),
      escapeCSV(priorityIcon),
      escapeCSV(appliedIcon),
      escapeCSV(c.contacted ?? 0),
      escapeCSV(c.replies ?? 0),
      escapeCSV(c.status || ""),
      escapeCSV(c.oa || ""),
      escapeCSV(c.interview || ""),
      escapeCSV(c.notes || ""),
      escapeCSV(c.links || ""),
      escapeCSV(pocsSerialized),
    ].join(",");
  });

  const csvContent = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `job_tracker_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportToJSON(companies) {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(companies, null, 2));
  const link = document.createElement("a");
  link.setAttribute("href", dataStr);
  link.setAttribute("download", `job_tracker_backup_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
