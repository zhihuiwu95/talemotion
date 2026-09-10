import { Friend, Mitten } from './Artwork'

export function WinterWorld() {
  return (
    <svg
      className="winter-world"
      viewBox="0 0 900 650"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <rect width="900" height="650" fill="#dceef5" />
      <circle className="winter-sun" cx="702" cy="112" r="49" fill="#fff5c9" />
      <path d="M0 310Q170 160 360 290Q600 125 900 290V650H0Z" fill="#b8d5db" />
      <path d="M0 380Q270 240 470 340Q690 255 900 350V650H0Z" fill="#d1e3e4" />
      {[
        [-35, 200, 1.3],
        [115, 235, 0.8],
        [720, 195, 1.4],
        [830, 270, 0.85],
        [210, 230, 1],
        [570, 240, 1],
      ].map(([x, y, s], i) => (
        <g
          key={i}
          className={i < 4 ? 'wide-tree' : 'narrow-tree'}
          transform={`translate(${x} ${y}) scale(${s})`}
        >
          <path d="M65 20V210" stroke="#688e8d" strokeWidth="12" />
          <path
            d="M65-115L2 10H30L-6 79H22L-24 155H154L108 79H136L100 10H128Z"
            fill={i % 2 ? '#739e98' : '#507f7d'}
          />
          <path
            d="M65-115L26-38Q60-18 103-38ZM7 54L-6 79H22L9 100Q67 115 121 100L108 79H136L123 54Q63 73 7 54Z"
            fill="#f7fcfa"
          />
        </g>
      ))}
      <path d="M0 460Q180 360 380 442Q680 340 900 444V650H0Z" fill="#f4fbfc" />
      <path d="M0 575Q255 485 495 576Q720 494 900 544V650H0Z" fill="#e5f1f5" />
      <g fill="#fff" opacity=".9">
        {Array.from({ length: 18 }, (_, i) => (
          <circle
            key={i}
            cx={(i * 137 + 40) % 900}
            cy={(i * 83 + 25) % 440}
            r={(i % 3) + 2}
          />
        ))}
      </g>
    </svg>
  )
}
export function DressedBear({ warm = false }: { warm?: boolean }) {
  return (
    <div className={`dressed-bear ${warm ? 'warm-bear' : 'cold-bear'}`}>
      <Friend animal="bear" happy={warm} />
      <span className="bear-mitten mitten-left">
        <Mitten kind="stripe" />
      </span>
      {warm && (
        <span className="bear-mitten mitten-right">
          <Mitten kind="stripe" mirror />
        </span>
      )}
      {!warm && (
        <span className="cold-breath" aria-hidden="true">
          ﹏
        </span>
      )}
    </div>
  )
}
export function PineBranch() {
  return (
    <svg viewBox="0 0 200 200" aria-hidden="true">
      <path
        d="M105 15L95 180"
        stroke="#826d58"
        strokeWidth="12"
        strokeLinecap="round"
      />
      <path
        d="M100 4L37 91H65L14 161Q97 190 184 160L132 92H160Z"
        fill="#548b83"
      />
      <path
        d="M100 4L70 47Q95 61 132 49ZM46 120L14 161Q97 190 184 160L159 124Q99 149 46 120Z"
        fill="#fcffff"
      />
      <ellipse
        cx="132"
        cy="135"
        rx="15"
        ry="22"
        fill="#aa7954"
        transform="rotate(-20 132 135)"
      />
      <path
        d="M125 123L143 128M120 134L143 139M124 145L140 147"
        stroke="#795a42"
        strokeWidth="3"
      />
    </svg>
  )
}
export function SnowPile() {
  return (
    <svg viewBox="0 0 260 160" aria-hidden="true">
      <ellipse cx="130" cy="134" rx="120" ry="16" fill="#abcbd6" opacity=".4" />
      <path
        d="M12 130Q21 73 66 85Q86 15 146 47Q195 39 211 91Q247 92 250 132Z"
        fill="#fff"
        stroke="#c2dce5"
        strokeWidth="3"
      />
      <path
        d="M53 111Q81 101 102 108M143 75Q167 72 181 89"
        fill="none"
        stroke="#e1eef2"
        strokeWidth="6"
        strokeLinecap="round"
      />
    </svg>
  )
}
export function Robin() {
  return (
    <svg viewBox="0 0 120 100" aria-hidden="true">
      <path d="M29 69L8 81L15 55" fill="#718d88" />
      <ellipse cx="60" cy="55" rx="35" ry="29" fill="#8caaa0" />
      <ellipse cx="74" cy="65" rx="22" ry="21" fill="#ec9c7b" />
      <circle cx="80" cy="44" r="4" fill="#294e57" />
      <path d="M93 49L113 58L94 63" fill="#deb659" />
      <path d="M39 44Q74 38 60 72Q43 76 39 44Z" fill="#557f77" />
      <path d="M56 84L53 94M74 84L79 94" stroke="#765d48" strokeWidth="3" />
    </svg>
  )
}
export function Snowman({ complete = true }: { complete?: boolean }) {
  return (
    <svg viewBox="0 0 230 270" aria-hidden="true">
      <ellipse cx="117" cy="250" rx="91" ry="15" fill="#a6c7d3" opacity=".35" />
      <circle
        cx="115"
        cy="177"
        r="72"
        fill="#fff"
        stroke="#c4dce3"
        strokeWidth="3"
      />
      {complete && (
        <g className="snowman-head">
          <circle
            cx="115"
            cy="77"
            r="50"
            fill="#fff"
            stroke="#c4dce3"
            strokeWidth="3"
          />
          <circle cx="97" cy="69" r="4" fill="#345969" />
          <circle cx="132" cy="69" r="4" fill="#345969" />
          <path d="M113 80L161 92L113 96Z" fill="#e9a053" />
          <path
            d="M93 101Q114 120 137 104"
            fill="none"
            stroke="#345969"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M73 27L80 4H145L151 28M64 30H163"
            fill="#507f7d"
            stroke="#507f7d"
            strokeWidth="8"
            strokeLinecap="round"
          />
        </g>
      )}
      <path
        d="M62 134Q112 159 169 132M151 141L158 190"
        fill="none"
        stroke="#e8957d"
        strokeWidth="15"
        strokeLinecap="round"
      />
      <g fill="#678f94">
        <circle cx="115" cy="170" r="5" />
        <circle cx="115" cy="197" r="5" />
      </g>
      <path
        d="M48 157L18 118M181 157L214 115"
        stroke="#9e8267"
        strokeWidth="6"
        strokeLinecap="round"
      />
    </svg>
  )
}
export function Footprints({ many = false }: { many?: boolean }) {
  return (
    <svg viewBox="0 0 250 210" aria-hidden="true">
      {Array.from({ length: many ? 8 : 2 }, (_, i) => (
        <g
          key={i}
          className="snow-footprint"
          style={{ animationDelay: `${i * 0.18}s` }}
          transform={`translate(${60 + (i % 2) * 67 + (i > 3 ? 35 : 0)} ${175 - Math.floor(i / 2) * 45}) rotate(${i % 2 ? 20 : -20}) scale(${i % 2 ? 0.7 : 1})`}
          fill="#8cb5c4"
          opacity=".6"
        >
          <ellipse rx="13" ry="22" />
          <circle cy="-29" r="6" />
        </g>
      ))}
    </svg>
  )
}
