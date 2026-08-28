export type LetterType = 'certified' | 'classified' | 'resignation' | 'transfer' | 'retirement'

export interface AdminStaffMember {
  id: string
  name: string
  title: string
}

export interface DistrictConfig {
  districtName: string
  districtSubtitle: string
  addressLine1: string
  cityStateZip: string
  phone: string
  fax: string
  hrEmail: string
  hrPhone: string
  missionStatement: string
  adminStaff: AdminStaffMember[]
  defaultSignerName: string
  defaultSignerTitle: string
  defaultTypistInitials: string
  defaultCc: string
  signatureImage?: string
  headerType?: 'image' | 'vector'
}

export interface CertifiedFields {
  lane: string // e.g. "MA+48", "BA", "MA"
  step: string // e.g. "23", "5"
  baseSalary: string // e.g. "$21,031.50" or "$52,400.00"
  startDate: string // e.g. "September 1, 2026"
  isPartTime?: boolean
  fteText?: string // e.g. "Part-time" or "Full-time"
}

export interface ClassifiedFields {
  classification: string // e.g. "P6", "P5", "S2"
  level: string // e.g. "E", "D", "C"
  baseWage: string // e.g. "$19.67" or "$18.56"
  wageUnit?: 'hour' | 'year' // default per hour
  stipendText?: string // e.g. "Plus a center-based stipend of $2,000"
  startDate: string // e.g. "August 20, 2026"
}

export interface TransferFields {
  previousPosition?: string
  newPosition: string // e.g. "Crossing Guard / Noon Aide"
  newLocation: string // e.g. "Washington Elementary School"
  transferDescription: string // e.g. "transfer in position and hours back to Crossing Guard / Noon Aide at Washington Elementary School"
  effectiveDate: string // e.g. "August 12, 2026"
}

export interface ResignationFields {
  position: string // e.g. "3rd Grade Teacher"
  location: string // e.g. "Lincoln School of Science and Technology"
  effectiveDate: string // e.g. "June 1, 2026"
  reason?: string // optional
  customAppreciation?: string
}

export interface RetirementFields {
  position: string // e.g. "POSITION"
  location: string // e.g. "LOCATION"
  effectiveDate: string // e.g. "June 5, 2026"
  actionType?: 'approved_request' | 'accepted_action'
  includeRemainderOfYear?: boolean
  remainderYearText?: string // e.g. "for the remainder of the 2025/2026 School Year."
  yearsOfService: string // e.g. "25", "18", "XX"
  celebrationText?: string // e.g. "We will be holding a celebration for retirees in April, 2027. Please watch for more detailed information to be shared closer to the event."
}

export interface LetterData {
  id: string
  type: LetterType
  letterDate: string // e.g. "August 24, 2026"
  boardMeetingDate: string // e.g. "August 24, 2026"
  schoolYear: string // e.g. "2026-2027" or "2026/2027"
  
  // Recipient
  recipientFirstName: string
  recipientLastName: string
  streetAddress: string
  city: string
  state: string
  zip: string
  customSalutation?: string // defaults to "Dear {firstName},"
  
  // Common Position/Role context
  positionTitle: string // e.g. "Part-time Lead Counselor" or "School Health Technician"
  location: string // e.g. "District-wide" or "Cañon City High School"
  
  // Type-specific field objects
  certified?: CertifiedFields
  classified?: ClassifiedFields
  transfer?: TransferFields
  resignation?: ResignationFields
  retirement?: RetirementFields
  
  // Custom Overrides / Signature
  signerName?: string
  signerTitle?: string
  typistInitials?: string // e.g. "/ks"
  ccLine?: string // e.g. "Cc: personnel file"
  signatureType?: 'authentic' | 'typed' | 'custom'
  customSignatureData?: string
  
  // Notes / Internal tags
  notes?: string
  createdAt?: string
  updatedAt?: string
}

export interface TemplatePreset {
  id: string
  name: string
  description: string
  letter: LetterData
}
