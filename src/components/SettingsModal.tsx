import React, { useState } from 'react'
import type { DistrictConfig, AdminStaffMember } from '../types/letter'
import {
  Settings,
  X,
  Plus,
  Trash2,
  Save,
  RotateCcw,
  Building2,
  Users,
  ShieldCheck,
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
  const [formData, setFormData] = useState<DistrictConfig>({ ...config })
  const [activeTab, setActiveTab] = useState<'general' | 'staff' | 'signers'>('general')

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

  const handleReset = () => {
    if (confirm('Reset district settings to default Canon City Schools configuration?')) {
      setFormData({ ...DEFAULT_DISTRICT_CONFIG })
    }
  }

  const handleSave = () => {
    onSave(formData)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-700">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">District Stationery & Defaults</h2>
              <p className="text-xs text-slate-500">
                Customize district letterhead, administrative staff roster, and signers.
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
        <div className="px-6 pt-3 border-b border-slate-100 flex gap-4">
          <button
            onClick={() => setActiveTab('general')}
            className={`pb-3 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'general'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-4 h-4" />
            District Info & Mission
          </button>

          <button
            onClick={() => setActiveTab('staff')}
            className={`pb-3 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'staff'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            Admin Staff Header List ({formData.adminStaff.length})
          </button>

          <button
            onClick={() => setActiveTab('signers')}
            className={`pb-3 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'signers'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Default Signatures & CC
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
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={handleReset}
            className="px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1.5 transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset to Defaults
          </button>

          <div className="flex items-center gap-2">
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
    </div>
  )
}
