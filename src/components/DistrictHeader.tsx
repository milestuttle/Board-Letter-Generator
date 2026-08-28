import React from 'react'
import type { DistrictConfig } from '../types/letter'
import { DistrictLogo } from './DistrictLogo'
import letterheadImg from '../assets/letterhead.png'

interface DistrictHeaderProps {
  config: DistrictConfig
}

export const DistrictHeader: React.FC<DistrictHeaderProps> = ({ config }) => {
  // Use the official scanned/extracted letterhead image dropped by the user by default
  if (config.headerType !== 'vector') {
    return (
      <div className="district-letterhead w-full mb-3.5 select-none block">
        <img
          src={letterheadImg}
          alt="Cañon City Schools Official Letterhead"
          className="w-full h-auto object-contain block district-letterhead-img"
          style={{ maxHeight: '1.25in' }}
        />
      </div>
    )
  }

  // Fallback: Dynamic HTML/Vector Header
  return (
    <header className="w-full text-black font-sans pb-2 border-b-2 border-gray-800/80 mb-3.5">
      <div className="grid grid-cols-[115px_1fr_195px] items-start gap-3">
        {/* Left: District Seal Logo */}
        <div className="flex justify-start items-center pt-1">
          <DistrictLogo width={110} height={110} />
        </div>

        {/* Center: District Title and Address */}
        <div className="text-center px-1">
          <h1 className="font-serif text-[21px] font-bold tracking-[0.04em] text-gray-950 uppercase leading-none mb-1">
            {config.districtName}
          </h1>
          <div className="text-[10px] tracking-[0.18em] font-semibold text-gray-700 uppercase mb-2">
            {config.districtSubtitle}
          </div>

          <div className="text-[10.5px] leading-tight text-gray-800 font-normal">
            <div>{config.addressLine1}</div>
            <div>{config.cityStateZip}</div>
            <div className="mt-1 flex items-center justify-center space-x-3 text-[10px] text-gray-700 font-sans">
              <span>Phone {config.phone}</span>
              <span>Fax {config.fax}</span>
            </div>
          </div>
        </div>

        {/* Right: Administrative Staff Roster */}
        <div className="text-right text-[8.5px] leading-[1.25] text-gray-800 font-sans border-l border-gray-200/80 pl-2">
          <div className="font-bold text-[9px] uppercase tracking-wider text-gray-950 mb-1 border-b border-gray-300 pb-0.5">
            Administrative Staff
          </div>
          <div className="space-y-[3px]">
            {config.adminStaff.map((staff) => (
              <div key={staff.id}>
                <div className="font-bold text-gray-900 tracking-tight">{staff.name}</div>
                <div className="text-gray-600 text-[8px] italic">{staff.title}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </header>
  )
}
