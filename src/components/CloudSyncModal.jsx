import React, { useState } from "react";
import { X, Cloud, CheckCircle2, AlertCircle, Copy, Check, Database, RefreshCw, Key, ExternalLink } from "lucide-react";
import { getStoredConfig, saveCloudConfig, clearCloudConfig, isCloudConfigured, bulkSyncLocalToCloud, fetchCompaniesFromCloud } from "../utils/supabaseClient";

export function CloudSyncModal({ isOpen, onClose, localCompanies, onCloudDataSynced }) {
  if (!isOpen) return null;

  const currentConfig = getStoredConfig();
  const [url, setUrl] = useState(currentConfig.url || "");
  const [key, setKey] = useState(currentConfig.key || "");
  const [isTesting, setIsTesting] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [copiedSQL, setCopiedSQL] = useState(false);

  const sqlSchemaSnippet = `-- Run this in Supabase -> SQL Editor:
create table if not exists public.companies (
  id text primary key,
  company text not null,
  role text,
  date text,
  priority text default 'high',
  applied text default 'applied',
  status text default 'Applied',
  oa text default '',
  interview text default '',
  contacted integer default 0,
  replies integer default 0,
  notes text default '',
  links text default '',
  pocs jsonb default '[]'::jsonb,
  resume_meta jsonb default null,
  resume_link text default '',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.companies enable row level security;
create policy "Allow all" on public.companies for all to anon using (true) with check (true);

insert into storage.buckets (id, name, public) values ('resumes', 'resumes', true) on conflict do nothing;
create policy "Public resumes" on storage.objects for select to anon using ( bucket_id = 'resumes' );
create policy "Upload resumes" on storage.objects for insert to anon with check ( bucket_id = 'resumes' );
`;

  const handleCopySQL = () => {
    navigator.clipboard.writeText(sqlSchemaSnippet);
    setCopiedSQL(true);
    setTimeout(() => setCopiedSQL(false), 2000);
  };

  const handleSaveAndConnect = async (e) => {
    e.preventDefault();
    if (!url.trim() || !key.trim()) {
      setStatusMessage({ type: "error", text: "Please enter both Supabase URL and anon key." });
      return;
    }

    setIsTesting(true);
    setStatusMessage(null);

    try {
      saveCloudConfig(url.trim(), key.trim());
      // Test fetching from cloud
      const remoteData = await fetchCompaniesFromCloud();
      
      if (remoteData && remoteData.length > 0) {
        setStatusMessage({
          type: "success",
          text: `Connected! Found ${remoteData.length} companies in cloud database.`,
        });
        if (onCloudDataSynced) onCloudDataSynced(remoteData);
      } else {
        // Cloud is empty, offer to upload local companies
        setStatusMessage({
          type: "info",
          text: "Connected! Cloud database is ready. Click 'Push Local Data to Cloud' below to sync your current companies.",
        });
      }
    } catch (err) {
      console.error(err);
      setStatusMessage({
        type: "error",
        text: `Connection failed: ${err.message || "Invalid URL or API Key, or table 'companies' not created yet"}.`,
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handlePushLocalToCloud = async () => {
    setIsTesting(true);
    try {
      await bulkSyncLocalToCloud(localCompanies);
      setStatusMessage({
        type: "success",
        text: `Successfully synced ${localCompanies.length} companies & POCs to Supabase Cloud!`,
      });
    } catch (err) {
      setStatusMessage({
        type: "error",
        text: `Failed to push data: ${err.message}`,
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleDisconnect = () => {
    clearCloudConfig();
    setUrl("");
    setKey("");
    setStatusMessage({ type: "info", text: "Disconnected from Cloud. Now using local mode." });
  };

  const isConnected = isCloudConfigured();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md ${
              isConnected ? "bg-emerald-600/20 text-emerald-400 border border-emerald-500/30" : "bg-indigo-600/20 text-indigo-400 border border-indigo-500/30"
            }`}>
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">Cloud Multi-Device Sync</h2>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  isConnected ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                }`}>
                  {isConnected ? "Cloud Active" : "Local Mode"}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Sync applications & resumes seamlessly across your PC, laptop, phone & Vercel
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

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Status Alert */}
          {statusMessage && (
            <div className={`p-3.5 rounded-xl border text-xs flex items-center gap-2.5 animate-in fade-in duration-150 ${
              statusMessage.type === "success"
                ? "bg-emerald-950/50 border-emerald-500/40 text-emerald-300"
                : statusMessage.type === "error"
                ? "bg-rose-950/50 border-rose-500/40 text-rose-300"
                : "bg-blue-950/50 border-blue-500/40 text-blue-300"
            }`}>
              {statusMessage.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* Configuration Form */}
          <form onSubmit={handleSaveAndConnect} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Supabase Project URL
              </label>
              <input
                type="url"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://xyzcompany.supabase.co"
                className="w-full px-3 py-2 bg-slate-950/70 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Supabase Anon / Public Key
              </label>
              <input
                type="password"
                required
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full px-3 py-2 bg-slate-950/70 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  disabled={isTesting}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-md flex items-center gap-1.5 transition"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? "animate-spin" : ""}`} />
                  <span>{isConnected ? "Update & Reconnect" : "Save & Connect Cloud"}</span>
                </button>

                {isConnected && (
                  <button
                    type="button"
                    onClick={handlePushLocalToCloud}
                    disabled={isTesting}
                    className="px-3.5 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-semibold transition"
                    title="Upload current 30 companies to cloud database"
                  >
                    Push Local Data to Cloud
                  </button>
                )}
              </div>

              {isConnected && (
                <button
                  type="button"
                  onClick={handleDisconnect}
                  className="text-xs text-rose-400 hover:text-rose-300 underline"
                >
                  Disconnect
                </button>
              )}
            </div>
          </form>

          {/* Quick Setup Instructions */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <span className="font-bold text-slate-300 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-indigo-400" />
                <span>Free 2-Minute Supabase Setup</span>
              </span>
              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noreferrer"
                className="text-indigo-400 hover:underline flex items-center gap-1 text-[11px]"
              >
                <span>Open Supabase</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <ol className="list-decimal list-inside space-y-2 text-slate-400 text-[11px]">
              <li>
                Create a free project at <strong className="text-slate-200">supabase.com</strong>.
              </li>
              <li>
                In Supabase, go to <strong className="text-slate-200">SQL Editor</strong>, paste this schema, and click <strong className="text-slate-200">Run</strong>:
                <div className="mt-1.5 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopySQL}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px] font-semibold border border-slate-700 transition"
                  >
                    {copiedSQL ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-400" />}
                    <span>{copiedSQL ? "SQL Copied!" : "Copy SQL Schema (1-click)"}</span>
                  </button>
                  <span className="text-slate-500">Creates table + resume storage bucket</span>
                </div>
              </li>
              <li>
                Copy your <strong className="text-slate-200">Project URL</strong> and <strong className="text-slate-200">anon public key</strong> from <em className="text-slate-300">Project Settings &gt; API</em>.
              </li>
              <li>
                Paste them above OR add them in Vercel as <code className="text-indigo-300 bg-slate-900 px-1 py-0.5 rounded">VITE_SUPABASE_URL</code> and <code className="text-indigo-300 bg-slate-900 px-1 py-0.5 rounded">VITE_SUPABASE_ANON_KEY</code>!
              </li>
            </ol>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-950 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400">
          <span>Works offline when disconnected; auto-syncs when connected</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-lg transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
