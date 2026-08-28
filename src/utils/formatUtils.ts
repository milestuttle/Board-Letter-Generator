/**
 * Utilities for formatting district salary and wage numbers
 */

/**
 * Format certified annual base salary: $X,XXX (no cents)
 * e.g. "21025" -> "$21,025", "52000" -> "$52,000", "52000.50" -> "$52,000", "$45000" -> "$45,000"
 */
export const formatCertifiedSalary = (val: string | number | undefined | null): string => {
  if (val === undefined || val === null || val === '') return ''
  const str = String(val).trim()
  if (!str) return ''
  
  // If user entered decimal, discard cents
  if (str.includes('.')) {
    const parts = str.split('.')
    const whole = parts[0].replace(/[^0-9]/g, '')
    if (!whole) return ''
    const num = parseInt(whole, 10)
    return isNaN(num) ? str : '$' + num.toLocaleString('en-US')
  }
  
  const clean = str.replace(/[^0-9]/g, '')
  if (!clean) return ''
  
  const num = parseInt(clean, 10)
  if (isNaN(num)) return str
  
  return '$' + num.toLocaleString('en-US')
}

/**
 * Format classified hourly base wage: $XX.XX (dollars and cents)
 * e.g. "19.6" -> "$19.60", "18" -> "$18.00", "$19.67" -> "$19.67"
 */
export const formatClassifiedWage = (val: string | number | undefined | null): string => {
  if (val === undefined || val === null || val === '') return ''
  const str = String(val).trim()
  if (!str) return ''
  
  const clean = str.replace(/[^0-9.]/g, '')
  if (!clean) return str
  
  const num = parseFloat(clean)
  if (isNaN(num)) return str
  
  return '$' + num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

