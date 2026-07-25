const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

async function handle(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Request failed with status ${res.status}`);
  }
  return data;
}

export async function uploadPdf(file, onProgress) {
  const formData = new FormData();
  formData.append("file", file);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${API_URL}/api/documents/upload`);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => {
      let data = {};
      try {
        data = JSON.parse(xhr.responseText);
      } catch {
        /* ignore parse errors, handled below */
      }
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(data);
      } else {
        reject(new Error(data.error || `Upload failed with status ${xhr.status}`));
      }
    };

    xhr.onerror = () => reject(new Error("Network error while uploading the file."));

    xhr.send(formData);
  });
}

export async function buildKnowledgeBase(fileId, fileName) {
  const res = await fetch(`${API_URL}/api/documents/build`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fileId, fileName }),
  });
  return handle(res);
}

export async function getStatus() {
  const res = await fetch(`${API_URL}/api/documents/status`);
  return handle(res);
}

export async function resetKnowledgeBase() {
  const res = await fetch(`${API_URL}/api/documents/reset`, { method: "DELETE" });
  return handle(res);
}

export async function askQuestion(question) {
  const res = await fetch(`${API_URL}/api/chat/ask`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question }),
  });
  return handle(res);
}
