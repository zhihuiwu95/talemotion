import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { gzipSync } from 'node:zlib'
import { performance } from 'node:perf_hooks'
import { storySchema } from '../../../../src/stories/schema'
import { verifyAcceptance } from '../../../../src/stories/engine'
const dir='src/stories/packs/'
const packs=readdirSync(dir).filter(f=>f.endsWith('.json')).map(f=>JSON.parse(readFileSync(dir+f,'utf8')))
const garden=packs.find(p=>p.id==='garden-gathering-party')
const forty=structuredClone(garden)
for(let i=0;i<6;i++) forty.nodes.push({...structuredClone(garden.nodes[0]),id:`extra${i}`,next:i===5?garden.start:`extra${i+1}`})
forty.start='extra0'
function measure(values:unknown[]) { const begin=performance.now(); for(const raw of values) { const parsed=storySchema.parse(raw); const errors=verifyAcceptance(parsed); if(errors.length) throw new Error(JSON.stringify(errors)) } return +(performance.now()-begin).toFixed(3) }
const data={single34Ms:measure([garden]),normalized34RawBytes:Buffer.byteLength(JSON.stringify(garden)),normalized34GzipBytes:gzipSync(JSON.stringify(garden)).length,all5Ms:measure(packs),synthetic40Ms:measure([forty]),synthetic40RawBytes:Buffer.byteLength(JSON.stringify(forty)),synthetic40GzipBytes:gzipSync(JSON.stringify(forty)).length,note:'Single observation including parse/graph verification; not a benchmark. Synthetic six opening beats only for bounded validation.'}
writeFileSync('docs/requirements/garden-gathering-expanded/e6/validation-size.json',JSON.stringify(data,null,2)+'\n'); console.log(data)
