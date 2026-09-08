export function ActivityArt({ item }: { item: string }) {
  const small = item.startsWith('small')
  return (
    <svg
      viewBox="0 0 240 180"
      className="activity-art"
      aria-hidden="true"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {item.includes('bowl') && (
        <g transform={small ? 'translate(54 57) scale(.55)' : 'translate(0 0)'}>
          <ellipse cx="120" cy="153" rx="88" ry="8" fill="#285e6012" />
          <path
            d="M28 60H212Q207 149 120 151Q33 149 28 60Z"
            fill="#e9b951"
            stroke="#a27732"
            strokeWidth="4"
          />
          <ellipse
            cx="120"
            cy="60"
            rx="92"
            ry="23"
            fill="#fff2ce"
            stroke="#a27732"
            strokeWidth="4"
          />
          <path d="M46 94Q120 126 194 94" stroke="#fff2ce" strokeWidth="8" />
        </g>
      )}
      {item.includes('cup') && (
        <g transform={small ? 'translate(54 57) scale(.55)' : undefined}>
          <path
            d="M173 55H195Q228 55 220 90Q215 115 177 114"
            stroke="#3c809c"
            strokeWidth="14"
          />
          <path
            d="M50 32H180L170 145Q116 170 59 145Z"
            fill="#77b9cf"
            stroke="#3c809c"
            strokeWidth="4"
          />
          <ellipse
            cx="115"
            cy="32"
            rx="65"
            ry="15"
            fill="#d5edf0"
            stroke="#3c809c"
            strokeWidth="4"
          />
          <path d="M73 63L78 127" stroke="#e8f6ec" strokeWidth="9" />
        </g>
      )}
      {item.includes('mat') && (
        <g transform={small ? 'translate(54 45) scale(.55)' : undefined}>
          <path
            d="M48 28L211 47L195 155L22 127Z"
            fill="#ed846b"
            stroke="#b95342"
            strokeWidth="4"
          />
          <path
            d="M87 35L62 133M131 40L108 141M174 46L155 148M37 64L205 87M31 100L200 122"
            stroke="#ffe5bd"
            strokeWidth="9"
          />
        </g>
      )}
      {item.startsWith('ball-') && (
        <>
          {item === 'ball-in' || item === 'ball-out' ? (
            <>
              <path
                d="M36 77L92 57L159 80L102 104Z"
                fill="#947955"
                stroke="#725c42"
                strokeWidth="3"
              />
              {item === 'ball-in' && <Ball x={99} y={78} />}
              <path
                d="M36 77L102 104L159 80V144L100 166L36 140Z"
                fill="#d0ae7d"
                stroke="#725c42"
                strokeWidth="3"
              />
              <path d="M102 104V165" stroke="#ae8657" strokeWidth="3" />
              {item === 'ball-out' && <Ball x={198} y={137} />}
            </>
          ) : (
            <>
              <path
                d="M57 76L48 165M177 76L188 165"
                stroke="#947955"
                strokeWidth="13"
              />
              <rect
                x="38"
                y="65"
                width="161"
                height="22"
                rx="9"
                fill="#c4a171"
                stroke="#725c42"
                strokeWidth="3"
              />
              <Ball x={119} y={item === 'ball-on' ? 42 : 139} />
            </>
          )}
        </>
      )}
      {item === 'pillow' && (
        <path
          d="M35 37Q120 19 205 37Q182 91 205 145Q122 161 35 145Q55 89 35 37Z"
          fill="#b1accf"
          stroke="#777399"
          strokeWidth="4"
        />
      )}
      {item === 'can' && <Can />}
      {item === 'fill' && (
        <>
          <g transform="translate(20 52) scale(.75)">
            <Can />
          </g>
          <path d="M150 20H116V44H152" stroke="#8eaaaa" strokeWidth="16" />
          <path d="M139 53V82M126 59V85" stroke="#77b9cf" strokeWidth="7" />
          <path d="M131 11V27M119 11H143" stroke="#47745f" strokeWidth="6" />
        </>
      )}
      {item === 'water' && (
        <>
          <g transform="translate(-8 -8) scale(.6) rotate(20 120 90)">
            <Can />
          </g>
          <path
            d="M127 87L155 117M142 81L168 109M133 102L146 118"
            stroke="#77b9cf"
            strokeWidth="5"
          />
          <path
            d="M145 132H219L209 175H155Z"
            fill="#ed846b"
            stroke="#b95342"
            strokeWidth="3"
          />
          <ellipse cx="182" cy="132" rx="37" ry="9" fill="#947955" />
          <path d="M184 130V66" stroke="#47745f" strokeWidth="5" />
          <path
            d="M184 105Q149 70 156 105Q169 123 184 113M184 94Q218 64 211 97Q197 108 184 104"
            fill="#8eaf78"
          />
          <circle cx="184" cy="59" r="20" fill="#efbd53" />
          <circle cx="184" cy="59" r="8" fill="#b1802a" />
        </>
      )}
    </svg>
  )
}
function Ball({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <circle
        cx={x}
        cy={y}
        r="22"
        fill="#ed846b"
        stroke="#b95342"
        strokeWidth="3"
      />
      <path
        d={`M${x - 17} ${y - 12}Q${x} ${y + 4} ${x + 19} ${y - 9}`}
        stroke="#ffe5bd"
        strokeWidth="6"
      />
      <circle cx={x - 7} cy={y - 9} r="4" fill="#fff7df" />
    </g>
  )
}
function Can() {
  return (
    <g>
      <path
        d="M78 68Q21 40 25 98Q24 130 72 132"
        stroke="#3c809c"
        strokeWidth="12"
      />
      <path
        d="M142 101L197 58L211 71L163 138"
        fill="#77b9cf"
        stroke="#3c809c"
        strokeWidth="4"
      />
      <path
        d="M70 63H161L173 150Q120 174 62 150Z"
        fill="#77b9cf"
        stroke="#3c809c"
        strokeWidth="4"
      />
      <ellipse
        cx="116"
        cy="63"
        rx="45"
        ry="12"
        fill="#d5edf0"
        stroke="#3c809c"
        strokeWidth="4"
      />
      <path d="M199 55L217 76" stroke="#47745f" strokeWidth="10" />
      <path d="M85 97V139" stroke="#d5edf0" strokeWidth="8" />
    </g>
  )
}
