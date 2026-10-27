import React, { useState } from "react";
import {
  ExternalLink,
  Plus,
  Users,
  MoreVertical,
  Edit2,
  Trash2,
  CheckCircle,
  Clock,
  XCircle,
  Flame,
  Zap,
  Moon,
  ChevronDown,
  MessageSquare,
  FileText,
  Download,
  FileCheck
} from "lucide-react";
import { getCompanyColor, getCompanyInitials, PRIORITIES, APPLIED_STATUSES, STAGES } from "../constants";
import { formatBytes } from "../utils/resumeStorage";

export function CompanyTable({
  companies,
  onEditCompany,
  onDeleteCompany,
  onManagePOCs,
  onCyclePriority,
  onToggleApplied,
  onUpdateStatus,
  onOpenAddModal,
  onDownloadResume,
}) {
  if (companies.length === 0) {
    return (
      <div className="text-center py-16 px-4 bg-slate-900/40 rounded-2xl border border-slate-800/80">
        <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-slate-800/80 flex items-center justify-center text-slate-400">
          <FileText className="w-7 h-7" />
        </div>
        <h3 className="text-base font-bold text-slate-200">No applications match your filter</h3>
        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
          Try clearing your search query or changing filter settings to see your tracked companies.
        </p>
        <button
          onClick={onOpenAddModal}
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Company</span>
        </button>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl backdrop-blur-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800/90 bg-slate-950/70 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <th className="py-3.5 pl-5 pr-3">Company & Role</th>
              <th className="py-3.5 px-3">Date</th>
              <th className="py-3.5 px-3">Priority</th>
              <th className="py-3.5 px-3">Applied</th>
              <th className="py-3.5 px-3">Status / Stage</th>
              <th className="py-3.5 px-3">OA</th>
              <th className="py-3.5 px-3">Interview</th>
              <th className="py-3.5 px-3 bg-indigo-950/20 text-indigo-300 border-x border-indigo-900/20">
                <div className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-indigo-400" />
                  <span>POCs</span>
                </div>
              </th>
              {/* Tailored Resume Column */}
              <th className="py-3.5 px-3 bg-emerald-950/20 text-emerald-300 border-r border-emerald-900/20">
                <div className="flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Tailored Resume</span>
                </div>
              </th>
              <th className="py-3.5 px-3">Outreach</th>
              <th className="py-3.5 px-3">Notes & Link</th>
              <th className="py-3.5 pr-5 pl-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-xs">
            {companies.map((c) => {
              const pocCount = c.pocs?.length || 0;
              const initials = getCompanyInitials(c.company);
              const colorGradient = getCompanyColor(c.company);

              // Priority visual
              const priorityObj = PRIORITIES.find((p) => p.value === c.priority) || PRIORITIES[0];
              // Applied visual
              const appliedObj = APPLIED_STATUSES.find((a) => a.value === c.applied) || APPLIED_STATUSES[0];

              const hasResume = Boolean(c.resumeMeta || c.resumeLink);

              return (
                <tr
                  key={c.id}
                  className="hover:bg-slate-800/40 transition-colors group"
                >
                  {/* Company & Role */}
                  <td className="py-3.5 pl-5 pr-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl bg-gradient-to-br ${colorGradient} flex items-center justify-center font-black text-white text-xs shadow-md shrink-0 ring-1 ring-white/10`}
                      >
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-100 text-[13px] tracking-tight group-hover:text-indigo-300 transition-colors truncate">
                            {c.company}
                          </span>
                          {c.links && (
                            <a
                              href={c.links}
                              target="_blank"
                              rel="noreferrer"
                              title="Open career / job portal"
                              className="text-slate-500 hover:text-indigo-400 p-0.5 rounded transition"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 font-medium truncate max-w-[180px]">
                          {c.role || "Software Role"}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Date */}
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <span className="px-2 py-1 rounded-md bg-slate-800/70 text-slate-300 font-mono text-[11px] border border-slate-700/50">
                      {c.date || "—"}
                    </span>
                  </td>

                  {/* Priority (Clickable to cycle!) */}
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <button
                      onClick={() => onCyclePriority(c.id)}
                      title="Click to cycle priority (High -> Med -> Low)"
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold transition hover:scale-105 active:scale-95 ${priorityObj.badgeClass}`}
                    >
                      <span>{priorityObj.icon}</span>
                      <span className="capitalize">{priorityObj.value}</span>
                    </button>
                  </td>

                  {/* Applied Toggle */}
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <button
                      onClick={() => onToggleApplied(c.id)}
                      title="Click to toggle Applied / To Apply / Closed"
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium transition hover:brightness-110 active:scale-95 ${appliedObj.badgeClass}`}
                    >
                      <span>{appliedObj.icon}</span>
                      <span>{appliedObj.label}</span>
                    </button>
                  </td>

                  {/* Status / Stage with inline dropdown */}
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <div className="relative inline-block">
                      <select
                        value={c.status || "Applied"}
                        onChange={(e) => onUpdateStatus(c.id, e.target.value)}
                        className={`text-xs font-semibold py-1 pl-2.5 pr-6 rounded-lg border appearance-none cursor-pointer focus:outline-none transition ${
                          c.status?.toLowerCase().includes("interview") || c.status?.toLowerCase().includes("shortlisted")
                            ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                            : c.status?.toLowerCase().includes("oa")
                            ? "bg-amber-500/10 text-amber-300 border-amber-500/30"
                            : c.status?.toLowerCase().includes("referral")
                            ? "bg-purple-500/10 text-purple-300 border-purple-500/30"
                            : c.status?.toLowerCase().includes("closed")
                            ? "bg-rose-500/10 text-rose-300 border-rose-500/30"
                            : "bg-slate-800/80 text-slate-300 border-slate-700/60"
                        }`}
                      >
                        {STAGES.map((s) => (
                          <option key={s} value={s} className="bg-slate-900 text-slate-200">
                            {s}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-3 h-3 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
                    </div>
                  </td>

                  {/* OA status */}
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    {c.oa ? (
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border ${
                          c.oa.includes("✅") || c.oa.toLowerCase().includes("completed") || c.oa.toLowerCase().includes("given")
                            ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                            : c.oa.toLowerCase().includes("pending")
                            ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
                            : "bg-slate-800 text-slate-400 border-slate-700"
                        }`}
                      >
                        {c.oa}
                      </span>
                    ) : (
                      <span className="text-slate-600">—</span>
                    )}
                  </td>

                  {/* Interview */}
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    {c.interview && c.interview !== "-" ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                        {c.interview}
                      </span>
                    ) : (
                      <span className="text-slate-600">—</span>
                    )}
                  </td>

                  {/* POCs (Points of Contact) */}
                  <td className="py-3.5 px-3 whitespace-nowrap bg-indigo-950/10 border-x border-indigo-900/20">
                    {pocCount > 0 ? (
                      <button
                        onClick={() => onManagePOCs(c)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-500/30 text-xs font-medium transition group/poc"
                      >
                        <Users className="w-3.5 h-3.5 text-indigo-400 group-hover/poc:scale-110 transition-transform" />
                        <span className="font-semibold">{c.pocs[0].name}</span>
                        {pocCount > 1 && (
                          <span className="px-1.5 py-0.2 rounded-full bg-indigo-500/30 text-[10px] text-indigo-200">
                            +{pocCount - 1}
                          </span>
                        )}
                      </button>
                    ) : (
                      <button
                        onClick={() => onManagePOCs(c)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-dashed border-slate-700 hover:border-indigo-500/60 text-slate-400 hover:text-indigo-300 text-[11px] transition"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add POC</span>
                      </button>
                    )}
                  </td>

                  {/* Tailored Resume Column */}
                  <td className="py-3.5 px-3 whitespace-nowrap bg-emerald-950/10 border-r border-emerald-900/20">
                    {c.resumeMeta ? (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => onDownloadResume(c.id, c.resumeMeta.fileName)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-xs font-medium transition hover:scale-105 active:scale-95 group/res"
                          title={`Click to download: ${c.resumeMeta.fileName} (${formatBytes(c.resumeMeta.fileSize)})`}
                        >
                          <Download className="w-3.5 h-3.5 text-emerald-400 group-hover/res:translate-y-0.5 transition-transform" />
                          <span className="truncate max-w-[100px] font-medium">
                            {c.resumeMeta.fileName}
                          </span>
                        </button>
                        {c.resumeLink && (
                          <a
                            href={c.resumeLink}
                            target="_blank"
                            rel="noreferrer"
                            title="Open Cloud Resume Link"
                            className="p-1 text-slate-400 hover:text-emerald-400"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    ) : c.resumeLink ? (
                      <a
                        href={c.resumeLink}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/15 hover:bg-blue-500/25 text-blue-300 border border-blue-500/30 text-xs font-medium"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Cloud Doc</span>
                      </a>
                    ) : (
                      <button
                        onClick={() => onEditCompany(c)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-dashed border-slate-700 hover:border-emerald-500/60 text-slate-500 hover:text-emerald-300 text-[11px] transition"
                        title="Attach tailored resume for this company"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Attach</span>
                      </button>
                    )}
                  </td>

                  {/* Outreach: Contacted & Replies */}
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 font-mono text-[11px]">
                      <span
                        className={`px-1.5 py-0.5 rounded ${
                          c.contacted > 0 ? "bg-slate-800 text-slate-200 font-semibold" : "text-slate-500"
                        }`}
                        title="People Contacted"
                      >
                        {c.contacted || 0} reached
                      </span>
                      <span className="text-slate-600">·</span>
                      <span
                        className={`px-1.5 py-0.5 rounded ${
                          c.replies > 0
                            ? "bg-emerald-500/15 text-emerald-300 font-bold border border-emerald-500/30"
                            : "text-slate-500"
                        }`}
                        title="Replies Received"
                      >
                        {c.replies || 0} reply
                      </span>
                    </div>
                  </td>

                  {/* Notes & Link */}
                  <td className="py-3.5 px-3 max-w-[180px]">
                    <div className="flex items-center gap-2">
                      {c.notes ? (
                        <span
                          className="text-slate-300 text-xs truncate max-w-[150px] block"
                          title={c.notes}
                        >
                          {c.notes}
                        </span>
                      ) : (
                        <span className="text-slate-600 text-xs">—</span>
                      )}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 pr-5 pl-2 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onManagePOCs(c)}
                        title="Manage POCs"
                        className="p-1.5 text-slate-400 hover:text-indigo-300 hover:bg-slate-800 rounded-lg transition"
                      >
                        <Users className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onEditCompany(c)}
                        title="Edit Company Details & Resume"
                        className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Remove ${c.company} from tracker?`)) {
                            onDeleteCompany(c.id);
                          }
                        }}
                        title="Delete Company"
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
