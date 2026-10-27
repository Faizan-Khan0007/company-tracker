import React, { useState, useEffect, useMemo } from "react";
import { Navbar } from "./components/Navbar";
import { DashboardStats } from "./components/DashboardStats";
import { FilterBar } from "./components/FilterBar";
import { CompanyTable } from "./components/CompanyTable";
import { PipelineView } from "./components/PipelineView";
import { POCDirectoryView } from "./components/POCDirectoryView";
import { CompanyModal } from "./components/CompanyModal";
import { POCModal } from "./components/POCModal";
import { CloudSyncModal } from "./components/CloudSyncModal";
import { Toast } from "./components/Toast";
import {
  loadCompanies,
  saveCompanies,
  resetToDefaultCompanies,
  exportToCSV,
  exportToJSON,
} from "./utils/storage";
import {
  saveResumeFile,
  deleteResumeFile,
  downloadResume as downloadLocalResume,
} from "./utils/resumeStorage";
import {
  isCloudConfigured,
  fetchCompaniesFromCloud,
  upsertCompanyToCloud,
  deleteCompanyFromCloud,
  uploadResumeToCloud,
  downloadResumeFromCloud,
} from "./utils/supabaseClient";

export function App() {
  const [companies, setCompanies] = useState(() => loadCompanies());
  const [currentView, setCurrentView] = useState("table"); // 'table' | 'pipeline' | 'pocs'
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilterChip, setActiveFilterChip] = useState("all");
  const [selectedStage, setSelectedStage] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");

  // Modals state
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [managingPocCompany, setManagingPocCompany] = useState(null);
  const [isCloudModalOpen, setIsCloudModalOpen] = useState(false);

  // Cloud sync state
  const [isCloudActive, setIsCloudActive] = useState(() => isCloudConfigured());

  // Toast notifications
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  // Attempt to fetch fresh data from cloud on mount if configured
  useEffect(() => {
    if (isCloudConfigured()) {
      setIsCloudActive(true);
      fetchCompaniesFromCloud()
        .then((remoteData) => {
          if (remoteData && remoteData.length > 0) {
            setCompanies(remoteData);
            saveCompanies(remoteData);
          }
        })
        .catch((err) => {
          console.warn("Could not sync with cloud on startup:", err.message);
        });
    }
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA" || e.target.tagName === "SELECT") {
        return;
      }
      if (e.key === "n" || e.key === "N") {
        e.preventDefault();
        setEditingCompany(null);
        setIsCompanyModalOpen(true);
      }
      if (e.key === "/") {
        e.preventDefault();
        const searchInput = document.querySelector('input[type="text"]');
        if (searchInput) searchInput.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Update companies helper with persistence
  const updateCompaniesAndSave = (updatedList) => {
    setCompanies(updatedList);
    saveCompanies(updatedList);
  };

  // Handlers for company operations
  const handleSaveCompany = async (companyData, resumeAction) => {
    let finalCompany = { ...companyData };

    // Handle local resume storage
    if (resumeAction?.file) {
      try {
        await saveResumeFile(companyData.id, resumeAction.file);
      } catch (err) {
        console.error("Local resume save failed:", err);
      }

      // If cloud is configured, upload resume to Supabase Storage bucket
      if (isCloudConfigured()) {
        try {
          const cloudMeta = await uploadResumeToCloud(companyData.id, resumeAction.file);
          if (cloudMeta) {
            finalCompany.resumeMeta = cloudMeta;
          }
        } catch (err) {
          console.error("Cloud storage upload failed:", err);
        }
      }
    } else if (resumeAction?.removed) {
      await deleteResumeFile(companyData.id);
      finalCompany.resumeMeta = null;
    }

    // Save locally
    if (editingCompany) {
      const updated = companies.map((c) => (c.id === finalCompany.id ? finalCompany : c));
      updateCompaniesAndSave(updated);
      showToast(`Updated ${finalCompany.company}`);
    } else {
      const updated = [finalCompany, ...companies];
      updateCompaniesAndSave(updated);
      showToast(`Added ${finalCompany.company}!`);
    }

    // Upsert to cloud if configured
    if (isCloudConfigured()) {
      upsertCompanyToCloud(finalCompany).catch((err) => {
        console.error("Cloud upsert failed:", err);
      });
    }

    setEditingCompany(null);
  };

  const handleDeleteCompany = async (id) => {
    const deletedCompany = companies.find((c) => c.id === id);
    await deleteResumeFile(id);
    const updated = companies.filter((c) => c.id !== id);
    updateCompaniesAndSave(updated);

    if (isCloudConfigured()) {
      deleteCompanyFromCloud(id).catch((err) => {
        console.error("Cloud delete failed:", err);
      });
    }

    showToast(`Removed ${deletedCompany?.company || "company"}`, "info");
  };

  // Resume Download Handler (Cloud or Local)
  const handleDownloadResume = async (companyId, fallbackName) => {
    const targetComp = companies.find((c) => c.id === companyId);
    
    // Try cloud download first if cloud url is present
    if (targetComp?.resumeMeta?.publicUrl || targetComp?.resumeMeta?.filePath) {
      try {
        await downloadResumeFromCloud(targetComp.resumeMeta, fallbackName);
        showToast(`Downloaded ${targetComp.resumeMeta.fileName || fallbackName}`);
        return;
      } catch (cloudErr) {
        console.warn("Cloud download failed, trying local storage:", cloudErr);
      }
    }

    // Fallback to local IndexedDB
    try {
      const fileName = await downloadLocalResume(companyId, fallbackName);
      showToast(`Downloaded ${fileName}`);
    } catch (err) {
      showToast(err.message || "Could not download resume", "error");
    }
  };

  // 1-Click Cycle Priority (High -> Medium -> Low -> High)
  const handleCyclePriority = (id) => {
    const nextPriorityMap = { high: "medium", medium: "low", low: "high" };
    let changedComp = null;
    const updated = companies.map((c) => {
      if (c.id === id) {
        const next = nextPriorityMap[c.priority] || "high";
        changedComp = { ...c, priority: next };
        return changedComp;
      }
      return c;
    });
    updateCompaniesAndSave(updated);

    if (changedComp && isCloudConfigured()) {
      upsertCompanyToCloud(changedComp).catch(console.error);
    }
  };

  // 1-Click Toggle Applied (applied -> to_apply -> closed -> applied)
  const handleToggleApplied = (id) => {
    const nextAppliedMap = {
      applied: "to_apply",
      to_apply: "closed",
      closed: "applied",
    };
    let changedComp = null;
    const updated = companies.map((c) => {
      if (c.id === id) {
        const next = nextAppliedMap[c.applied] || "applied";
        changedComp = { ...c, applied: next };
        return changedComp;
      }
      return c;
    });
    updateCompaniesAndSave(updated);

    if (changedComp && isCloudConfigured()) {
      upsertCompanyToCloud(changedComp).catch(console.error);
    }
  };

  // Inline Stage / Status update
  const handleUpdateStatus = (id, newStatus) => {
    let changedComp = null;
    const updated = companies.map((c) => {
      if (c.id === id) {
        changedComp = { ...c, status: newStatus };
        return changedComp;
      }
      return c;
    });
    updateCompaniesAndSave(updated);
    showToast(`Updated status to "${newStatus}"`);

    if (changedComp && isCloudConfigured()) {
      upsertCompanyToCloud(changedComp).catch(console.error);
    }
  };

  // Save POCs for a company
  const handleSavePOCs = (companyId, newPocs) => {
    let changedComp = null;
    const updated = companies.map((c) => {
      if (c.id === companyId) {
        changedComp = { ...c, pocs: newPocs };
        return changedComp;
      }
      return c;
    });
    updateCompaniesAndSave(updated);
    if (managingPocCompany && managingPocCompany.id === companyId) {
      setManagingPocCompany({ ...managingPocCompany, pocs: newPocs });
    }
    showToast("Points of contact updated");

    if (changedComp && isCloudConfigured()) {
      upsertCompanyToCloud(changedComp).catch(console.error);
    }
  };

  // Cloud sync callback when data loaded from remote
  const handleCloudDataSynced = (remoteList) => {
    setCompanies(remoteList);
    saveCompanies(remoteList);
    setIsCloudActive(true);
    showToast("Synchronized with Cloud Database!");
  };

  // Export & Reset operations
  const handleExportCSV = () => {
    exportToCSV(companies);
    showToast("Exported companies to CSV");
  };

  const handleExportJSON = () => {
    exportToJSON(companies);
    showToast("Exported backup JSON");
  };

  const handleResetData = () => {
    const def = resetToDefaultCompanies();
    setCompanies(def);
    showToast("Reset to default 30 companies", "info");
  };

  // Filter & Search logic
  const filteredCompanies = useMemo(() => {
    return companies
      .filter((c) => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesCompany = c.company?.toLowerCase().includes(q);
          const matchesRole = c.role?.toLowerCase().includes(q);
          const matchesNotes = c.notes?.toLowerCase().includes(q);
          const matchesStatus = c.status?.toLowerCase().includes(q);
          const matchesResume = c.resumeMeta?.fileName?.toLowerCase().includes(q);
          const matchesPoc = (c.pocs || []).some(
            (p) =>
              p.name?.toLowerCase().includes(q) ||
              p.role?.toLowerCase().includes(q) ||
              p.notes?.toLowerCase().includes(q)
          );
          if (!matchesCompany && !matchesRole && !matchesNotes && !matchesStatus && !matchesPoc && !matchesResume) {
            return false;
          }
        }

        // Active chip filter
        if (activeFilterChip === "high_priority" && c.priority !== "high") return false;
        if (activeFilterChip === "applied" && c.applied !== "applied") return false;
        if (activeFilterChip === "to_apply" && c.applied !== "to_apply") return false;
        if (activeFilterChip === "closed" && c.applied !== "closed") return false;
        if (activeFilterChip === "has_pocs" && (!c.pocs || c.pocs.length === 0)) return false;
        if (activeFilterChip === "has_resume" && (!c.resumeMeta && !c.resumeLink)) return false;
        if (activeFilterChip === "active") {
          const isActive =
            (c.oa && c.oa !== "-" && c.oa !== "Not Required") ||
            (c.interview && c.interview !== "-") ||
            c.status?.toLowerCase().includes("interview") ||
            c.status?.toLowerCase().includes("shortlisted") ||
            c.status?.toLowerCase().includes("oa");
          if (!isActive) return false;
        }

        // Stage filter
        if (selectedStage !== "all" && c.status !== selectedStage) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        let comparison = 0;
        if (sortBy === "company") {
          comparison = (a.company || "").localeCompare(b.company || "");
        } else if (sortBy === "priority") {
          const priorityWeights = { high: 3, medium: 2, low: 1 };
          comparison = (priorityWeights[b.priority] || 0) - (priorityWeights[a.priority] || 0);
        } else if (sortBy === "contacted") {
          comparison = (Number(b.contacted) || 0) - (Number(a.contacted) || 0);
        } else {
          // Date sorting
          comparison = (b.date || "").localeCompare(a.date || "");
        }
        return sortOrder === "asc" ? comparison : -comparison;
      });
  }, [companies, searchQuery, activeFilterChip, selectedStage, sortBy, sortOrder]);

  // Active pipeline count
  const activeCount = companies.filter(
    (c) =>
      (c.oa && c.oa !== "-" && c.oa !== "Not Required") ||
      (c.interview && c.interview !== "-") ||
      c.status?.toLowerCase().includes("interview") ||
      c.status?.toLowerCase().includes("shortlisted")
  ).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        onOpenAddModal={() => {
          setEditingCompany(null);
          setIsCompanyModalOpen(true);
        }}
        onExportCSV={handleExportCSV}
        onExportJSON={handleExportJSON}
        onResetData={handleResetData}
        totalCount={companies.length}
        activeCount={activeCount}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isCloudActive={isCloudActive}
        onOpenCloudSync={() => setIsCloudModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* KPI Dashboard Stats Bar */}
        <DashboardStats
          companies={companies}
          onQuickFilter={(filterTag) => {
            setActiveFilterChip(filterTag);
            setCurrentView("table");
          }}
        />

        {/* View Routing */}
        {currentView === "table" && (
          <div>
            <FilterBar
              activeFilterChip={activeFilterChip}
              setActiveFilterChip={setActiveFilterChip}
              selectedStage={selectedStage}
              setSelectedStage={setSelectedStage}
              sortBy={sortBy}
              setSortBy={setSortBy}
              sortOrder={sortOrder}
              setSortOrder={setSortOrder}
              totalResults={filteredCompanies.length}
              totalItems={companies.length}
              onResetFilters={() => {
                setActiveFilterChip("all");
                setSelectedStage("all");
                setSearchQuery("");
                setSortBy("date");
                setSortOrder("desc");
              }}
            />

            <CompanyTable
              companies={filteredCompanies}
              onEditCompany={(company) => {
                setEditingCompany(company);
                setIsCompanyModalOpen(true);
              }}
              onDeleteCompany={handleDeleteCompany}
              onManagePOCs={(company) => setManagingPocCompany(company)}
              onCyclePriority={handleCyclePriority}
              onToggleApplied={handleToggleApplied}
              onUpdateStatus={handleUpdateStatus}
              onOpenAddModal={() => {
                setEditingCompany(null);
                setIsCompanyModalOpen(true);
              }}
              onDownloadResume={handleDownloadResume}
            />
          </div>
        )}

        {currentView === "pipeline" && (
          <PipelineView
            companies={companies}
            onEditCompany={(company) => {
              setEditingCompany(company);
              setIsCompanyModalOpen(true);
            }}
            onManagePOCs={(company) => setManagingPocCompany(company)}
            onUpdateStatus={handleUpdateStatus}
            onOpenAddModal={() => {
              setEditingCompany(null);
              setIsCompanyModalOpen(true);
            }}
            onDownloadResume={handleDownloadResume}
          />
        )}

        {currentView === "pocs" && (
          <POCDirectoryView
            companies={companies}
            onManagePOCs={(company) => setManagingPocCompany(company)}
            onAddCompany={() => {
              setEditingCompany(null);
              setIsCompanyModalOpen(true);
            }}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-500">
        <p>CareerPulse Company Tracker · Built for high-efficiency daily updates</p>
      </footer>

      {/* Add / Edit Company Modal */}
      <CompanyModal
        isOpen={isCompanyModalOpen}
        onClose={() => {
          setIsCompanyModalOpen(false);
          setEditingCompany(null);
        }}
        onSave={handleSaveCompany}
        editingCompany={editingCompany}
      />

      {/* POCs Dedicated Management Modal */}
      <POCModal
        company={managingPocCompany}
        isOpen={Boolean(managingPocCompany)}
        onClose={() => setManagingPocCompany(null)}
        onSavePOCs={handleSavePOCs}
      />

      {/* Cloud Sync Setup Modal */}
      <CloudSyncModal
        isOpen={isCloudModalOpen}
        onClose={() => setIsCloudModalOpen(false)}
        localCompanies={companies}
        onCloudDataSynced={handleCloudDataSynced}
      />

      {/* Floating Toast Notification */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
export default App;
