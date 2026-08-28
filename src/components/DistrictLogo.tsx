import React from 'react'

interface DistrictLogoProps {
  className?: string
  width?: number | string
  height?: number | string
}

export const DistrictLogo: React.FC<DistrictLogoProps> = ({
  className = '',
  width = 120,
  height = 120,
}) => {
  return (
    <svg
      viewBox="0 0 200 200"
      width={width}
      height={height}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      style={{ overflow: 'visible' }}
    >
      <defs>
        {/* Top curved path for CAÑON CITY SCHOOLS */}
        <path
          id="top-arc"
          d="M 28 100 A 72 72 0 0 1 172 100"
          fill="none"
        />
        {/* Bottom curved path for FREMONT RE-1 */}
        <path
          id="bottom-arc"
          d="M 165 105 A 72 72 0 0 1 35 105"
          fill="none"
        />
        <filter id="subtle-shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="1" dy="1" stdDeviation="0.8" floodOpacity="0.3" />
        </filter>
      </defs>

      {/* Outer concentric rings */}
      <circle cx="100" cy="100" r="92" fill="#ffffff" stroke="#222222" strokeWidth="2.5" />
      <circle cx="100" cy="100" r="73" fill="#ffffff" stroke="#333333" strokeWidth="1.2" strokeDasharray="2,2" />

      {/* Top Arc Text */}
      <text
        fontFamily="serif, 'Times New Roman', Georgia"
        fontSize="14.5"
        fontWeight="bold"
        fill="#1a1a1a"
        letterSpacing="2.8"
      >
        <textPath href="#top-arc" startOffset="50%" textAnchor="middle">
          CAÑON CITY SCHOOLS
        </textPath>
      </text>

      {/* Bottom Arc Text */}
      <text
        fontFamily="serif, 'Times New Roman', Georgia"
        fontSize="13"
        fontWeight="bold"
        fill="#1a1a1a"
        letterSpacing="2.2"
      >
        <textPath href="#bottom-arc" startOffset="50%" textAnchor="middle">
          FREMONT RE-1
        </textPath>
      </text>

      {/* Center Illustrated Oval Badge */}
      <g transform="translate(100, 100) rotate(-3)">
        {/* Colorful Organic Scribble Oval Outline */}
        <path
          d="M -58 -32 C -40 -46, 35 -45, 55 -28 C 68 -15, 65 18, 52 30 C 35 44, -38 42, -54 28 C -68 14, -68 -16, -58 -32 Z"
          fill="#fbfbee"
          stroke="#4a9b3f"
          strokeWidth="3.5"
        />
        <path
          d="M -56 -30 C -38 -44, 33 -43, 53 -26 C 66 -13, 63 20, 50 32 C 33 46, -40 44, -56 30 C -70 16, -66 -14, -56 -30 Z"
          fill="none"
          stroke="#d64024"
          strokeWidth="1.8"
          opacity="0.8"
        />

        {/* LEARNING Banner text */}
        <g transform="translate(0, -6)">
          <text
            x="0"
            y="0"
            textAnchor="middle"
            fontFamily="'Impact', 'Arial Black', sans-serif"
            fontSize="23"
            fontWeight="900"
            letterSpacing="1.2"
            fill="#d87a18"
            stroke="#1a1a1a"
            strokeWidth="1.2"
            paintOrder="stroke fill"
          >
            LEARNING
          </text>
          {/* Inner multi-color accent highlight */}
          <text
            x="0"
            y="0"
            textAnchor="middle"
            fontFamily="'Impact', 'Arial Black', sans-serif"
            fontSize="23"
            fontWeight="900"
            letterSpacing="1.2"
            fill="url(#rainbow-grad)"
            opacity="0.4"
          >
            LEARNING
          </text>
        </g>

        {/* FOR LIFE! Banner text */}
        <g transform="translate(0, 20)">
          <text
            x="0"
            y="0"
            textAnchor="middle"
            fontFamily="'Impact', 'Arial Black', sans-serif"
            fontSize="21"
            fontWeight="900"
            letterSpacing="1.5"
            fill="#7b22a0"
            stroke="#1a1a1a"
            strokeWidth="1.2"
            paintOrder="stroke fill"
          >
            FOR LIFE!
          </text>
        </g>
      </g>
    </svg>
  )
}
