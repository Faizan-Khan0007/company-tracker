const MONTH_MAP = {
  jan: 0,
  feb: 1,
  mar: 2,
  apr: 3,
  may: 4,
  jun: 5,
  jul: 6,
  aug: 7,
  sep: 8,
  sept: 8,
  oct: 9,
  nov: 10,
  dec: 11,
};

export function parseCustomDate(dateStr) {
  if (!dateStr) return 0;
  
  // If ISO string
  if (dateStr.includes("-") || dateStr.includes("T")) {
    const parsed = Date.parse(dateStr);
    if (!isNaN(parsed)) return parsed;
  }

  // Parse strings like "23 Jul", "28 Jul", "17 Sept", "22 Oct"
  const parts = dateStr.trim().split(/\s+/);
  if (parts.length >= 2) {
    const day = parseInt(parts[0], 10);
    const monthKey = parts[1].toLowerCase().replace(/[^a-z]/g, "");
    const month = MONTH_MAP[monthKey];
    if (!isNaN(day) && month !== undefined) {
      // Use current year
      const year = new Date().getFullYear();
      return new Date(year, month, day).getTime();
    }
  }

  return 0;
}

export function sortCompaniesByDateDesc(a, b) {
  const dateA = parseCustomDate(a.date);
  const dateB = parseCustomDate(b.date);

  if (dateA !== dateB) {
    return dateB - dateA; // Newest date first
  }

  // Tie-breaker: creation timestamp or updated timestamp
  const timeA = new Date(a.createdAt || a.updated_at || 0).getTime();
  const timeB = new Date(b.createdAt || b.updated_at || 0).getTime();
  return timeB - timeA;
}
