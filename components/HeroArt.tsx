// Hero motif: a ship's wheel at the centre of a sonar sweep, with candidate
// dots on the rings — one "matched" and pulled toward the helm. Pure inline SVG,
// no assets, scales cleanly. This is Crembers' signature mark for the landing.

export default function HeroArt({ className }: { className?: string }) {
  const cx = 130;
  const cy = 130;
  const spokes = [0, 45, 90, 135, 180, 225, 270, 315];

  // Candidate dots scattered on the outer field.
  const dots = [
    { x: 44, y: 60, r: 4, on: false },
    { x: 214, y: 74, r: 4, on: false },
    { x: 232, y: 168, r: 5, on: true },
    { x: 60, y: 208, r: 4, on: false },
    { x: 30, y: 138, r: 4, on: false },
  ];

  return (
    <svg
      viewBox="0 0 260 260"
      className={className}
      role="img"
      aria-label="A ship's wheel at the centre of a matching field"
    >
      {/* sonar rings */}
      {[112, 84, 56].map((r, i) => (
        <circle
          key={r}
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="#12557e"
          strokeWidth="1"
          strokeOpacity={0.12 + i * 0.05}
        />
      ))}

      {/* sweep wedge */}
      <path
        d={`M${cx} ${cy} L${cx} ${cy - 112} A112 112 0 0 1 ${
          cx + 112 * Math.sin((50 * Math.PI) / 180)
        } ${cy - 112 * Math.cos((50 * Math.PI) / 180)} Z`}
        fill="#12557e"
        fillOpacity="0.06"
      />

      {/* connecting line to the matched candidate */}
      <line
        x1={cx}
        y1={cy}
        x2={dots[2].x}
        y2={dots[2].y}
        stroke="#c8862d"
        strokeWidth="1.4"
        strokeDasharray="3 4"
        strokeOpacity="0.8"
      />

      {/* candidate dots */}
      {dots.map((d, i) => (
        <g key={i}>
          {d.on && (
            <circle cx={d.x} cy={d.y} r={d.r + 6} fill="#c8862d" fillOpacity="0.15" />
          )}
          <circle
            cx={d.x}
            cy={d.y}
            r={d.r}
            fill={d.on ? "#c8862d" : "#12557e"}
            fillOpacity={d.on ? 1 : 0.35}
          />
        </g>
      ))}

      {/* ship's wheel */}
      <g stroke="#0b1f33" strokeWidth="2.4" fill="none">
        <circle cx={cx} cy={cy} r="30" />
        {spokes.map((deg) => (
          <g key={deg} transform={`rotate(${deg} ${cx} ${cy})`}>
            <line
              x1={cx}
              y1={cy - 30}
              x2={cx}
              y2={cy - 44}
              strokeLinecap="round"
            />
            <circle cx={cx} cy={cy - 47} r="4" />
          </g>
        ))}
      </g>
      <circle cx={cx} cy={cy} r="9" fill="#0b1f33" />
      <circle cx={cx} cy={cy} r="3.5" fill="#f4f7f9" />
    </svg>
  );
}
