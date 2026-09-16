const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000/api';

export async function fetchHealth() {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error('Failed to connect to backend service');
  return res.json();
}

export async function fetchSamples() {
  const res = await fetch(`${API_BASE}/samples`);
  if (!res.ok) throw new Error('Failed to fetch sample schemas');
  return res.json();
}

export async function fetchSampleById(id) {
  const res = await fetch(`${API_BASE}/samples/${id}`);
  if (!res.ok) throw new Error(`Failed to load sample schema ${id}`);
  return res.json();
}

export async function analyzeSchema(sql, dialect = 'postgres') {
  const res = await fetch(`${API_BASE}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sql, dialect }),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || 'Analysis failed. Please check SQL syntax.');
  }

  return res.json();
}

export async function refactorSchema(sql, dialect = 'postgres') {
  const res = await fetch(`${API_BASE}/refactor`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sql, dialect }),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || 'Refactoring failed.');
  }

  return res.json();
}