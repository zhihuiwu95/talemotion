import type { StoryBackdropKind } from './catalog'
import { Friend, Mitten, Rabbit } from '../play/Artwork'
import {
  DressedBear,
  Footprints,
  PineBranch,
  Robin,
  Snowman,
  SnowPile,
} from '../play/AdventureArt'
import type { StoryEntity } from './schema'

function Basket({
  x = 46,
  y = 78,
  scale = 1,
}: {
  x?: number
  y?: number
  scale?: number
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <path
        d="M15 14Q50-28 85 14"
        fill="none"
        stroke="#996949"
        strokeWidth="9"
      />
      <path
        d="M0 10H100L88 65H12Z"
        fill="#d6a669"
        stroke="#996949"
        strokeWidth="4"
      />
      <path
        d="M10 27H95M13 44H91M28 12L32 62M52 12V64M75 12L70 64"
        stroke="#b07b4e"
        strokeWidth="3"
      />
      <path
        d="M0 8Q24-8 45 12Q68-2 100 8L92 26Q67 13 44 29Q20 12 8 25Z"
        fill="#e89b87"
      />
    </g>
  )
}

export function StoryArt({
  entity,
}: {
  entity: Pick<StoryEntity, 'asset' | 'mood'>
}) {
  const { asset, mood } = entity
  if (asset === 'bear-cold' || asset === 'bear-warm')
    return <DressedBear warm={asset === 'bear-warm'} />
  if (asset === 'bear' || asset === 'fox' || asset === 'cat')
    return <Friend animal={asset} happy={mood === 'happy'} />
  if (asset === 'rabbit') return <Rabbit happy={mood === 'happy'} />
  if (asset === 'mitten-stripe' || asset === 'mitten-dot')
    return <Mitten kind={asset === 'mitten-stripe' ? 'stripe' : 'dot'} />
  if (asset === 'snow') return <SnowPile />
  if (asset === 'pine') return <PineBranch />
  if (asset === 'bird') return <Robin />
  if (asset === 'snowman') return <Snowman />
  if (asset === 'footprints') return <Footprints many />
  const blue = asset.includes('blue')
  const roof = asset.startsWith('roof-') || asset.startsWith('shelter-')
  const posts = asset === 'posts' || asset.startsWith('shelter-')
  return (
    <svg viewBox="0 0 200 180" fill="none" aria-hidden="true">
      <ellipse cx="100" cy="163" rx="78" ry="10" fill="#294e57" opacity=".12" />
      {posts && (
        <g fill="#be915d" stroke="#856849" strokeWidth="4">
          <rect x="35" y="58" width="16" height="100" rx="4" />
          <rect x="149" y="58" width="16" height="100" rx="4" />
          <path d="M36 72H163V88H36Z" />
          <path d="M39 94L66 72M157 94L130 72" strokeWidth="8" />
        </g>
      )}
      {roof && (
        <g>
          <path
            d="M14 68L100 18L186 68Z"
            fill={blue ? '#689bb4' : '#dc8f79'}
            stroke={blue ? '#42768b' : '#ad6757'}
            strokeWidth="4"
            strokeLinejoin="round"
          />
          <path
            d="M30 62L100 22L170 62M79 36L90 66M123 36L112 66"
            stroke="#fff4d7"
            strokeWidth="5"
            strokeLinecap="round"
            opacity=".75"
          />
        </g>
      )}
      {asset.endsWith('-full') && (
        <g className="basket-arrival">
          <Basket x={64} y={110} scale={0.72} />
        </g>
      )}
      {asset === 'basket' && <Basket />}
      {asset === 'blocks' && (
        <g stroke="#856849" strokeWidth="4">
          <rect x="28" y="77" width="50" height="78" rx="5" fill="#c89c68" />
          <rect x="92" y="110" width="78" height="45" rx="5" fill="#e2bc83" />
          <path d="M35 87H70M102 120H159" stroke="#fae5bd" strokeWidth="6" />
          <path d="M38 103V140M107 139H153" stroke="#ad8356" />
        </g>
      )}
      {asset === 'drum' && (
        <g>
          <path
            d="M28 65V132C28 166 172 166 172 132V65"
            fill="#ce806c"
            stroke="#9c6556"
            strokeWidth="4"
          />
          <path
            d="M31 81L54 140L78 85L104 149L130 85L168 137"
            stroke="#ffe5b4"
            strokeWidth="5"
          />
          <ellipse
            cx="100"
            cy="66"
            rx="73"
            ry="32"
            fill="#fff0c8"
            stroke="#b98659"
            strokeWidth="6"
          />
          <path
            d="M36 34L82 71M164 27L123 67"
            stroke="#886845"
            strokeWidth="9"
            strokeLinecap="round"
          />
          <circle cx="85" cy="74" r="9" fill="#cb995c" />
          <circle cx="121" cy="70" r="9" fill="#cb995c" />
        </g>
      )}
      {asset === 'wait' && (
        <g>
          <circle
            cx="100"
            cy="87"
            r="63"
            fill="#fff3ce"
            stroke="#789c88"
            strokeWidth="7"
          />
          <path
            d="M100 46V88L127 105"
            stroke="#507e6d"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <path
            d="M100 33V39M100 136V142M46 87H51M149 87H154"
            stroke="#b49a64"
            strokeWidth="4"
          />
          <path
            d="M66 13Q101-5 135 13"
            stroke="#789c88"
            strokeWidth="5"
            strokeLinecap="round"
          />
        </g>
      )}
      {asset === 'clap' && (
        <g
          stroke="#a57d5f"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path
            d="M50 151L25 98Q20 84 32 82L52 105L42 44Q41 31 52 35L67 90L62 27Q66 14 76 27L85 86L88 30Q94 19 101 33L101 98Q115 82 125 87Q131 98 116 119L93 153Z"
            fill="#f2cb9e"
          />
          <path
            d="M106 151L93 128L114 103L142 75Q152 69 155 81L137 107L166 85Q179 81 178 94L153 119L175 109Q187 111 179 123L148 151Z"
            fill="#e9b988"
          />
          <path
            d="M135 26L143 13M157 43L174 38"
            stroke="#d99a57"
            strokeWidth="6"
          />
        </g>
      )}
      {asset === 'flower' && (
        <g>
          <path
            d="M100 146V73M100 125Q130 101 145 117Q133 144 100 136"
            stroke="#639575"
            strokeWidth="7"
            fill="#95b891"
          />
          <g fill="#eaa08b">
            {[0, 72, 144, 216, 288].map((angle) => (
              <ellipse
                key={angle}
                cx="100"
                cy="43"
                rx="18"
                ry="28"
                transform={`rotate(${angle} 100 71)`}
              />
            ))}
          </g>
          <circle cx="100" cy="71" r="21" fill="#f6d177" />
        </g>
      )}
    </svg>
  )
}

export function StoryBackdrop({ kind }: { kind: StoryBackdropKind }) {
  if (kind === 'meadow-after-rain') {
    // The nested meadow keeps its existing crop; the floral layer follows the
    // same normalized positions as the approved narrow-stage composition.
    return (
      <svg className="pack-backdrop" viewBox="0 0 320 360" preserveAspectRatio="none" aria-hidden="true">
        <svg width="320" height="360"><StoryBackdrop kind="meadow" /></svg>
        <ellipse cx="42" cy="225" rx="20" ry="4" fill="#a7ced0" opacity=".65" />
        <path d="M27 224h18" stroke="#edf7ed" strokeWidth="2" />
        <ellipse cx="280" cy="350" rx="18" ry="3" fill="#a7ced0" opacity=".65" />
        <svg x="135" y="213" width="130" height="110"><StoryArt entity={{ asset: 'flower', mood: 'neutral' }} /></svg>
        <svg x="214" y="208" width="90" height="88"><StoryArt entity={{ asset: 'flower', mood: 'neutral' }} /></svg>
        <path d="M215 270q-4 6 0 7q5-1 0-7" fill="#e4f5fa" stroke="#80b2bc" strokeWidth=".8" />
      </svg>
    )
  }
  return (
    <svg
      className="pack-backdrop"
      viewBox="0 0 800 520"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <rect
        width="800"
        height="520"
        fill={
          kind === 'snow' ? '#dceef5' : kind === 'rain' ? '#d9e7e3' : '#e4efd7'
        }
      />
      <circle
        cx="400"
        cy="70"
        r="40"
        fill={kind === 'rain' ? '#ecf0e6' : '#fff2bd'}
      />
      <path
        d="M-20 117Q110 80 223 157Q365 57 487 140Q670 63 825 115V360H-20Z"
        fill={kind === 'snow' ? '#bfd9d9' : '#bfd4b5'}
        opacity=".75"
      />
      <g fill={kind === 'snow' ? '#7fa99f' : '#91b098'}>
        <path d="M23 334L83 115L151 334ZM650 316L716 97L791 316Z" />
        <path
          d="M142 333L189 173L238 333ZM565 312L604 178L650 312Z"
          opacity=".5"
        />
      </g>
      <path
        d="M0 323Q176 273 378 335Q592 284 800 326V520H0Z"
        fill={kind === 'snow' ? '#f5faf5' : '#d6e4bc'}
      />
      <path
        d="M0 439Q258 381 458 451Q644 395 800 443"
        stroke={kind === 'snow' ? '#dceae4' : '#c0d3a8'}
        strokeWidth="3"
        fill="none"
      />
      {kind === 'rain' && (
        <g className="pack-rain" stroke="#7fa9af" strokeWidth="3" opacity=".5">
          {Array.from({ length: 16 }, (_, i) => (
            <path key={i} d={`M${i * 55} 60l-7 20M${i * 55 + 20} 190l-7 20`} />
          ))}
        </g>
      )}
      {kind === 'snow' && (
        <g fill="#fff" opacity=".85">
          {Array.from({ length: 14 }, (_, i) => (
            <circle key={i} cx={i * 61} cy={48 + (i % 4) * 60} r="3" />
          ))}
        </g>
      )}
    </svg>
  )
}
