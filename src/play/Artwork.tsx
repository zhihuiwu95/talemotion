import { useId } from 'react'
import { mittens, type MittenKind } from './story'

export function Mitten({
  kind,
  mirror = false,
}: {
  kind: MittenKind
  mirror?: boolean
}) {
  const id = useId().replaceAll(':', '')
  const { color, dark } = mittens[kind]
  return (
    <svg
      viewBox="0 0 150 160"
      fill="none"
      aria-hidden="true"
      className="mitten-art"
    >
      <defs>
        <clipPath id={id}>
          <path d="M48 131V81C19 92 13 64 27 57C35 53 44 58 48 61V38C48 8 105 6 109 36L114 116L110 134Z" />
        </clipPath>
      </defs>
      <g transform={mirror ? 'translate(150 0) scale(-1 1)' : undefined}>
        <path
          d="M48 131V81C19 92 13 64 27 57C35 53 44 58 48 61V38C48 8 105 6 109 36L114 116L110 134Z"
          fill={color}
          stroke={dark}
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <g clipPath={`url(#${id})`}>
          {kind === 'stripe' && (
            <g stroke="#ffe5bd" strokeWidth="12">
              <path d="M37 48L115 41M24 81L118 71M41 106L122 100" />
            </g>
          )}
          {kind === 'dot' && (
            <g fill="#e9f7ee">
              {[
                [68, 37],
                [91, 54],
                [65, 70],
                [94, 90],
                [68, 106],
                [33, 65],
              ].map(([cx, cy]) => (
                <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="7" />
              ))}
            </g>
          )}
          {kind === 'star' && (
            <path
              d="M80 45L88 64L108 67L93 81L97 102L79 92L61 102L65 81L50 67L72 64Z"
              fill="#fff8d9"
              stroke="#d39b34"
              strokeWidth="2"
            />
          )}
          <path
            d="M100 24Q110 72 106 122"
            stroke="#fff"
            strokeOpacity=".25"
            strokeWidth="6"
          />
        </g>
        <rect x="44" y="121" width="73" height="26" rx="8" fill={dark} />
        <path
          d="M53 128V140M65 128V140M77 128V140M89 128V140M101 128V140M109 128V140"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
        />
      </g>
    </svg>
  )
}

export function Rabbit({ happy = false }: { happy?: boolean }) {
  return (
    <svg
      viewBox="0 0 250 350"
      fill="none"
      aria-label="穿蓝色制服的朵朵兔子警官"
      role="img"
      className={`rabbit-art ${happy ? 'is-happy' : ''}`}
    >
      <ellipse cx="122" cy="329" rx="75" ry="12" fill="#315e50" opacity=".15" />
      <path
        d="M91 280L86 318Q63 334 103 334L114 321L117 279M145 280L147 317Q133 333 165 334Q183 333 165 315L166 275"
        fill="#285e7c"
        stroke="#234e63"
        strokeWidth="4"
      />
      <path
        d="M74 198Q51 211 49 258Q57 276 71 260L84 232M166 201Q188 205 199 182L215 158"
        fill="#488daa"
        stroke="#2b627b"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <ellipse
        cx="211"
        cy="159"
        rx="17"
        ry="21"
        transform="rotate(30 211 159)"
        fill="#fff6e4"
      />
      <path
        d="M203 149L199 139M210 145L210 132"
        stroke="#dcc9ad"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M79 192Q120 172 164 193L180 281Q128 305 68 280Z"
        fill="#4b96b1"
        stroke="#2b627b"
        strokeWidth="4"
      />
      <path d="M93 188L119 216L137 188" fill="#e9f3e9" />
      <path d="M116 204L126 204L130 234L119 243L111 234Z" fill="#265570" />
      <path
        d="M70 267Q121 279 177 267L179 280Q125 294 69 280Z"
        fill="#28556b"
      />
      <rect x="115" y="271" width="20" height="14" rx="3" fill="#f4c861" />
      <path
        d="M145 211L158 216L155 230L145 236L135 229L133 216Z"
        fill="#f4cc6c"
        stroke="#fff1b7"
        strokeWidth="2"
      />
      <path
        d="M146 216L143 225L148 225"
        stroke="#bc8f34"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <g className="rabbit-head">
        <path
          d="M82 98Q52 34 77 16Q102 9 106 92M129 90Q137 5 162 15Q188 28 153 102"
          fill="#fff6e4"
          stroke="#d6c5ad"
          strokeWidth="3"
        />
        <path
          d="M82 81Q65 35 80 30Q91 31 93 84M140 82Q147 24 159 29Q169 36 150 87"
          fill="#eeb3a5"
        />
        <path
          d="M58 129Q57 88 116 87Q178 83 188 137Q195 190 128 201Q62 204 51 163Q48 145 58 129"
          fill="#fff6e4"
          stroke="#d6c5ad"
          strokeWidth="3"
        />
        <ellipse
          cx="78"
          cy="160"
          rx="17"
          ry="10"
          fill="#f2b3a4"
          opacity=".65"
        />
        <ellipse
          cx="162"
          cy="158"
          rx="17"
          ry="10"
          fill="#f2b3a4"
          opacity=".65"
        />
        {happy ? (
          <g stroke="#334c4b" strokeWidth="5" strokeLinecap="round">
            <path d="M86 143Q95 132 103 143M140 141Q148 131 156 141" />
          </g>
        ) : (
          <g fill="#334c4b">
            <ellipse cx="97" cy="142" rx="5" ry="8" />
            <ellipse cx="146" cy="140" rx="5" ry="8" />
            <circle cx="99" cy="139" r="1.6" fill="white" />
            <circle cx="148" cy="137" r="1.6" fill="white" />
          </g>
        )}
        <path d="M113 155Q121 149 129 155L121 164Z" fill="#c88679" />
        <path
          d="M121 163V170M121 170Q110 179 104 168M121 170Q132 179 138 167"
          stroke="#83695b"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M62 107Q52 78 113 74Q170 70 181 96L167 115Z"
          fill="#397f9e"
          stroke="#2a6079"
          strokeWidth="3"
        />
        <path
          d="M61 106Q115 91 176 106Q179 122 144 123L69 118Z"
          fill="#285872"
        />
        <path d="M114 81L125 85L124 99L115 104L106 97L105 86Z" fill="#f4cc6c" />
        <path d="M113 88L117 89L114 97" stroke="#ac8030" strokeWidth="2" />
      </g>
    </svg>
  )
}

export function Friend({
  animal,
  happy = false,
}: {
  animal: 'bear' | 'fox' | 'cat'
  happy?: boolean
}) {
  const color =
    animal === 'bear' ? '#ba8b66' : animal === 'fox' ? '#d88b57' : '#a5aca7'
  return (
    <svg
      viewBox="0 0 180 230"
      fill="none"
      aria-hidden="true"
      className="friend-art"
    >
      <ellipse cx="91" cy="216" rx="55" ry="8" fill="#315e50" opacity=".15" />
      <path
        d="M61 173L55 210Q62 222 77 213L81 179M106 179L110 213Q130 222 133 209L124 172"
        fill={color}
      />
      <path
        d="M57 128Q90 112 124 128L135 189Q90 205 46 188Z"
        fill={
          animal === 'bear'
            ? '#c88171'
            : animal === 'fox'
              ? '#7fa292'
              : '#bcab72'
        }
      />
      <path
        d="M53 138L36 168M128 138L144 166"
        stroke={color}
        strokeWidth="21"
        strokeLinecap="round"
      />
      {animal === 'bear' ? (
        <g fill={color} stroke="#986e53" strokeWidth="3">
          <circle cx="48" cy="54" r="23" />
          <circle cx="128" cy="54" r="23" />
        </g>
      ) : (
        <g fill={color} stroke="#8d8070" strokeWidth="2">
          <path d="M38 73L30 23L75 47M106 47L144 24L142 79" />
        </g>
      )}
      <path
        d="M35 83Q34 43 90 43Q145 43 146 88Q156 136 92 146Q25 139 35 83Z"
        fill={color}
      />
      <ellipse cx="91" cy="113" rx="34" ry="24" fill="#fae9ce" />
      {happy ? (
        <g stroke="#493e37" strokeWidth="4" strokeLinecap="round">
          <path d="M55 88Q64 79 72 88M110 88Q119 79 126 88" />
        </g>
      ) : (
        <g fill="#493e37">
          <ellipse cx="65" cy="87" rx="4" ry="6" />
          <ellipse cx="117" cy="87" rx="4" ry="6" />
        </g>
      )}
      <path d="M83 105Q91 100 99 105L91 113Z" fill="#755747" />
      <path
        d="M91 112V120M91 120Q81 127 76 119M91 120Q99 127 104 119"
        stroke="#755747"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path d="M63 139Q86 150 117 140" stroke="#f7e2b0" strokeWidth="13" />
      <path d="M109 145L111 174" stroke="#f7e2b0" strokeWidth="13" />
    </svg>
  )
}

export function Forest() {
  return (
    <svg
      className="forest-art"
      viewBox="0 0 760 650"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <rect width="760" height="650" fill="#d6e9e4" />
      <circle cx="585" cy="95" r="49" fill="#fff3ba" />
      <g fill="#f2f7e9" opacity=".85">
        <path d="M65 96Q80 63 107 81Q139 51 160 80Q193 73 202 100Z" />
        <path d="M370 68Q390 41 408 58Q440 32 454 62Q477 53 490 74Z" />
      </g>
      <path d="M0 247Q165 119 322 234Q479 113 760 235V650H0Z" fill="#b5d2bd" />
      <path d="M0 348Q202 220 389 323Q578 219 760 305V650H0Z" fill="#92b89a" />
      <g stroke="#6a8d76" strokeWidth="13" strokeLinecap="round">
        <path d="M65 381V109M684 375V114M717 402V188" />
      </g>
      <g fill="#759f86">
        <ellipse cx="62" cy="161" rx="75" ry="126" />
        <ellipse cx="683" cy="161" rx="74" ry="112" />
        <ellipse cx="726" cy="225" rx="56" ry="105" />
      </g>
      <g fill="none" stroke="#9bb79a" strokeWidth="5" strokeLinecap="round">
        <path d="M63 317V109M63 223L30 187M63 183L90 154M681 298V99M681 178L710 144M681 229L651 197" />
      </g>
      <g transform="translate(405 213)">
        <path d="M-7 85L108 -4L229 87Z" fill="#406f70" />
        <path d="M8 78L107 7L213 80V231H8Z" fill="#f5e9c9" />
        <path
          d="M-9 86L107 0L231 87"
          fill="none"
          stroke="#355f63"
          strokeWidth="16"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M79 232V144Q107 112 138 144V232" fill="#78a5a4" />
        <circle cx="126" cy="190" r="4" fill="#f7cf72" />
        <rect
          x="28"
          y="117"
          width="33"
          height="41"
          rx="7"
          fill="#bdd1bd"
          stroke="#c6b794"
          strokeWidth="5"
        />
        <rect
          x="158"
          y="117"
          width="33"
          height="41"
          rx="7"
          fill="#bdd1bd"
          stroke="#c6b794"
          strokeWidth="5"
        />
        <rect x="50" y="71" width="119" height="29" rx="6" fill="#fff6de" />
        <text
          x="110"
          y="91"
          textAnchor="middle"
          fontSize="15"
          fill="#426c66"
          fontFamily="sans-serif"
          letterSpacing="3"
        >
          森林服务站
        </text>
        <path
          d="M0 230H222"
          stroke="#b6aa82"
          strokeWidth="9"
          strokeLinecap="round"
        />
      </g>
      <path d="M0 455Q143 393 313 444Q497 401 760 472V650H0Z" fill="#aec594" />
      <path
        d="M513 442Q312 449 348 526Q411 595 229 650H606Q602 554 487 518Q426 486 548 447Z"
        fill="#e8d6ae"
      />
      <g fill="#6f9a79">
        <ellipse cx="34" cy="463" rx="72" ry="47" />
        <ellipse cx="725" cy="481" rx="76" ry="44" />
        <path d="M0 610Q104 522 195 624L199 650H0Z" />
        <path d="M590 650Q673 544 760 589V650Z" />
      </g>
      <g stroke="#66866c" strokeWidth="3" strokeLinecap="round">
        <path d="M212 516L207 503M212 516L219 499M642 544L637 528M642 544L650 533M79 546L72 531M79 546L86 533" />
      </g>
      <g fill="#fbebad">
        <circle cx="193" cy="564" r="5" />
        <circle cx="181" cy="577" r="4" />
        <circle cx="651" cy="499" r="5" />
        <circle cx="666" cy="509" r="4" />
      </g>
      <g fill="#fff8df">
        <path d="M319 136q9 -12 19 0q9 -12 19 0q-10 -6 -19 6q-9 -12 -19 -6" />
      </g>
    </svg>
  )
}

export function Icon({
  name,
}: {
  name: 'sound' | 'muted' | 'repeat' | 'pause' | 'arrow' | 'leaf'
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {name === 'sound' || name === 'muted' ? (
        <>
          <path d="M11 5L6 9H3V15H6L11 19Z" />
          {name === 'sound' ? (
            <>
              <path d="M15 8Q19 12 15 16M18 5Q25 12 18 19" />
            </>
          ) : (
            <path d="M16 9L22 15M22 9L16 15" />
          )}
        </>
      ) : name === 'repeat' ? (
        <>
          <path d="M4 10A8 8 0 1 1 5 18M4 4V10H10" />
        </>
      ) : name === 'pause' ? (
        <>
          <path d="M8 5V19M16 5V19" />
        </>
      ) : name === 'arrow' ? (
        <path d="M4 12H20M14 6L20 12L14 18" />
      ) : (
        <>
          <path d="M19 4Q3 2 5 14Q13 24 19 4ZM5 20L14 10" />
        </>
      )}
    </svg>
  )
}
