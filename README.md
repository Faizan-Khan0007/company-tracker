# 🎯 CareerPulse — Company & Job Application Tracker

A high-productivity, professional web application designed for daily tracking of company applications, tailored resumes, interviews, online assessments, and recruiter/referral contacts (POCs).

Built with **React 19**, **Vite**, **Tailwind CSS v4**, **IndexedDB**, and **Lucide Icons**.

---

## ⚡ Quick Start

```bash
cd /Users/faizan/.gemini/antigravity/scratch/company-tracker
npm run dev
```

Open your browser at: **[http://localhost:5173](http://localhost:5173)**

---

## 🚀 Key Features

### 1. 📄 Tailored Resumes Per Company (Store & 1-Click Download)
- **Attach Distinctive Resumes:** When adding or editing any company, drag-and-drop or upload that company's specific tailored resume (PDF, DOCX, DOC).
- **Zero File Quota Limitations:** Stored safely in browser **IndexedDB**, so files of any size (even 10–25MB) won't crash or exceed localStorage limits.
- **1-Click Download:** Download the exact tailored resume with its original file name straight from the home page table or Kanban cards!
- **Cloud Resume Links:** Also supports direct Overleaf or Google Drive links alongside local files.
- **Quick Filter:** One-click filter for `📄 Has Resume` to see which companies already have tailored resumes attached.

### 2. 👥 Dedicated POCs (Points of Contact) System
- Add multiple recruiters, hiring managers, engineers, or alumni to any company.
- Log **Name**, **Role / Title**, **Outreach Status** (Contacted, Replied, Referral Requested, Referral Given, Meeting Scheduled), **LinkedIn URL**, **Email**, and **Notes**.
- Access POCs via a dedicated column on the home page table, or switch to the **Master POC Directory** view.

### 3. 📊 Executive Dashboard & KPI Metrics
- **Total Applications**: Real-time count of applied vs. wishlist/to-apply companies.
- **Active Pipeline**: Instant view of applications in active interview rounds or pending/completed Online Assessments (OAs).
- **High Priority Targets**: Fast tracking of 🔥 high-priority dream companies.
- **Outreach & Networking Rate**: Automatically computes response rate (% replies / total reached out).

### 4. 📑 Daily Spreadsheet-Speed Table View
- **1-Click Priority Cycling**: Click the 🔥 / ⚡ / 💤 badge to change priority instantly.
- **1-Click Applied Toggle**: Flip between ✅ Applied, ⏳ To Apply, and ❌ Closed in 1 click.
- **Inline Stage Dropdown**: Move companies across pipeline stages (Applied, Referral, Shortlisted, OA, Interview, Waiting, Closed) without leaving the row.
- **Direct Portal Links**: External links to career portals and job IDs.

### 5. 📋 Kanban Pipeline Board
- Visual stages: **To Apply** → **Applied & Waiting** → **OA Stage** → **Interviewing** → **Closed**.
- 1-click stage advancement button ("Next") with resume download indicators on each card.

### 6. 💾 Persistence & Backup
- Automatically saves all edits, new companies, and POCs.
- **Export to CSV**: Download a clean spreadsheet of all your companies, contacts, and resume metadata anytime.
- **Export Backup (JSON)**: Full state backup for safe keeping.
- **Reset to Original Data**: One-click restore back to the default 30 entries.

---

## ⌨️ Keyboard Shortcuts
- **`N`**: Quick add new company
- **`/`**: Focus search bar
