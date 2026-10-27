import { createClient } from "@supabase/supabase-js";

const CONFIG_STORAGE_KEY = "careerpulse_supabase_config";

export function getStoredConfig() {
  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (envUrl && envKey) {
    return { url: envUrl, key: envKey };
  }

  try {
    const raw = localStorage.getItem(CONFIG_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error("Failed to read cloud config:", err);
  }

  return { url: "", key: "" };
}

export function saveCloudConfig(url, key) {
  try {
    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify({ url: url.trim(), key: key.trim() }));
    supabaseInstance = null; // reset cached instance
  } catch (err) {
    console.error("Failed to save cloud config:", err);
  }
}

export function clearCloudConfig() {
  try {
    localStorage.removeItem(CONFIG_STORAGE_KEY);
    supabaseInstance = null;
  } catch (err) {
    console.error("Failed to clear cloud config:", err);
  }
}

export function isCloudConfigured() {
  const { url, key } = getStoredConfig();
  return Boolean(url && key && url.startsWith("http"));
}

let supabaseInstance = null;

export function getSupabase() {
  if (supabaseInstance) return supabaseInstance;

  const { url, key } = getStoredConfig();
  if (!url || !key) return null;

  try {
    supabaseInstance = createClient(url, key);
    return supabaseInstance;
  } catch (err) {
    console.error("Error initializing Supabase client:", err);
    return null;
  }
}

// Convert DB snake_case record to application camelCase
export function mapFromDB(row) {
  return {
    id: row.id,
    company: row.company,
    role: row.role || "",
    date: row.date || "",
    priority: row.priority || "high",
    applied: row.applied || "applied",
    status: row.status || "Applied",
    oa: row.oa || "",
    interview: row.interview || "",
    contacted: row.contacted ?? 0,
    replies: row.replies ?? 0,
    notes: row.notes || "",
    links: row.links || "",
    pocs: row.pocs || [],
    resumeMeta: row.resume_meta || null,
    resumeLink: row.resume_link || "",
  };
}

// Convert application camelCase to DB snake_case
export function mapToDB(company) {
  return {
    id: company.id,
    company: company.company,
    role: company.role || "",
    date: company.date || "",
    priority: company.priority || "high",
    applied: company.applied || "applied",
    status: company.status || "Applied",
    oa: company.oa || "",
    interview: company.interview || "",
    contacted: Number(company.contacted) || 0,
    replies: Number(company.replies) || 0,
    notes: company.notes || "",
    links: company.links || "",
    pocs: company.pocs || [],
    resume_meta: company.resumeMeta || null,
    resume_link: company.resumeLink || "",
    updated_at: new Date().toISOString(),
  };
}

// Cloud API: Fetch all companies
export async function fetchCompaniesFromCloud() {
  const supabase = getSupabase();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("companies")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Supabase fetch error:", error);
    throw error;
  }

  return (data || []).map(mapFromDB);
}

// Cloud API: Upsert company
export async function upsertCompanyToCloud(company) {
  const supabase = getSupabase();
  if (!supabase) return null;

  const dbRow = mapToDB(company);
  const { data, error } = await supabase
    .from("companies")
    .upsert(dbRow, { onConflict: "id" })
    .select();

  if (error) {
    console.error("Supabase upsert error:", error);
    throw error;
  }

  return data ? mapFromDB(data[0]) : company;
}

// Cloud API: Delete company
export async function deleteCompanyFromCloud(id) {
  const supabase = getSupabase();
  if (!supabase) return null;

  const { error } = await supabase.from("companies").delete().eq("id", id);
  if (error) {
    console.error("Supabase delete error:", error);
    throw error;
  }
  return true;
}

// Cloud Storage API: Upload resume file to Supabase Storage bucket 'resumes'
export async function uploadResumeToCloud(companyId, file) {
  const supabase = getSupabase();
  if (!supabase) return null;

  const ext = file.name.split(".").pop();
  const filePath = `${companyId}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;

  const { data, error } = await supabase.storage
    .from("resumes")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: true,
    });

  if (error) {
    console.error("Supabase storage upload error:", error);
    throw error;
  }

  // Get public URL
  const { data: urlData } = supabase.storage.from("resumes").getPublicUrl(filePath);

  return {
    filePath,
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type,
    uploadedAt: new Date().toISOString(),
    publicUrl: urlData?.publicUrl || "",
  };
}

// Cloud Storage API: Download resume file
export async function downloadResumeFromCloud(resumeMeta, fallbackName = "resume.pdf") {
  const supabase = getSupabase();
  if (!supabase) return null;

  if (resumeMeta.publicUrl) {
    // Direct public link download
    const link = document.createElement("a");
    link.href = resumeMeta.publicUrl;
    link.download = resumeMeta.fileName || fallbackName;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return resumeMeta.fileName || fallbackName;
  }

  if (resumeMeta.filePath) {
    const { data, error } = await supabase.storage.from("resumes").download(resumeMeta.filePath);
    if (error) throw error;

    const url = URL.createObjectURL(data);
    const link = document.createElement("a");
    link.href = url;
    link.download = resumeMeta.fileName || fallbackName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    return resumeMeta.fileName || fallbackName;
  }

  throw new Error("No cloud resume path found");
}

// Bulk sync local companies to cloud
export async function bulkSyncLocalToCloud(localCompanies) {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Cloud sync not configured");

  const dbRows = localCompanies.map(mapToDB);
  const { error } = await supabase.from("companies").upsert(dbRows, { onConflict: "id" });

  if (error) {
    console.error("Bulk sync error:", error);
    throw error;
  }
  return true;
}
