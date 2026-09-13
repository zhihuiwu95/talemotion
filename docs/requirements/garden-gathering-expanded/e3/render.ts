import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { writeFileSync } from 'node:fs'
import { StoryArt, StoryBackdrop } from '../../../../src/stories/StoryArt'
import { storySchema } from '../../../../src/stories/schema'
import raw from '../../../../src/stories/packs/garden-gathering-party.json'
const pack = storySchema.parse(raw)
const out = 'docs/requirements/garden-gathering-expanded/e3/'
const slots = {
 'actor-left': [32,50.4,108.8,162], 'actor-right':[179.2,50.4,108.8,162],
 'prop-left':[6.4,230.4,89.6,104.4], 'prop-center':[112,230.4,96,104.4], 'prop-right':[224,230.4,89.6,104.4],
} as const
for (const id of ['s01','s05','f01','g01']) {
 const node=pack.nodes.find(n=>n.id===id)!
 let svg=renderToStaticMarkup(createElement(StoryBackdrop,{kind:node.backdrop}))
 const entities=node.entities.map(e=>{
  if (!(e.slot in slots)) throw new Error('Unexpected slot')
  const [x,y,w,h]=slots[e.slot as keyof typeof slots]
  return renderToStaticMarkup(createElement(StoryArt,{entity:e})).replace('<svg ',`<svg x="${x}" y="${y}" width="${w}" height="${h}" `)
 }).join('')
 svg=svg.replace('<svg ','<svg xmlns="http://www.w3.org/2000/svg" width="320" height="360" ')
 svg=svg.slice(0,svg.lastIndexOf('</svg>'))+entities+'</svg>'
 writeFileSync(out+id+'.svg',svg)
}
