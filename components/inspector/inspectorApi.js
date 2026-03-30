/**
 * Denetçi paneli için istemci tarafı API çağrıları.
 */

export async function fetchInspectorInspections(token) {
  const response = await fetch('/api/inspector/inspections', {
    headers: { Authorization: `Bearer ${token}` },
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    return { ok: false, data, error: data.error || 'Denetimler yüklenemedi', inspections: [] }
  }
  return { ok: true, inspections: Array.isArray(data) ? data : [] }
}

export async function postInspectorReinspect(token, inspectionId) {
  const response = await fetch('/api/inspector/inspection/reinspect', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ inspectionId }),
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    return { ok: false, error: data.error || 'İşlem başarısız', inspection: null }
  }
  return { ok: true, inspection: data }
}

export async function postInspectorInspectionStart(token, { inspectionId, findFirstUnanswered }) {
  const response = await fetch('/api/inspector/inspection/start', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      inspectionId,
      ...(findFirstUnanswered ? { findFirstUnanswered: true } : {}),
    }),
  })
  const data = await response.json().catch(() => ({}))
  return { ok: response.ok, data }
}
