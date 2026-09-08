/**
/**
 * Date and academic calendar utilities for district board letters.
 */

/**
 * Formats a Date into standard formal district letter format: "Month D, YYYY"
 * e.g. "August 24, 2026"
 */
export function formatLetterDate(date: Date = new Date()): string {
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

/**
 * Computes the academic school year dynamically.
 * In K-12 school districts, academic years typically turn over on July 1.
 * July–December -> `${year}-${year + 1}` (e.g. Sept 2026 -> "2026-2027")
 * January–June   -> `${year - 1}-${year}` (e.g. Feb 2027 -> "2026-2027")
 */
export function getCurrentSchoolYear(date: Date = new Date()): string {
  const month = date.getMonth() // 0 = Jan, 6 = July
  const year = date.getFullYear()
  if (month >= 6) {
    return `${year}-${year + 1}`
  }
  return `${year - 1}-${year}`
}

/**
 * Returns the default letter date, using district config if set, or falling back
 * dynamically to today's date formatted in formal district style.
 */
export function getDefaultLetterDate(fallbackConfigDate?: string, date: Date = new Date()): string {
  if (fallbackConfigDate && fallbackConfigDate.trim()) {
    return fallbackConfigDate.trim()
  }
  return formatLetterDate(date)
}

/**
 * Returns the default school year, using district config if set, or falling back
 * dynamically to the current school year based on today's date.
 */
export function getDefaultSchoolYear(fallbackConfigYear?: string, date: Date = new Date()): string {
  if (fallbackConfigYear && fallbackConfigYear.trim()) {
    return fallbackConfigYear.trim()
  }
  return getCurrentSchoolYear(date)
}
