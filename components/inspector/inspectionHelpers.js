export function normalizeSkippedQuestionIds(raw) {
  if (!Array.isArray(raw)) return []
  return [...new Set(raw.filter(Boolean))]
}

export function flattenInspectionQuestions(categories) {
  const out = []
  if (!Array.isArray(categories)) return out
  categories.forEach((cat, ci) => {
    (cat.questions || []).forEach((q, qi) => {
      out.push({
        catIdx: ci,
        qIdx: qi,
        id: q.id,
        text: q.question,
        categoryName: cat.name,
      })
    })
  })
  return out
}

export function findNextUnansweredAfter(categories, answersMap, afterCatIdx, afterQIdx) {
  const flat = flattenInspectionQuestions(categories)
  const idx = flat.findIndex((r) => r.catIdx === afterCatIdx && r.qIdx === afterQIdx)
  if (idx === -1) return null
  for (let j = idx + 1; j < flat.length; j++) {
    if (!answersMap[flat[j].id]) return { catIdx: flat[j].catIdx, qIdx: flat[j].qIdx }
  }
  for (let j = 0; j < idx; j++) {
    if (!answersMap[flat[j].id]) return { catIdx: flat[j].catIdx, qIdx: flat[j].qIdx }
  }
  return null
}

export function findNextUnansweredFromInclusive(categories, answersMap, fromCatIdx, fromQIdx) {
  const flat = flattenInspectionQuestions(categories)
  const idx = flat.findIndex((r) => r.catIdx === fromCatIdx && r.qIdx === fromQIdx)
  if (idx === -1) return null
  for (let step = 0; step < flat.length; step++) {
    const j = (idx + step) % flat.length
    if (!answersMap[flat[j].id]) return { catIdx: flat[j].catIdx, qIdx: flat[j].qIdx }
  }
  return null
}

