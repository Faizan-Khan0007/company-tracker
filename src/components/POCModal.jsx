import React, { useState } from "react";
import { X, Plus, Users, Trash2, ExternalLink, Mail, MessageSquare, Check, Sparkles } from "lucide-react";
import { POC_STATUSES } from "../constants";

export function POCModal({ company, isOpen, onClose, onSavePOCs }) {
  if (!isOpen || !company) return null;

  const [pocs, setPocs] = useState(company.pocs || []);
  const [showAddForm, setShowAddForm] = useState(pocs.length === 0);

  // New POC form state
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [status, setStatus] = useState("Contacted");
  const [notes, setNotes] = useState("");

  const handleAddPOC = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newPOC = {
      id: `poc-${Date.now()}`,
      name: name.trim(),
      role: role.trim() || "Contact",
      email: email.trim(),
      linkedin: linkedin.trim(),
      status,
      notes: notes.trim(),
    };

    const updated = [...pocs, newPOC];
    setPocs(updated);
    onSavePOCs(company.id, updated);

    // reset form
    setName("");
    setRole("");
    setEmail("");
    setLinkedin("");
    setStatus("Contacted");
    setNotes("");
    setShowAddForm(false);
  };

  const handleDeletePOC = (pocId) => {
    const updated = pocs.filter((p) => p.id !== pocId);
    setPocs(updated);
    onSavePOCs(company.id, updated);
  };

  const handleStatusChange = (pocId, newStatus) => {
    const updated = pocs.map((p) => (p.id === pocId ? { ...p, status: newStatus } : p));
    setPocs(updated);
    onSavePOCs(company.id, updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>POCs for {company.company}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-normal">
                  {pocs.length} {pocs.length === 1 ? "contact" : "contacts"}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Manage recruiters, alumni, engineers, and referrals for {company.role || "this role"}
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

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* List of existing POCs */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Current Points of Contact
              </h3>
              {!showAddForm && (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-sm transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Another POC</span>
                </button>
              )}
            </div>

            {pocs.length === 0 && !showAddForm ? (
              <div className="text-center py-8 px-4 bg-slate-950/40 rounded-xl border border-dashed border-slate-800">
                <Users className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-300">No POCs added yet</p>
                <p className="text-xs text-slate-500 mt-1">
                  Add recruiters, hiring managers, or alumni who can refer you at {company.company}.
                </p>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-500 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add First POC</span>
                </button>
              </div>
            ) : (
              pocs.map((poc) => {
                const statusObj = POC_STATUSES.find((s) => s.value === poc.status) || POC_STATUSES[0];
                return (
                  <div
                    key={poc.id}
                    className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition space-y-3 group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-100 text-sm">{poc.name}</h4>
                          <span className="text-xs text-slate-400 font-medium">({poc.role || "Contact"})</span>
                        </div>
                        {poc.notes && (
                          <p className="text-xs text-slate-300 mt-1 bg-slate-900/80 px-2.5 py-1 rounded-md border border-slate-800/80 inline-block">
                            💡 {poc.notes}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Status Select */}
                        <select
                          value={poc.status || "Contacted"}
                          onChange={(e) => handleStatusChange(poc.id, e.target.value)}
                          className={`text-xs px-2.5 py-1 rounded-lg font-medium border appearance-none cursor-pointer focus:outline-none ${statusObj.color}`}
                        >
                          {POC_STATUSES.map((st) => (
                            <option key={st.value} value={st.value} className="bg-slate-900 text-white">
                              {st.label}
                            </option>
                          ))}
                        </select>

                        <button
                          onClick={() => handleDeletePOC(poc.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                          title="Delete POC"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Contact links */}
                    {(poc.linkedin || poc.email) && (
                      <div className="flex items-center gap-4 text-xs text-slate-400 pt-1 border-t border-slate-800/60">
                        {poc.linkedin && (
                          <a
                            href={poc.linkedin.startsWith("http") ? poc.linkedin : `https://${poc.linkedin}`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 hover:underline"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>LinkedIn Profile</span>
                          </a>
                        )}
                        {poc.email && (
                          <a
                            href={`mailto:${poc.email}`}
                            className="flex items-center gap-1.5 text-slate-300 hover:text-white"
                          >
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            <span>{poc.email}</span>
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Add POC Form */}
          {showAddForm && (
            <form
              onSubmit={handleAddPOC}
              className="p-4 rounded-xl bg-slate-950/80 border border-indigo-500/30 space-y-4 animate-in fade-in slide-in-from-top-2 duration-150"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>New Point of Contact for {company.company}</span>
                </span>
                {pocs.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="text-xs text-slate-500 hover:text-slate-300"
                  >
                    Cancel
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    POC Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Abhishek Desai, Sarah Lee"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Role / Title
                  </label>
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="e.g. Senior SDE, Tech Lead, Recruiter"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    LinkedIn URL
                  </label>
                  <input
                    type="text"
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                    placeholder="linkedin.com/in/username"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Outreach Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    {POC_STATUSES.map((st) => (
                      <option key={st.value} value={st.value}>
                        {st.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Outreach Notes / Referral Details
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Inquired for SDE referral; agreed to refer on workday portal"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                {pocs.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-3.5 py-2 text-xs font-medium text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-md transition"
                >
                  Save POC
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-950 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400">
          <span>{pocs.length} POC(s) configured for {company.company}</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-lg transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
