import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { writeFileSync, readFileSync, readdirSync, existsSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { StoryArt, StoryBackdrop } from '../../../../src/stories/StoryArt'
import { collectLine } from '../../../../scripts/narration'
const out='docs/requirements/garden-gathering-expanded/samples'
const protectedPaths=[...readdirSync('src/generated').map(f=>'src/generated/'+f),...readdirSync('src/stories/packs').map(f=>'src/stories/packs/'+f),...readdirSync('public/audio').filter(f=>f.endsWith('.mp3')).map(f=>'public/audio/'+f),'scripts/narration-input.json','scripts/pronunciation-review.json','scripts/tts-config.json']
const hashes=Object.fromEntries(protectedPaths.filter(existsSync).map(p=>[p,createHash('sha256').update(readFileSync(p)).digest('hex')]))
if(!existsSync(out+'/protected-before.json'))writeFileSync(out+'/protected-before.json',JSON.stringify(hashes,null,2)+'\n')
const drafts=[
 {node:'x04c',speaker:'小猫',text:'咚咚，哒！听，我先敲起来啦！',marks:[{text:'起来',phoneme:'qi3 lai5'}]},
 {node:'x06c',speaker:'小狐狸',text:'拍拍，咚咚！我跟上鼓声啦！',marks:[]},
 {node:'x04d',speaker:'小猫',text:'咚咚，哒！这一小段敲完啦，接下来请你和小狐狸一起！',marks:[{text:'接下来',phoneme:'jie1 xia4 lai5'},{text:'一起',phoneme:'yi1 qi3'}]},
 {node:'x06d',speaker:'小狐狸',text:'咚咚，咚咚！我们的鼓声也响起来啦！',marks:[{text:'起来',phoneme:'qi3 lai5'}]},
]
const lines=drafts.map(d=>collectLine('sample:garden-party:'+d.node,{speaker:d.speaker,text:d.text,emotion:'cheerful',intent:'dialogue',segments:[{text:d.text,...(d.marks.length?{pronunciations:d.marks}:{})}]}))
writeFileSync(out+'/narration-input.json',JSON.stringify(lines,null,2)+'\n')
writeFileSync(out+'/pronunciation-review.json',JSON.stringify({scope:'E1 isolated candidates, not production approval',reviewer:'AI-context-review',entries:drafts.map((d,i)=>({source:lines[i].source,speaker:lines[i].speaker,text:d.text,pronunciations:d.marks,note:'整句语境审阅；咚咚/哒/拍拍按拟声词，未改全局字典；实际听感待用户确认。'}))},null,2)+'\n')
function place(svg:string,x:number,y:number,w:number,h:number){return svg.replace('<svg ',`<svg x="${x}" y="${y}" width="${w}" height="${h}" `)}
function art(asset: 'fox' | 'cat' | 'flower' | 'basket' | 'drum',happy=false){return renderToStaticMarkup(createElement(StoryArt,{entity:{asset,mood:happy?'happy':'neutral'}}))}
const layouts=[['L0','出发：带着篮子和小鼓',{basket:'left',drum:'right'}],['L1','试摆：篮子来到中间',{basket:'center',drum:'right'}],['LF','花边：篮子更靠近花',{basket:'right',drum:'center'}],['LG','草地：中间留给小鼓',{basket:'left',drum:'center'}]] as const
const bounds={left:[6.4,230.4,89.6,104.4],center:[112,230.4,96,104.4],right:[224,230.4,89.6,104.4]}
for(const [id,,layout] of layouts){
 let body=place(renderToStaticMarkup(createElement(StoryBackdrop,{kind:'meadow'})),0,0,320,360)
 body+='<ellipse cx="42" cy="225" rx="20" ry="4" fill="#a7ced0" opacity=".65"/><path d="M27 224h18" stroke="#edf7ed" stroke-width="2"/><ellipse cx="280" cy="350" rx="18" ry="3" fill="#a7ced0" opacity=".65"/>'
 body+=place(art('fox',id==='LF'||id==='LG'),32,50.4,108.8,162)
 body+=place(art('cat',id==='LF'||id==='LG'),179.2,50.4,108.8,162)
 body+=place(art('flower'),135,213,130,110)
 body+=place(art('flower'),214,208,90,88)
 body+='<path d="M215 270q-4 6 0 7q5-1 0-7" fill="#e4f5fa" stroke="#80b2bc" stroke-width=".8"/>'
 for(const asset of ['basket','drum'] as const){const b=bounds[layout[asset]];body+=place(art(asset),...b as [number,number,number,number])}
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="320" height="360" viewBox="0 0 320 360">${body}</svg>`
 writeFileSync(out+'/'+id+'.svg',svg)
}
writeFileSync(out+'/layout-metadata.json',JSON.stringify({stage:{width:320,height:360},note:'Reuse actual artwork and narrow-screen normalized slots; static proposed floral layer, not live DOM proof.',layouts},null,2)+'\n')
console.log('Prepared 4 isolated narration lines and 4 SVG layout drafts; protected baseline captured.')
