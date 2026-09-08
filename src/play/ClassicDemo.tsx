import { StoryPlayer } from '../player/StoryPlayer'
import winterCottageInput from '../demo/winter-cottage.scene.json'
import { parseScene } from '../schema/scene'
import '../styles.css'

const scene = parseScene(winterCottageInput)
export default function ClassicDemo() {
  return <StoryPlayer scene={scene} />
}
