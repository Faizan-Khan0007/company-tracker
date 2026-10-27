import React from "react";
import { Filter, ArrowUpDown, X, Sparkles } from "lucide-react";
import { STAGES } from "../constants";

export function FilterBar({
  activeFilterChip,
  setActiveFilterChip,
  selectedStage,
  setSelectedStage,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
  totalResults,
  totalItems,
  onResetFilters,
}) {
  const chips = [
    { id: "all", label: "All" },
    { id: "high_priority", label: "🔥 High Priority" },
    { id: "active", label: "🎯 Active Pipeline" },
    { id: "applied", label: "✅ Applied" },
    { id: "to_apply", label: "⏳ To Apply" },
    { id: "has_pocs", label: "👥 Has POCs" },
    { id: "has_resume", label: "📄 Has Resume" },
    { id: "closed", label: "❌ Closed" },
  ];

  const hasActiveFilters =
    activeFilterChip !== "all" || selectedStage !== "all" || sortBy !== "date" || sortOrder !== "desc";

  return (
    <div className="space-y-3 mb-5">
      {/* Top row: filter chips + sort controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Quick Filter Chips */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {chips.map((chip) => {
            const isActive = activeFilterChip === chip.id;
            return (
              <button
                key={chip.id}
                onClick={() => setActiveFilterChip(chip.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25 ring-1 ring-indigo-400/40"
                    : "bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800"
                }`}
              >
                {chip.label}
              </button>
            );
          })}
        </div>

        {/* Right side: Dropdown filter & Sort */}
        <div className="flex items-center gap-2">
          {/* Stage Dropdown Filter */}
          <div className="relative">
            <select
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value)}
              className="appearance-none pl-3 pr-8 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-medium text-slate-300 hover:border-slate-700 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">Stage: All Stages</option>
              {STAGES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Control */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none pl-3 pr-6 py-1.5 bg-transparent text-xs font-medium text-slate-300 focus:outline-none"
            >
              <option value="date">Sort: Date</option>
              <option value="priority">Sort: Priority</option>
              <option value="company">Sort: Company (A-Z)</option>
              <option value="contacted">Sort: Most Contacted</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              title={`Toggle sort order (Current: ${sortOrder === "asc" ? "Ascending" : "Descending"})`}
              className="px-2 py-1.5 text-slate-400 hover:text-white border-l border-slate-800 hover:bg-slate-800 transition"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Reset Filters */}
          {hasActiveFilters && (
            <button
              onClick={onResetFilters}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl border border-rose-500/20 transition"
              title="Reset all filters"
            >
              <X className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Showing counter */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <span>
          Showing <span className="text-white font-semibold">{totalResults}</span> of{" "}
          <span className="text-slate-300">{totalItems}</span> companies
        </span>
        <span className="text-[11px] text-slate-500">
          Tip: Click priority 🔥 to cycle status, or click POCs to add recruiter details
        </span>
      </div>
    </div>
  );
}
