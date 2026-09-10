export const storageKey = 'talemotion-observations-v1'
export interface RecordEntry {
  id: string
  date: string
  story: string
  attempts: number[]
  completed: number
  understanding: string
  replay: string
  reuse: string
  note: string
  mode?: 'story'
}
export function readObservations(): RecordEntry[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(storageKey) || '[]')
    return Array.isArray(value)
      ? value
          .filter(
            (v): v is RecordEntry =>
              v &&
              typeof v.id === 'string' &&
              typeof v.story === 'string' &&
              typeof v.date === 'string' &&
              Array.isArray(v.attempts),
          )
          .slice(-100)
      : []
  } catch {
    return []
  }
}
