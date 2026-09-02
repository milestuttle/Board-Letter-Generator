import React, { useState } from 'react'
import type { DistrictConfig, AdminStaffMember, TotalCompDistrictDefaults } from '../types/letter'
import {
  Settings,
  X,
  Plus,
  Trash2,
  Save,
  Building2,
  Users,
  ShieldCheck,
  Calendar,
  MapPin,
  GraduationCap,
  Calculator,
  RotateCcw,
} from 'lucide-react'
import { DEFAULT_DISTRICT_CONFIG } from '../utils/sampleData'

interface SettingsModalProps {
  config: DistrictConfig
  onSave: (newConfig: DistrictConfig) => void
  onClose: () => void
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  config,
  onSave,
  onClose,
}) => {
  const [formData, setFormData] = useState<DistrictConfig>({
    ...DEFAULT_DISTRICT_CONFIG,
    ...config,
    districtLocations: config.districtLocations || DEFAULT_DISTRICT_CONFIG.districtLocations,
    certifiedLanes: config.certifiedLanes || DEFAULT_DISTRICT_CONFIG.certifiedLanes,
    totalCompDefaults: {
      ...DEFAULT_DISTRICT_CONFIG.totalCompDefaults,
      ...config.totalCompDefaults,
    },
  })
  const [activeTab, setActiveTab] = useState<'general' | 'calendar' | 'directory' | 'staff' | 'signers' | 'benefits'>('general')

  const [newLocationInput, setNewLocationInput] = useState('')
  const [newLaneInput, setNewLaneInput] = useState('')

  const updateTotalCompDefaults = (updates: Partial<TotalCompDistrictDefaults>) => {
    setFormData((prev) => ({
      ...prev,
      totalCompDefaults: {
        ...(prev.totalCompDefaults || DEFAULT_DISTRICT_CONFIG.totalCompDefaults || {}),
        ...updates,
      },
    }))
  }

  const updateStaffMember = (id: string, field: 'name' | 'title', val: string) => {
    setFormData({
      ...formData,
      adminStaff: formData.adminStaff.map((s) => (s.id === id ? { ...s, [field]: val } : s)),
    })
  }

  const addStaffMember = () => {
    const newStaff: AdminStaffMember = {
      id: Date.now().toString(),
      name: 'NEW ADMINISTRATOR',
      title: 'Position Title',
    }
    setFormData({
      ...formData,
      adminStaff: [...formData.adminStaff, newStaff],
    })
  }

  const removeStaffMember = (id: string) => {
    setFormData({
      ...formData,
      adminStaff: formData.adminStaff.filter((s) => s.id !== id),
    })
  }

  // Location Directory management
  const addLocation = () => {
    const trimmed = newLocationInput.trim()
    if (!trimmed) return
    const currentLocs = formData.districtLocations || []
    if (!currentLocs.includes(trimmed)) {
      setFormData({
        ...formData,
        districtLocations: [...currentLocs, trimmed],
      })
    }
    setNewLocationInput('')
  }

  const removeLocation = (index: number) => {
    const currentLocs = formData.districtLocations || []
    setFormData({
      ...formData,
      districtLocations: currentLocs.filter((_, i) => i !== index),
    })
  }

  // Certified Lanes management
  const addLane = () => {
    const trimmed = newLaneInput.trim().toUpperCase()
    if (!trimmed) return
    const currentLanes = formData.certifiedLanes || []
    if (!currentLanes.includes(trimmed)) {
      setFormData({
        ...formData,
        certifiedLanes: [...currentLanes, trimmed],
      })
    }
    setNewLaneInput('')
  }

  const removeLane = (index: number) => {
    const currentLanes = formData.certifiedLanes || []
    setFormData({
      ...formData,
      certifiedLanes: currentLanes.filter((_, i) => i !== index),
    })
  }

  const handleSave = () => {
    onSave(formData)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">District Stationery & Defaults</h2>
              <p className="text-xs text-slate-500">
                Customize district letterhead, calendar defaults, school directory, and salary scale lanes.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="px-6 pt-3 border-b border-slate-100 flex gap-4 overflow-x-auto">
          <button
            onClick={() => setActiveTab('general')}
            className={`pb-3 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'general'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-4 h-4" />
            District Info
          </button>

          <button
            onClick={() => setActiveTab('calendar')}
            className={`pb-3 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'calendar'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Calendar & Defaults
          </button>

          <button
            onClick={() => setActiveTab('directory')}
            className={`pb-3 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'directory'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <MapPin className="w-4 h-4" />
            Schools & Salary Lanes
          </button>

          <button
            onClick={() => setActiveTab('staff')}
            className={`pb-3 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'staff'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            Header Staff ({formData.adminStaff.length})
          </button>

          <button
            onClick={() => setActiveTab('signers')}
            className={`pb-3 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'signers'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Signers &amp; CC
          </button>

          <button
            onClick={() => setActiveTab('benefits')}
            className={`pb-3 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'benefits'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Calculator className="w-4 h-4 text-indigo-500" />
            Benefits &amp; Total Comp
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {activeTab === 'general' && (
            <div className="space-y-4">
              <div className="bg-blue-50/60 p-3.5 rounded-xl border border-blue-100 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-blue-950">Letterhead Graphic Style</div>
                  <div className="text-[11px] text-blue-800">
                    Using official Canon City Schools letterhead banner (from images folder)
                  </div>
                </div>
                <div className="inline-flex rounded-lg bg-blue-100 p-1">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, headerType: 'image' })}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-md transition cursor-pointer ${
                      formData.headerType !== 'vector'
                        ? 'bg-white text-blue-900 shadow-2xs'
                        : 'text-blue-700 hover:text-blue-900'
                    }`}
                  >
                    Official Image
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, headerType: 'vector' })}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-md transition cursor-pointer ${
                      formData.headerType === 'vector'
                        ? 'bg-white text-blue-900 shadow-2xs'
                        : 'text-blue-700 hover:text-blue-900'
                    }`}
                  >
                    Dynamic HTML
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    District Name
                  </label>
                  <input
                    type="text"
                    value={formData.districtName}
                    onChange={(e) => setFormData({ ...formData, districtName: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    District Subtitle / Code
                  </label>
                  <input
                    type="text"
                    value={formData.districtSubtitle}
                    onChange={(e) => setFormData({ ...formData, districtSubtitle: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Address Line
                  </label>
                  <input
                    type="text"
                    value={formData.addressLine1}
                    onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    City, State, ZIP
                  </label>
                  <input
                    type="text"
                    value={formData.cityStateZip}
                    onChange={(e) => setFormData({ ...formData, cityStateZip: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Phone</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Fax</label>
                  <input
                    type="text"
                    value={formData.fax}
                    onChange={(e) => setFormData({ ...formData, fax: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">HR Email</label>
                  <input
                    type="text"
                    value={formData.hrEmail}
                    onChange={(e) => setFormData({ ...formData, hrEmail: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">HR Phone</label>
                  <input
                    type="text"
                    value={formData.hrPhone}
                    onChange={(e) => setFormData({ ...formData, hrPhone: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  District Mission Statement Quote
                </label>
                <textarea
                  rows={3}
                  value={formData.missionStatement}
                  onChange={(e) => setFormData({ ...formData, missionStatement: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-blue-500 outline-none"
                />
              </div>
            </div>
          )}

          {/* Calendar & Academic Defaults Tab */}
          {activeTab === 'calendar' && (
            <div className="space-y-4">
              <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100/80">
                <h3 className="text-xs font-bold text-blue-950 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  Upcoming Agenda & Academic Year Defaults
                </h3>
                <p className="text-xs text-blue-800/80 mb-4">
                  Set the upcoming board meeting date and school year. Newly generated letters and sample batches will automatically pre-populate with these values.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Default / Next Board Meeting Date
                    </label>
                    <input
                      type="text"
                      value={formData.defaultBoardMeetingDate || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, defaultBoardMeetingDate: e.target.value })
                      }
                      placeholder="e.g. August 24, 2026 or September 28, 2026"
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none font-medium"
                    />
                    <span className="text-[11px] text-slate-400 mt-1 block">
                      Used as official approval date across all personnel letters.
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Default School Year
                    </label>
                    <input
                      type="text"
                      value={formData.defaultSchoolYear || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, defaultSchoolYear: e.target.value })
                      }
                      placeholder="e.g. 2026-2027"
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none font-medium"
                    />
                    <span className="text-[11px] text-slate-400 mt-1 block">
                      Default academic school year reference.
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Default Annual Retiree Celebration Announcement
                </label>
                <textarea
                  rows={3}
                  value={formData.defaultRetirementCelebrationText || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, defaultRetirementCelebrationText: e.target.value })
                  }
                  placeholder="We will be holding a celebration for retirees in April, 2027..."
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Included in official retirement approval letters. Update this notice annually with event dates/times.
                </span>
              </div>
            </div>
          )}

          {/* Schools & Certified Salary Scale Lanes Tab */}
          {activeTab === 'directory' && (
            <div className="space-y-6">
              {/* Section 1: Schools Directory */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 mb-3">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-blue-600" />
                      District School & Facility Directory ({(formData.districtLocations || []).length})
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Standard school/building names used for instant autocomplete in letter forms.
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newLocationInput}
                    onChange={(e) => setNewLocationInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addLocation()
                      }
                    }}
                    placeholder="Add building (e.g. Cañon City High School)..."
                    className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white focus:border-blue-500 outline-none"
                  />
                  <button
                    type="button"
                    onClick={addLocation}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer transition shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
                  {(formData.districtLocations || []).map((loc, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-800 shadow-2xs"
                    >
                      {loc}
                      <button
                        type="button"
                        onClick={() => removeLocation(idx)}
                        className="text-slate-400 hover:text-red-600 transition cursor-pointer"
                        title="Remove location"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Section 2: Standard Certified Salary Lanes */}
              <div className="bg-blue-50/40 p-4 rounded-2xl border border-blue-100">
                <div className="flex items-center justify-between pb-2 border-b border-blue-100 mb-3">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-blue-950 flex items-center gap-1.5">
                      <GraduationCap className="w-4 h-4 text-blue-600" />
                      Standard Certified Salary Lanes ({(formData.certifiedLanes || []).length})
                    </h3>
                    <p className="text-[11px] text-blue-800/80">
                      Pre-configured salary schedule tiers (BA, MA, etc.) available as 1-click pills in Certified letter editing.
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newLaneInput}
                    onChange={(e) => setNewLaneInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addLane()
                      }
                    }}
                    placeholder="Add salary lane (e.g. MA+60 or DOC)..."
                    className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-blue-200 bg-white focus:border-blue-500 outline-none"
                  />
                  <button
                    type="button"
                    onClick={addLane}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer transition shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Lane
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
                  {(formData.certifiedLanes || []).map((lane, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-blue-200 text-xs font-bold text-blue-950 shadow-2xs"
                    >
                      {lane}
                      <button
                        type="button"
                        onClick={() => removeLane(idx)}
                        className="text-slate-400 hover:text-red-600 transition cursor-pointer"
                        title="Remove lane"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'staff' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-medium text-slate-600">
                  Header staff list displayed on upper right of letterhead:
                </span>
                <button
                  type="button"
                  onClick={addStaffMember}
                  className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Staff Member
                </button>
              </div>

              <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                {formData.adminStaff.map((staff) => (
                  <div
                    key={staff.id}
                    className="grid grid-cols-12 gap-2 items-center bg-slate-50 p-2 rounded-xl border border-slate-200"
                  >
                    <div className="col-span-5">
                      <input
                        type="text"
                        value={staff.name}
                        onChange={(e) => updateStaffMember(staff.id, 'name', e.target.value)}
                        placeholder="NAME (e.g. ADAM HARTMAN)"
                        className="w-full px-2.5 py-1.5 text-xs font-bold rounded-lg border border-slate-200 bg-white"
                      />
                    </div>
                    <div className="col-span-6">
                      <input
                        type="text"
                        value={staff.title}
                        onChange={(e) => updateStaffMember(staff.id, 'title', e.target.value)}
                        placeholder="Title (e.g. Superintendent of Schools)"
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                      />
                    </div>
                    <div className="col-span-1 flex justify-center">
                      <button
                        type="button"
                        onClick={() => removeStaffMember(staff.id)}
                        className="text-slate-400 hover:text-red-600 p-1 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'signers' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Default Signer Name
                  </label>
                  <input
                    type="text"
                    value={formData.defaultSignerName}
                    onChange={(e) =>
                      setFormData({ ...formData, defaultSignerName: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Default Signer Title
                  </label>
                  <input
                    type="text"
                    value={formData.defaultSignerTitle}
                    onChange={(e) =>
                      setFormData({ ...formData, defaultSignerTitle: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Default Typist Initials
                  </label>
                  <input
                    type="text"
                    value={formData.defaultTypistInitials}
                    onChange={(e) =>
                      setFormData({ ...formData, defaultTypistInitials: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Default Cc: Line
                  </label>
                  <input
                    type="text"
                    value={formData.defaultCc}
                    onChange={(e) => setFormData({ ...formData, defaultCc: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'benefits' && (
            <div className="space-y-5 text-slate-800">
              <div className="bg-indigo-50/70 border border-indigo-200/80 rounded-2xl p-4 flex items-start justify-between gap-4">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-900 mb-1 flex items-center gap-1.5">
                    <Calculator className="w-4 h-4 text-indigo-600" />
                    District-Wide Compensation &amp; Benefit Standards
                  </h4>
                  <p className="text-xs text-indigo-700/90 leading-relaxed">
                    Set standard district-paid insurance contributions, PERA/Medicare rates, work calendar days, and leave allocations. These defaults automatically apply to all newly generated Offer &amp; Total Compensation statements.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      totalCompDefaults: { ...DEFAULT_DISTRICT_CONFIG.totalCompDefaults },
                    })
                  }
                  className="px-3 py-1.5 bg-white border border-indigo-200 hover:bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition shrink-0 cursor-pointer shadow-2xs"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset to Standards
                </button>
              </div>

              {/* 1. Insurance Contributions */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                  1. District-Paid Insurance Contributions
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Health Monthly Contribution ($/mo)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.totalCompDefaults?.healthMonthlyRate ?? 651.2}
                      onChange={(e) =>
                        updateTotalCompDefaults({ healthMonthlyRate: parseFloat(e.target.value) || 0 })
                      }
                      className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-slate-200 bg-white focus:border-blue-500 outline-none"
                    />
                    <span className="text-[10px] text-slate-500">
                      Annual: ${(((formData.totalCompDefaults?.healthMonthlyRate ?? 651.2) * 12).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }))}
                    </span>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Dental Monthly Contribution ($/mo)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.totalCompDefaults?.dentalMonthlyRate ?? 5.0}
                      onChange={(e) =>
                        updateTotalCompDefaults({ dentalMonthlyRate: parseFloat(e.target.value) || 0 })
                      }
                      className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-slate-200 bg-white focus:border-blue-500 outline-none"
                    />
                    <span className="text-[10px] text-slate-500">
                      Annual: ${(((formData.totalCompDefaults?.dentalMonthlyRate ?? 5.0) * 12).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }))}
                    </span>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Life Insurance Annual Premium ($)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.totalCompDefaults?.lifeInsurancePremiumAnnual ?? 0}
                      onChange={(e) =>
                        updateTotalCompDefaults({
                          lifeInsurancePremiumAnnual: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-slate-200 bg-white focus:border-blue-500 outline-none"
                    />
                    <span className="text-[10px] text-slate-500">
                      {(formData.totalCompDefaults?.lifeInsurancePremiumAnnual ?? 0) > 0 ? '$20,000 policy included' : '$0 = Excluded from statement'}
                    </span>
                  </div>
                </div>
              </div>

              {/* 2. Statutory Retirement & Medicare */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                  2. Mandatory Statutory Rates
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Employer PERA Retirement Rate (%)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={((formData.totalCompDefaults?.peraRate ?? 0.214) * 100).toFixed(2)}
                      onChange={(e) =>
                        updateTotalCompDefaults({ peraRate: (parseFloat(e.target.value) || 0) / 100 })
                      }
                      className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-slate-200 bg-white focus:border-blue-500 outline-none"
                    />
                    <span className="text-[10px] text-slate-500">Cañon City Standard: 21.40%</span>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Employer Medicare Rate (%)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={((formData.totalCompDefaults?.medicareRate ?? 0.0145) * 100).toFixed(2)}
                      onChange={(e) =>
                        updateTotalCompDefaults({
                          medicareRate: (parseFloat(e.target.value) || 0) / 100,
                        })
                      }
                      className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-slate-200 bg-white focus:border-blue-500 outline-none"
                    />
                    <span className="text-[10px] text-slate-500">Mandatory Federal: 1.45%</span>
                  </div>
                </div>
              </div>

              {/* 3. Work Schedules */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                  3. Standard Work Schedules &amp; Annual Calendar Days
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Standard Daily Hours
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={formData.totalCompDefaults?.defaultHoursPerDay ?? 8}
                      onChange={(e) =>
                        updateTotalCompDefaults({ defaultHoursPerDay: parseFloat(e.target.value) || 0 })
                      }
                      className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-slate-200 bg-white focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      9-Month Classified Days / Year
                    </label>
                    <input
                      type="number"
                      value={formData.totalCompDefaults?.defaultDays9Month ?? 176}
                      onChange={(e) =>
                        updateTotalCompDefaults({ defaultDays9Month: parseInt(e.target.value, 10) || 0 })
                      }
                      className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-slate-200 bg-white focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      12-Month Classified Days / Year
                    </label>
                    <input
                      type="number"
                      value={formData.totalCompDefaults?.defaultDays12Month ?? 260}
                      onChange={(e) =>
                        updateTotalCompDefaults({
                          defaultDays12Month: parseInt(e.target.value, 10) || 0,
                        })
                      }
                      className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-slate-200 bg-white focus:border-blue-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* 4. Leave Allocations */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                  4. Standard Leave Allocations
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Licensed / 9-Mo Leave Days
                    </label>
                    <input
                      type="number"
                      value={formData.totalCompDefaults?.defaultLeaveDaysLicensed ?? 11}
                      onChange={(e) =>
                        updateTotalCompDefaults({
                          defaultLeaveDaysLicensed: parseInt(e.target.value, 10) || 0,
                          defaultLeaveDays9Month: parseInt(e.target.value, 10) || 0,
                        })
                      }
                      className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-slate-200 bg-white focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      12-Month Leave Days
                    </label>
                    <input
                      type="number"
                      value={formData.totalCompDefaults?.defaultLeaveDays12Month ?? 25}
                      onChange={(e) =>
                        updateTotalCompDefaults({
                          defaultLeaveDays12Month: parseInt(e.target.value, 10) || 0,
                        })
                      }
                      className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-slate-200 bg-white focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      12-Month Paid Holidays
                    </label>
                    <input
                      type="number"
                      value={formData.totalCompDefaults?.defaultHolidaysDays12Month ?? 11}
                      onChange={(e) =>
                        updateTotalCompDefaults({
                          defaultHolidaysDays12Month: parseInt(e.target.value, 10) || 0,
                        })
                      }
                      className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-slate-200 bg-white focus:border-blue-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Protected Leaves Note
                  </label>
                  <input
                    type="text"
                    value={
                      formData.totalCompDefaults?.defaultAdditionalLeavesText ??
                      'Up to 5 Bereavement Days & 5 Professional Days'
                    }
                    onChange={(e) =>
                      updateTotalCompDefaults({ defaultAdditionalLeavesText: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white focus:border-blue-500 outline-none"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50 transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" /> Save Configuration
          </button>
        </div>
      </div>
    </div>
  )
}
