// IndexedDB utility for storing and retrieving tailored resumes safely without localStorage quota limits.

const DB_NAME = "careerpulse_resumes_db";
const DB_VERSION = 1;
const STORE_NAME = "resumes";

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "companyId" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Save a resume file (Blob or File) for a company
 */
export async function saveResumeFile(companyId, file) {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);

      const record = {
        companyId,
        fileName: file.name,
        fileType: file.type || "application/pdf",
        fileSize: file.size,
        blob: file,
        uploadedAt: new Date().toISOString(),
      };

      const putRequest = store.put(record);
      putRequest.onsuccess = () => resolve(record);
      putRequest.onerror = () => reject(putRequest.error);
    });
  } catch (err) {
    console.error("Failed to save resume in IndexedDB:", err);
    throw err;
  }
}

/**
 * Retrieve a stored resume record for a company
 */
export async function getResumeFile(companyId) {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const getRequest = store.get(companyId);

      getRequest.onsuccess = () => resolve(getRequest.result || null);
      getRequest.onerror = () => reject(getRequest.error);
    });
  } catch (err) {
    console.error("Failed to get resume from IndexedDB:", err);
    return null;
  }
}

/**
 * Delete a resume from IndexedDB
 */
export async function deleteResumeFile(companyId) {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const delRequest = store.delete(companyId);

      delRequest.onsuccess = () => resolve(true);
      delRequest.onerror = () => reject(delRequest.error);
    });
  } catch (err) {
    console.error("Failed to delete resume from IndexedDB:", err);
    return false;
  }
}

/**
 * Download the resume file directly in browser
 */
export async function downloadResume(companyId, fallbackName = "resume.pdf") {
  const record = await getResumeFile(companyId);
  if (!record || !record.blob) {
    throw new Error("No resume file found for this company");
  }

  const url = URL.createObjectURL(record.blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = record.fileName || fallbackName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // clean up URL object after a short timeout
  setTimeout(() => URL.revokeObjectURL(url), 2000);
  return record.fileName;
}

/**
 * Helper to format bytes to human readable format
 */
export function formatBytes(bytes) {
  if (!bytes || bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}
