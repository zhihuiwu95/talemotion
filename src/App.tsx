import { lazy, Suspense } from 'react'
import { StoryLibrary } from './play/StoryLibrary'

const ClassicDemo = lazy(() => import('./play/ClassicDemo'))

export default function App() {
  return new URLSearchParams(window.location.search).get('demo') ===
    'classic' ? (
    <Suspense fallback={<p>正在打开故事…</p>}>
      <ClassicDemo />
    </Suspense>
  ) : (
    <StoryLibrary />
  )
}
