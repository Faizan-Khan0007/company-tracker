import React, { useState } from "react";
import {
  Layers,
  Kanban,
  Users2,
  Plus,
  Download,
  RotateCcw,
  Sparkles,
  Search,
  ExternalLink,
  ChevronDown,
  Cloud,
} from "lucide-react";

export function Navbar({
  currentView,
  setCurrentView,
  onOpenAddModal,
  onExportCSV,
  onExportJSON,
  onResetData,
  totalCount,
  activeCount,
  searchQuery,
  setSearchQuery,
  isCloudActive,
  onOpenCloudSync,
}) {
  const [showDataMenu, setShowDataMenu] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 ring-1 ring-white/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                  Company Tracker
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  Pro
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                {totalCount} companies tracked · {activeCount} active pipeline
              </p>
            </div>
          </div>

          {/* Center: Search Bar */}
          <div className="flex-1 max-w-md hidden md:block">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search company, role, POC, or notes... (Press '/' to focus)"
                className="w-full pl-10 pr-4 py-2 bg-slate-900/80 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-200"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Right Action buttons */}
          <div className="flex items-center gap-2">
            {/* View Switcher on Desktop */}
            <nav className="flex items-center p-1 bg-slate-900/90 border border-slate-800/80 rounded-xl">
              <button
                onClick={() => setCurrentView("table")}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  currentView === "table"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Table</span>
              </button>
              <button
                onClick={() => setCurrentView("pipeline")}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  currentView === "pipeline"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                }`}
              >
                <Kanban className="w-3.5 h-3.5" />
                <span>Pipeline</span>
              </button>
              <button
                onClick={() => setCurrentView("pocs")}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  currentView === "pocs"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                }`}
              >
                <Users2 className="w-3.5 h-3.5" />
                <span>POC Directory</span>
              </button>
            </nav>

            {/* Cloud Sync Button */}
            <button
              onClick={onOpenCloudSync}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                isCloudActive
                  ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20"
                  : "bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700"
              }`}
              title={isCloudActive ? "Cloud Sync Active (Supabase)" : "Connect Cloud Sync for multi-device sync"}
            >
              <Cloud className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isCloudActive ? "Cloud Synced" : "Cloud Sync"}</span>
              <span className={`w-2 h-2 rounded-full ${isCloudActive ? "bg-emerald-400" : "bg-amber-400 animate-pulse"}`} />
            </button>

            {/* Data Menu Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowDataMenu(!showDataMenu)}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 transition"
                title="Data & Backups"
              >
                <Download className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden lg:inline">Data</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {showDataMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowDataMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 py-1.5 bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
                    <button
                      onClick={() => {
                        setShowDataMenu(false);
                        onExportCSV();
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs text-slate-200 hover:bg-slate-800 flex items-center gap-2"
                    >
                      <Download className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Export to CSV</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowDataMenu(false);
                        onExportJSON();
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs text-slate-200 hover:bg-slate-800 flex items-center gap-2"
                    >
                      <Download className="w-3.5 h-3.5 text-purple-400" />
                      <span>Export Backup (JSON)</span>
                    </button>
                    <div className="border-t border-slate-800 my-1" />
                    <button
                      onClick={() => {
                        setShowDataMenu(false);
                        if (confirm("Reset tracker to the original 30 companies? Any custom edits will be replaced.")) {
                          onResetData();
                        }
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs text-rose-300 hover:bg-rose-950/40 flex items-center gap-2"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
                      <span>Reset to Original Data</span>
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Add Company Button */}
            <button
              onClick={onOpenAddModal}
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-violet-600 text-white font-semibold text-xs shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:brightness-110 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden sm:inline">Add Company</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>
        </div>

        {/* Mobile Search Input */}
        <div className="py-2.5 md:hidden border-t border-slate-800/60">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search companies, roles, POCs..."
              className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
