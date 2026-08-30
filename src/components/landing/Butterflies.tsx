const SPECS = [
  { top: "18%", delay: "0s", size: 22, duration: "16s" },
  { top: "38%", delay: "2.4s", size: 16, duration: "18s" },
  { top: "58%", delay: "1.1s", size: 26, duration: "20s" },
  { top: "72%", delay: "3.6s", size: 18, duration: "22s" },
  { top: "28%", delay: "5s", size: 14, duration: "24s" },
];

// TODO(hero): this SVG butterfly drift is a placeholder signature element.
// Swap in the real forest-walk video with butterflies once that asset is
// ready — layer this animation on top if it still reads well over real
// footage, or drop it if it doesn't (see build brief, Task 1 / design tokens).
export function Butterflies() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {SPECS.map((b, i) => (
        <svg
          key={i}
          viewBox="0 0 40 32"
          width={b.size}
          height={b.size}
          className="absolute left-0 animate-eflow-drift"
          style={{ top: b.top, animationDelay: b.delay, animationDuration: b.duration }}
        >
          <g className="origin-center animate-eflow-flap">
            <ellipse cx="12" cy="14" rx="11" ry="9" fill="#D9A441" opacity="0.85" />
            <ellipse cx="28" cy="14" rx="11" ry="9" fill="#D9A441" opacity="0.85" />
          </g>
          <ellipse cx="20" cy="16" rx="2" ry="9" fill="#17251C" opacity="0.7" />
        </svg>
      ))}
    </div>
  );
}
