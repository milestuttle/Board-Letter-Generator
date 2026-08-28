import React from 'react'
import jamieSigImg from '../assets/jamie_signature.png'

interface SignatureProps {
  signerName?: string
  signatureType?: 'authentic' | 'typed' | 'custom'
  customSignatureData?: string
  className?: string
}

export const Signature: React.FC<SignatureProps> = ({
  signerName = 'Jamie Davis',
  signatureType = 'authentic',
  customSignatureData,
  className = '',
}) => {
  if (signatureType === 'custom' && customSignatureData) {
    return (
      <img
        src={customSignatureData}
        alt={`Signature of ${signerName}`}
        className={`h-14 w-auto object-contain ${className}`}
      />
    )
  }

  if (signatureType === 'typed') {
    return (
      <div
        className={`font-['Dancing_Script'] text-3xl font-bold text-gray-900 tracking-wide py-1 select-none ${className}`}
      >
        {signerName}
      </div>
    )
  }

  // Authentic signature image from images folder
  return (
    <div className={`relative inline-block py-1 ${className}`}>
      <img
        src={jamieSigImg}
        alt={`Signature of ${signerName}`}
        className="h-16 w-auto object-contain max-w-[240px] block"
      />
    </div>
  )
}
