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
        className={`h-12 w-auto object-contain ${className}`}
      />
    )
  }

  if (signatureType === 'typed') {
    return (
      <div
        className={`font-['Dancing_Script'] text-2xl font-bold text-gray-900 tracking-wide py-0.5 select-none ${className}`}
      >
        {signerName}
      </div>
    )
  }

  // Authentic signature image from images folder
  return (
    <div className={`relative inline-block py-0.5 ${className}`}>
      <img
        src={jamieSigImg}
        alt={`Signature of ${signerName}`}
        className="h-13 w-auto object-contain max-w-[210px] block"
      />
    </div>
  )
}
