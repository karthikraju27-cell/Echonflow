export function FlowArtwork() {
  return (
    <div className="flow-artwork" aria-hidden="true">
      <svg viewBox="0 0 500 500" fill="none">
        <g className="flow-orbits" stroke="currentColor">
          <circle cx="250" cy="250" r="208" strokeOpacity=".18" />
          <circle cx="250" cy="250" r="172" strokeOpacity=".24" />
          <circle cx="250" cy="250" r="136" strokeOpacity=".32" />
          <path d="M42 250a208 208 0 0 1 208-208" strokeWidth="2" />
          <circle cx="250" cy="42" r="5" fill="currentColor" stroke="none" />
          <circle cx="422" cy="250" r="3" fill="currentColor" stroke="none" />
        </g>
        <g className="flow-symbol" strokeLinecap="round">
          <path d="M145 265a108 108 0 0 1 210 0" stroke="#7C9B72" strokeWidth="13" />
          <path d="M170 271a82 82 0 0 1 160 0" stroke="#D9A441" strokeWidth="13" />
          <path d="M195 278a57 57 0 0 1 110 0" stroke="#EFEBDD" strokeWidth="13" />
          <path d="M250 270c-39 20-43 59-5 91 35-28 43-68 5-91Z" fill="#D9A441" />
          <path d="M250 282c-7 26-6 58 15 78" stroke="#1B3328" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}
