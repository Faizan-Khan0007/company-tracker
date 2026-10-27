import React from "react";
import { Users, ExternalLink, ArrowRight, CheckCircle2, Flame, Plus, FileText, Download } from "lucide-react";
import { getCompanyColor, getCompanyInitials, PRIORITIES } from "../constants";

export function PipelineView({
  companies,
  onEditCompany,
  onManagePOCs,
  onUpdateStatus,
  onOpenAddModal,
  onDownloadResume,
}) {
  const columns = [
    {
      id: "to_apply",
      title: "To Apply",
      subtitle: "Wishlist & Target openings",
      badgeClass: "bg-blue-500/20 text-blue-300 border-blue-500/30",
      filterFn: (c) => c.applied === "to_apply" || c.status === "To Apply",
      nextStatus: "Applied",
      nextLabel: "Mark Applied",
    },
    {
      id: "applied_waiting",
      title: "Applied & Waiting",
      subtitle: "Resume submitted / Referral requested",
      badgeClass: "bg-slate-700/40 text-slate-300 border-slate-600/40",
      filterFn: (c) =>
        c.applied === "applied" &&
        !c.status?.toLowerCase().includes("oa") &&
        !c.status?.toLowerCase().includes("interview") &&
        !c.status?.toLowerCase().includes("shortlisted") &&
        !c.status?.toLowerCase().includes("closed"),
      nextStatus: "OA Pending",
      nextLabel: "Move to OA",
    },
    {
      id: "oa_stage",
      title: "OA Stage",
      subtitle: "Assessments in progress or completed",
      badgeClass: "bg-amber-500/20 text-amber-300 border-amber-500/30",
      filterFn: (c) =>
        (c.oa && c.oa !== "-" && c.oa !== "Not Required") ||
        c.status?.toLowerCase().includes("oa") ||
        c.status?.toLowerCase().includes("shortlisted"),
      nextStatus: "Interview Scheduled",
      nextLabel: "Move to Interview",
    },
    {
      id: "interviews",
      title: "Interviewing",
      subtitle: "Active rounds & HR discussions",
      badgeClass: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
      filterFn: (c) =>
        c.interview &&
        c.interview !== "-" &&
        c.status?.toLowerCase().includes("interview"),
      nextStatus: "Offer Received",
      nextLabel: "Mark Offer",
    },
    {
      id: "closed",
      title: "Closed / Archived",
      subtitle: "Expired openings & inactive",
      badgeClass: "bg-rose-500/20 text-rose-300 border-rose-500/30",
      filterFn: (c) => c.applied === "closed" || c.status?.toLowerCase().includes("closed"),
      nextStatus: null,
      nextLabel: null,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 items-start">
        {columns.map((col) => {
          const colCompanies = companies.filter(col.filterFn);
          return (
            <div
              key={col.id}
              className="bg-slate-900/50 border border-slate-800/80 rounded-2xl flex flex-col max-h-[82vh] overflow-hidden shadow-md"
            >
              {/* Column Header */}
              <div className="p-3.5 border-b border-slate-800 bg-slate-950/60">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-slate-200">
                    {col.title}
                  </h3>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${col.badgeClass}`}
                  >
                    {colCompanies.length}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 truncate">{col.subtitle}</p>
              </div>

              {/* Cards Container */}
              <div className="p-2.5 overflow-y-auto space-y-2.5 flex-1 min-h-[160px]">
                {colCompanies.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-500 border border-dashed border-slate-800/80 rounded-xl">
                    No applications here
                  </div>
                ) : (
                  colCompanies.map((c) => {
                    const initials = getCompanyInitials(c.company);
                    const colorGradient = getCompanyColor(c.company);
                    const priorityObj = PRIORITIES.find((p) => p.value === c.priority) || PRIORITIES[0];
                    const pocCount = c.pocs?.length || 0;

                    return (
                      <div
                        key={c.id}
                        className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition shadow-sm space-y-2.5 group"
                      >
                        {/* Top: Avatar, Name, Role */}
                        <div className="flex items-start gap-2.5">
                          <div
                            className={`w-7 h-7 rounded-lg bg-gradient-to-br ${colorGradient} flex items-center justify-center font-bold text-white text-[10px] shrink-0 mt-0.5 shadow-sm`}
                          >
                            {initials}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between">
                              <h4
                                onClick={() => onEditCompany(c)}
                                className="font-bold text-xs text-slate-100 hover:text-indigo-300 cursor-pointer truncate transition"
                              >
                                {c.company}
                              </h4>
                              {c.links && (
                                <a
                                  href={c.links}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-slate-500 hover:text-indigo-400 p-0.5"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-400 truncate">{c.role}</p>
                          </div>
                        </div>

                        {/* Badges: Priority + Date */}
                        <div className="flex items-center gap-1.5 flex-wrap text-[10px]">
                          <span
                            className={`px-1.5 py-0.5 rounded border font-semibold ${priorityObj.badgeClass}`}
                          >
                            {priorityObj.icon} {priorityObj.value}
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 font-mono border border-slate-800">
                            {c.date}
                          </span>
                          {c.status && (
                            <span className="px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 truncate max-w-[120px]">
                              {c.status}
                            </span>
                          )}
                        </div>

                        {/* Tailored Resume badge if present */}
                        {c.resumeMeta && (
                          <div className="flex items-center justify-between px-2 py-1 rounded bg-emerald-950/30 border border-emerald-900/30 text-[10px] text-emerald-300">
                            <div className="flex items-center gap-1 truncate max-w-[130px]">
                              <FileText className="w-3 h-3 text-emerald-400 shrink-0" />
                              <span className="truncate">{c.resumeMeta.fileName}</span>
                            </div>
                            <button
                              onClick={() => onDownloadResume(c.id, c.resumeMeta.fileName)}
                              className="text-emerald-400 hover:text-white p-0.5"
                              title="Download resume"
                            >
                              <Download className="w-3 h-3" />
                            </button>
                          </div>
                        )}

                        {/* Special highlight for Interview or OA */}
                        {(c.interview || c.oa) && (
                          <div className="text-[11px] text-cyan-300 font-medium bg-cyan-950/30 px-2 py-1 rounded-md border border-cyan-800/40 truncate">
                            {c.interview || `OA: ${c.oa}`}
                          </div>
                        )}

                        {/* POC tag */}
                        <div className="flex items-center justify-between pt-1 border-t border-slate-900 text-[11px]">
                          {pocCount > 0 ? (
                            <button
                              onClick={() => onManagePOCs(c)}
                              className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 transition"
                            >
                              <Users className="w-3 h-3" />
                              <span className="font-medium">{c.pocs[0].name}</span>
                              {pocCount > 1 && (
                                <span className="text-[9px] px-1 bg-indigo-500/20 rounded-full">
                                  +{pocCount - 1}
                                </span>
                              )}
                            </button>
                          ) : (
                            <button
                              onClick={() => onManagePOCs(c)}
                              className="text-slate-500 hover:text-slate-400 text-[10px]"
                            >
                              + Add POC
                            </button>
                          )}

                          {/* Quick move arrow if next stage exists */}
                          {col.nextStatus && (
                            <button
                              onClick={() => onUpdateStatus(c.id, col.nextStatus)}
                              className="flex items-center gap-1 text-slate-400 hover:text-white px-1.5 py-0.5 rounded hover:bg-slate-800 transition text-[10px]"
                              title={col.nextLabel}
                            >
                              <span>Next</span>
                              <ArrowRight className="w-2.5 h-2.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
