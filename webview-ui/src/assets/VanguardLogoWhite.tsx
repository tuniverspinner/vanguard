import { SVGProps } from "react"

const VanguardLogoWhite = (props: SVGProps<SVGSVGElement>) => (
	<svg fill="none" height="64" viewBox="0 0 128 128" width="64" xmlns="http://www.w3.org/2000/svg" {...props}>
		{/* Shield base */}
		<path
			d="M64 8 L108 28 L108 80 C108 104 88 116 64 124 C40 116 20 104 20 80 L20 28 Z"
			fill="#ffffff"
			stroke="#e5e7eb"
			strokeWidth="2"
		/>

		{/* Shield highlight */}
		<path d="M64 8 L108 28 L108 50 L64 32 Z" fill="#f9fafb" opacity="0.8" />

		{/* Inner shield border */}
		<path
			d="M64 20 L96 36 L96 76 C96 92 84 100 64 106 C44 100 32 92 32 76 L32 36 Z"
			fill="none"
			stroke="#d1d5db"
			strokeWidth="1"
		/>

		{/* Circuit pattern representing technology */}
		<g opacity="0.6" stroke="#9ca3af" strokeWidth="1">
			{/* Top circuit */}
			<path d="M44 40 L52 40 L52 48 L60 48" />
			<circle cx="44" cy="40" fill="#9ca3af" r="1.5" />
			<circle cx="52" cy="48" fill="#9ca3af" r="1.5" />
			<circle cx="60" cy="48" fill="#9ca3af" r="1.5" />

			{/* Middle circuit */}
			<path d="M68 52 L76 52 L76 60 L84 60" />
			<circle cx="68" cy="52" fill="#9ca3af" r="1.5" />
			<circle cx="76" cy="60" fill="#9ca3af" r="1.5" />
			<circle cx="84" cy="60" fill="#9ca3af" r="1.5" />

			{/* Bottom circuit */}
			<path d="M44 64 L52 64 L52 72 L60 72" />
			<circle cx="44" cy="64" fill="#9ca3af" r="1.5" />
			<circle cx="52" cy="72" fill="#9ca3af" r="1.5" />
			<circle cx="60" cy="72" fill="#9ca3af" r="1.5" />
		</g>

		{/* Central AI brain/spark symbol */}
		<g transform="translate(64, 70)">
			{/* Neural network nodes */}
			<circle cx="-8" cy="-8" fill="#fbbf24" r="2" />
			<circle cx="8" cy="-8" fill="#fbbf24" r="2" />
			<circle cx="0" cy="0" fill="#f59e0b" r="3" />
			<circle cx="-8" cy="8" fill="#fbbf24" r="2" />
			<circle cx="8" cy="8" fill="#fbbf24" r="2" />

			{/* Neural connections */}
			<line stroke="#fbbf24" strokeWidth="1" x1="-8" x2="0" y1="-8" y2="0" />
			<line stroke="#fbbf24" strokeWidth="1" x1="8" x2="0" y1="-8" y2="0" />
			<line stroke="#fbbf24" strokeWidth="1" x1="-8" x2="0" y1="8" y2="0" />
			<line stroke="#fbbf24" strokeWidth="1" x1="8" x2="0" y1="8" y2="0" />
		</g>

		{/* Retry arrows symbol */}
		<g transform="translate(64, 50)">
			{/* Circular arrow */}
			<path d="M -6 0 A 6 6 0 1 1 6 0 A 6 6 0 1 1 -6 0" fill="none" stroke="#10b981" strokeWidth="2" />
			<polygon fill="#10b981" points="6,-2 10,0 6,2" />
		</g>

		{/* Shield emblem text */}
		<text fill="#1f2937" fontFamily="Arial, sans-serif" fontSize="10" fontWeight="bold" textAnchor="middle" x="64" y="100">
			VANGUARD
		</text>
	</svg>
)

export default VanguardLogoWhite
