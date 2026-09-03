const PALETTES = {
  light: {
    outer: "#4F7A5B",
    mid: "#1B3328",
    inner: "#D9A441",
    leaf: "#4F7A5B",
    vein: "#3A5F45",
  },
  dark: {
    outer: "#4F7A5B",
    mid: "#D9A441",
    inner: "#EFEBDD",
    leaf: "#D9A441",
    vein: "#B9832E",
  },
} as const;

export function BrandMark({
  size = 20,
  variant = "light",
  className,
}: {
  size?: number;
  variant?: "light" | "dark";
  className?: string;
}) {
  const c = PALETTES[variant];
  return (
    <svg
      viewBox="0 0 120 120"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
    >
      <path
        d="M 21 66 A 40 40 0 0 1 99 66"
        fill="none"
        stroke={c.outer}
        strokeWidth="6"
        strokeLinecap="round"
      />
      <path
        d="M 30 68.5 A 31 31 0 0 1 90 68.5"
        fill="none"
        stroke={c.mid}
        strokeWidth="6"
        strokeLinecap="round"
      />
      <path
        d="M 39 71 A 22 22 0 0 1 81 71"
        fill="none"
        stroke={c.inner}
        strokeWidth="6"
        strokeLinecap="round"
      />
      <path
        d="M 60 68 C 47 74, 45 90, 58 103 C 59.5 104.5, 61 104, 60.5 102 C 74 90, 73 74, 60 68 Z"
        fill={c.leaf}
      />
      <path
        d="M 60 71 C 58 80, 58 92, 60 100"
        fill="none"
        stroke={c.vein}
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.6"
      />
      <path
        d="M 59 100 C 62 103, 65 105, 68 108"
        fill="none"
        stroke={c.leaf}
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
