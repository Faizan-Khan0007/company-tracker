import React, { useState } from "react";
import { Users, Mail, ExternalLink, Plus, Search, Building2, MessageSquare, Trash2 } from "lucide-react";
import { POC_STATUSES, getCompanyColor, getCompanyInitials } from "../constants";

export function POCDirectoryView({ companies, onManagePOCs, onAddCompany }) {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Flatten all POCs with their parent company details
  const allPocs = companies.flatMap((c) =>
    (c.pocs || []).map((poc) => ({
      ...poc,
      companyId: c.id,
      companyName: c.company,
      companyRole: c.role,
    }))
  );

  const filteredPocs = allPocs.filter((poc) => {
    const matchesSearch =
      poc.name?.toLowerCase().includes(search.toLowerCase()) ||
      poc.role?.toLowerCase().includes(search.toLowerCase()) ||
      poc.companyName?.toLowerCase().includes(search.toLowerCase()) ||
      poc.notes?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = filterStatus === "all" || poc.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-5">
      {/* Top Bar for Directory */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-400" />
            <span>Master POC Directory</span>
            <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-mono border border-indigo-500/20">
              {allPocs.length} Total Contacts
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Recruiters, alumni, hiring managers, and referrals linked to target companies
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search POC or company..."
              className="pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Outreach Statuses</option>
            {POC_STATUSES.map((st) => (
              <option key={st.value} value={st.value}>
                {st.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Directory Grid */}
      {filteredPocs.length === 0 ? (
        <div className="text-center py-16 px-4 bg-slate-900/30 rounded-2xl border border-slate-800">
          <Users className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-300">No POCs match your filters</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            You can add POCs to any company from the main table view or inside the company edit modal.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPocs.map((poc) => {
            const statusObj = POC_STATUSES.find((s) => s.value === poc.status) || POC_STATUSES[0];
            const parentCompany = companies.find((c) => c.id === poc.companyId);

            return (
              <div
                key={poc.id}
                className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800/90 hover:border-slate-700 transition space-y-3 shadow-sm group"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-sm text-white group-hover:text-indigo-300 transition">
                      {poc.name}
                    </h3>
                    <p className="text-xs text-slate-400 font-medium">{poc.role || "Point of Contact"}</p>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold border ${statusObj.color}`}
                  >
                    {statusObj.label}
                  </span>
                </div>

                {/* Company association */}
                <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-950/60 border border-slate-800/60 text-xs">
                  <Building2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span className="font-bold text-slate-200">{poc.companyName}</span>
                  <span className="text-slate-500 truncate text-[11px]">· {poc.companyRole}</span>
                </div>

                {/* Notes */}
                {poc.notes && (
                  <p className="text-xs text-slate-300 bg-slate-950/40 p-2 rounded-lg border border-slate-800/40">
                    💡 {poc.notes}
                  </p>
                )}

                {/* Actions / Links */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-xs">
                  <div className="flex items-center gap-3">
                    {poc.linkedin && (
                      <a
                        href={poc.linkedin.startsWith("http") ? poc.linkedin : `https://${poc.linkedin}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>LinkedIn</span>
                      </a>
                    )}
                    {poc.email && (
                      <a
                        href={`mailto:${poc.email}`}
                        className="flex items-center gap-1 text-slate-400 hover:text-white"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        <span>Email</span>
                      </a>
                    )}
                  </div>

                  {parentCompany && (
                    <button
                      onClick={() => onManagePOCs(parentCompany)}
                      className="text-slate-400 hover:text-indigo-300 text-[11px] font-medium"
                    >
                      Manage Company POCs →
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
