import React, { useState, useEffect } from "react";
import { X, Plus, Users, Trash2, Link, Sparkles, Building2 } from "lucide-react";
import { PRIORITIES, APPLIED_STATUSES, STAGES, OA_STATUSES, POC_STATUSES } from "../constants";
import { ResumeDropzone } from "./ResumeDropzone";
import { downloadResume } from "../utils/resumeStorage";

export function CompanyModal({ isOpen, onClose, onSave, editingCompany }) {
  if (!isOpen) return null;

  const defaultDate = () => {
    const d = new Date();
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];
    return `${d.getDate()} ${months[d.getMonth()]}`;
  };

  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [date, setDate] = useState(defaultDate());
  const [priority, setPriority] = useState("high");
  const [applied, setApplied] = useState("applied");
  const [status, setStatus] = useState("Applied");
  const [oa, setOa] = useState("");
  const [interview, setInterview] = useState("");
  const [contacted, setContacted] = useState(0);
  const [replies, setReplies] = useState(0);
  const [notes, setNotes] = useState("");
  const [links, setLinks] = useState("");
  const [pocs, setPocs] = useState([]);

  // Resume states
  const [resumeMeta, setResumeMeta] = useState(null);
  const [resumeLink, setResumeLink] = useState("");
  const [pendingResumeFile, setPendingResumeFile] = useState(null);
  const [resumeRemoved, setResumeRemoved] = useState(false);

  // New inline POC form state
  const [newPocName, setNewPocName] = useState("");
  const [newPocRole, setNewPocRole] = useState("");
  const [newPocStatus, setNewPocStatus] = useState("Contacted");
  const [newPocLinkedin, setNewPocLinkedin] = useState("");

  useEffect(() => {
    if (editingCompany) {
      setCompany(editingCompany.company || "");
      setRole(editingCompany.role || "");
      setDate(editingCompany.date || defaultDate());
      setPriority(editingCompany.priority || "high");
      setApplied(editingCompany.applied || "applied");
      setStatus(editingCompany.status || "Applied");
      setOa(editingCompany.oa || "");
      setInterview(editingCompany.interview || "");
      setContacted(editingCompany.contacted ?? 0);
      setReplies(editingCompany.replies ?? 0);
      setNotes(editingCompany.notes || "");
      setLinks(editingCompany.links || "");
      setPocs(editingCompany.pocs ? [...editingCompany.pocs] : []);
      setResumeMeta(editingCompany.resumeMeta || null);
      setResumeLink(editingCompany.resumeLink || "");
      setPendingResumeFile(null);
      setResumeRemoved(false);
    } else {
      setCompany("");
      setRole("SDE");
      setDate(defaultDate());
      setPriority("high");
      setApplied("applied");
      setStatus("Applied");
      setOa("");
      setInterview("");
      setContacted(0);
      setReplies(0);
      setNotes("");
      setLinks("");
      setPocs([]);
      setResumeMeta(null);
      setResumeLink("");
      setPendingResumeFile(null);
      setResumeRemoved(false);
    }
  }, [editingCompany, isOpen]);

  const handleAddInlinePoc = () => {
    if (!newPocName.trim()) return;
    const newPoc = {
      id: `poc-${Date.now()}`,
      name: newPocName.trim(),
      role: newPocRole.trim() || "Contact",
      status: newPocStatus,
      linkedin: newPocLinkedin.trim(),
      email: "",
      notes: "",
    };
    setPocs([...pocs, newPoc]);
    setContacted((prev) => (Number(prev) || 0) + 1);
    setNewPocName("");
    setNewPocRole("");
    setNewPocLinkedin("");
  };

  const handleRemovePoc = (pocId) => {
    setPocs(pocs.filter((p) => p.id !== pocId));
  };

  // Resume handlers
  const handleFileSelect = (file) => {
    setPendingResumeFile(file);
    setResumeMeta({
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type || "application/pdf",
      uploadedAt: new Date().toISOString(),
    });
    setResumeRemoved(false);
  };

  const handleFileRemove = () => {
    setPendingResumeFile(null);
    setResumeMeta(null);
    setResumeRemoved(true);
  };

  const handleDownloadResume = async () => {
    if (pendingResumeFile) {
      // Download newly selected in-memory file
      const url = URL.createObjectURL(pendingResumeFile);
      const a = document.createElement("a");
      a.href = url;
      a.download = pendingResumeFile.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } else if (editingCompany?.id) {
      try {
        await downloadResume(editingCompany.id, resumeMeta?.fileName || "resume.pdf");
      } catch (err) {
        alert("Could not retrieve resume: " + err.message);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!company.trim()) return;

    const companyId = editingCompany ? editingCompany.id : `comp-${Date.now()}`;

    const companyData = {
      id: companyId,
      company: company.trim(),
      role: role.trim() || "Software Engineer",
      date: date.trim() || defaultDate(),
      priority,
      applied,
      status,
      oa: oa.trim(),
      interview: interview.trim(),
      contacted: Number(contacted) || 0,
      replies: Number(replies) || 0,
      notes: notes.trim(),
      links: links.trim(),
      pocs,
      resumeMeta: resumeRemoved ? null : resumeMeta,
      resumeLink: resumeLink.trim(),
    };

    onSave(companyData, {
      file: pendingResumeFile,
      removed: resumeRemoved,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {editingCompany ? `Edit ${editingCompany.company}` : "Add New Application"}
              </h2>
              <p className="text-xs text-slate-400">
                Track status, tailored resume, interview rounds, and POC contacts
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Row 1: Company & Role */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Company Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Google, Atlassian, Stripe"
                className="w-full px-3.5 py-2 bg-slate-950/70 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Job Role / Position
              </label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. SDE I, SWE Intern, AI Engineer"
                className="w-full px-3.5 py-2 bg-slate-950/70 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Tailored Resume Zone */}
          <div className="p-4 bg-slate-950/50 rounded-xl border border-slate-800">
            <ResumeDropzone
              companyName={company}
              resumeMeta={resumeMeta}
              resumeLink={resumeLink}
              onResumeLinkChange={setResumeLink}
              onFileSelect={handleFileSelect}
              onFileRemove={handleFileRemove}
              onDownload={handleDownloadResume}
            />
          </div>

          {/* Row 2: Date, Priority, Applied Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Date</label>
              <input
                type="text"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                placeholder="e.g. 28 Jul"
                className="w-full px-3 py-2 bg-slate-950/70 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950/70 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                {PRIORITIES.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.icon} {p.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Applied Status</label>
              <select
                value={applied}
                onChange={(e) => setApplied(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950/70 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                {APPLIED_STATUSES.map((a) => (
                  <option key={a.value} value={a.value}>
                    {a.icon} {a.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 3: Current Stage, OA, Interview */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Application Stage
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950/70 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                {STAGES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Online Assessment (OA)
              </label>
              <input
                type="text"
                value={oa}
                onChange={(e) => setOa(e.target.value)}
                placeholder="e.g. Pending, ✅ Completed, Given"
                className="w-full px-3 py-2 bg-slate-950/70 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Interview Status
              </label>
              <input
                type="text"
                value={interview}
                onChange={(e) => setInterview(e.target.value)}
                placeholder="e.g. HR Call Today, 2nd round"
                className="w-full px-3 py-2 bg-slate-950/70 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Row 4: Outreach metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-slate-950/40 rounded-xl border border-slate-800">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Total People Contacted
              </label>
              <input
                type="number"
                min="0"
                value={contacted}
                onChange={(e) => setContacted(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Replies Received
              </label>
              <input
                type="number"
                min="0"
                value={replies}
                onChange={(e) => setReplies(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Row 5: POCs section */}
          <div className="p-4 bg-indigo-950/20 rounded-xl border border-indigo-900/40 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                <span>Points of Contact (POCs) for {company || "Company"}</span>
              </span>
              <span className="text-[11px] text-indigo-400 font-mono">
                {pocs.length} added
              </span>
            </div>

            {/* List existing POCs */}
            {pocs.length > 0 && (
              <div className="space-y-2">
                {pocs.map((poc) => (
                  <div
                    key={poc.id}
                    className="flex items-center justify-between px-3 py-2 bg-slate-900/90 rounded-lg border border-slate-800 text-xs text-slate-200"
                  >
                    <div>
                      <span className="font-bold text-white">{poc.name}</span>
                      <span className="text-slate-400 ml-2">({poc.role || "Contact"})</span>
                      <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] bg-indigo-500/20 text-indigo-300">
                        {poc.status}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemovePoc(poc.id)}
                      className="text-slate-500 hover:text-rose-400 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Inline Add POC */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
              <input
                type="text"
                placeholder="POC Name (e.g. Abhishek Desai)"
                value={newPocName}
                onChange={(e) => setNewPocName(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none"
              />
              <input
                type="text"
                placeholder="Role (e.g. Senior SDE / Referral)"
                value={newPocRole}
                onChange={(e) => setNewPocRole(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none"
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="LinkedIn URL"
                  value={newPocLinkedin}
                  onChange={(e) => setNewPocLinkedin(e.target.value)}
                  className="flex-1 px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddInlinePoc}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shrink-0"
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* Links & Notes */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Job Posting / Career Portal Link
              </label>
              <div className="relative">
                <Link className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="url"
                  value={links}
                  onChange={(e) => setLinks(e.target.value)}
                  placeholder="https://..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-950/70 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                General Notes / Referral Context
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Referred by Manish Chauhan, On-campus interview scheduled..."
                className="w-full px-3.5 py-2 bg-slate-950/70 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
              />
            </div>
          </div>

          {/* Footer buttons */}
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-500/25 transition active:scale-95"
            >
              {editingCompany ? "Update Application" : "Save Application"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
