export const PRIORITIES = [
  { value: "high", label: "High Priority", icon: "🔥", badgeClass: "bg-red-500/15 text-red-400 border-red-500/30" },
  { value: "medium", label: "Medium", icon: "⚡", badgeClass: "bg-amber-500/15 text-amber-300 border-amber-500/30" },
  { value: "low", label: "Low Priority", icon: "💤", badgeClass: "bg-slate-500/15 text-slate-400 border-slate-600/30" },
];

export const APPLIED_STATUSES = [
  { value: "applied", label: "Applied", icon: "✅", badgeClass: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
  { value: "to_apply", label: "To Apply", icon: "⏳", badgeClass: "bg-blue-500/15 text-blue-400 border-blue-500/30" },
  { value: "closed", label: "Closed / Missed", icon: "❌", badgeClass: "bg-rose-500/15 text-rose-400 border-rose-500/30" },
];

export const STAGES = [
  "To Apply",
  "Applied",
  "Applied (Direct)",
  "Applied (Referral)",
  "Resume Shared",
  "Waiting",
  "Shortlisted",
  "OA Pending",
  "OA Completed",
  "Interview Scheduled",
  "Round 2 Completed",
  "AI interview - 2nd round",
  "Offer Received",
  "Opening closed",
  "Rejected",
];

export const OA_STATUSES = [
  { value: "", label: "No OA", badgeClass: "text-slate-500" },
  { value: "Pending", label: "Pending", badgeClass: "bg-amber-500/15 text-amber-300 border-amber-500/30" },
  { value: "✅ Completed", label: "Completed", badgeClass: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
  { value: "Not Required", label: "Not Required", badgeClass: "bg-slate-700/20 text-slate-400 border-slate-600/20" },
];

export const POC_STATUSES = [
  { value: "To Contact", label: "To Reach Out", color: "bg-slate-700 text-slate-300" },
  { value: "Contacted", label: "Contacted", color: "bg-blue-500/20 text-blue-300 border border-blue-500/30" },
  { value: "Replied", label: "Replied", color: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" },
  { value: "Referral Requested", label: "Referral Requested", color: "bg-amber-500/20 text-amber-300 border border-amber-500/30" },
  { value: "Referral Given", label: "Referral Submitted", color: "bg-purple-500/20 text-purple-300 border border-purple-500/30" },
  { value: "Meeting Scheduled", label: "Call / Meeting", color: "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30" },
];

const COMPANY_COLORS = [
  "from-blue-600 to-indigo-600",
  "from-emerald-600 to-teal-600",
  "from-violet-600 to-purple-600",
  "from-amber-600 to-orange-600",
  "from-rose-600 to-pink-600",
  "from-cyan-600 to-blue-600",
  "from-fuchsia-600 to-rose-600",
];

export function getCompanyColor(name = "") {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % COMPANY_COLORS.length;
  return COMPANY_COLORS[index];
}

export function getCompanyInitials(name = "") {
  if (!name) return "CO";
  const words = name.trim().split(/\s+/);
  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase();
  }
  return (words[0][0] + words[1][0]).toUpperCase();
}
