import { storySchema } from './schema'

// One JSON file is the registration unit, including for the held-out fourth story.
const modules = import.meta.glob('./packs/*.json', {
  eager: true,
  import: 'default',
})
export const storyPacks = Object.values(modules).map((raw) =>
  storySchema.parse(raw),
)
const ids = new Set(storyPacks.map((pack) => pack.id))
if (ids.size !== storyPacks.length) throw new Error('Duplicate story pack IDs')
