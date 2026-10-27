import React, { useState, useRef } from "react";
import { UploadCloud, FileText, Download, Trash2, CheckCircle2, Link as LinkIcon, RefreshCw, FileCheck } from "lucide-react";
import { formatBytes } from "../utils/resumeStorage";

export function ResumeDropzone({
  resumeMeta,
  onFileSelect,
  onFileRemove,
  onDownload,
  resumeLink,
  onResumeLinkChange,
  companyName,
}) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      onFileSelect(file);
    }
  };

  const handleInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-indigo-400" />
          <span>Tailored Resume for {companyName || "Company"}</span>
        </label>
        {resumeMeta && (
          <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Resume Attached</span>
          </span>
        )}
      </div>

      {resumeMeta ? (
        /* Attached Resume State */
        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-indigo-500/30 flex items-center justify-between gap-3 shadow-inner">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shrink-0">
              <FileCheck className="w-5 h-5 text-indigo-400" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate max-w-xs sm:max-w-md">
                {resumeMeta.fileName || resumeMeta.name || "Custom_Resume.pdf"}
              </p>
              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <span>{formatBytes(resumeMeta.fileSize || resumeMeta.size)}</span>
                <span>•</span>
                <span>{resumeMeta.uploadedAt ? new Date(resumeMeta.uploadedAt).toLocaleDateString() : "Saved"}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {onDownload && (
              <button
                type="button"
                onClick={onDownload}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow transition"
                title="Download this tailored resume"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Download</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition"
              title="Replace file"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={onFileRemove}
              className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
              title="Remove resume"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
        /* Dropzone Upload Box */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`p-5 rounded-xl border-2 border-dashed cursor-pointer transition text-center flex flex-col items-center justify-center gap-2 ${
            isDragging
              ? "border-indigo-400 bg-indigo-500/10 text-indigo-300"
              : "border-slate-800 hover:border-slate-700 bg-slate-950/40 hover:bg-slate-950/70 text-slate-400"
          }`}
        >
          <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400">
            <UploadCloud className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-200">
              Drop customized resume here, or <span className="text-indigo-400 underline underline-offset-2">browse</span>
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Supports PDF, DOCX, DOC up to 25MB (saved locally to your browser)
            </p>
          </div>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx,.doc,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        onChange={handleInputChange}
        className="hidden"
      />

      {/* Optional Cloud Resume Link (e.g. Overleaf, Google Drive) */}
      <div className="flex items-center gap-2 pt-1">
        <LinkIcon className="w-3.5 h-3.5 text-slate-500 shrink-0" />
        <input
          type="url"
          value={resumeLink || ""}
          onChange={(e) => onResumeLinkChange(e.target.value)}
          placeholder="Or paste Overleaf / Google Drive link to this resume..."
          className="w-full px-3 py-1.5 bg-slate-950/60 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
        />
      </div>
    </div>
  );
}
