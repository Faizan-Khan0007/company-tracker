import { INITIAL_COMPANIES } from "../data/initialCompanies";

const STORAGE_KEY = "careerpulse_company_tracker_v1";

export function loadCompanies() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      saveCompanies(INITIAL_COMPANIES);
      return INITIAL_COMPANIES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch (err) {
    console.error("Failed to load companies from localStorage:", err);
  }
  return INITIAL_COMPANIES;
}

export function saveCompanies(companies) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(companies));
  } catch (err) {
    console.error("Failed to save companies to localStorage:", err);
  }
}

export function resetToDefaultCompanies() {
  saveCompanies(INITIAL_COMPANIES);
  return INITIAL_COMPANIES;
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
