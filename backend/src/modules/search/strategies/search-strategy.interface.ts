export interface SearchResult {
  id: string
  name: string
  brand: { id: string; name: string }
  concentration: string | null
  gender: string | null
  releaseYear: number | null
  imageUrl: string | null
  topNotes: string[]
  middleNotes: string[]
  baseNotes: string[]
  accords: { name: string; strength: number | null }[]
  families: { name: string; isPrimary: boolean }[]
  slug: string
  matchScore: number
  matchType: 'exact' | 'alias' | 'fuzzy' | 'trigram'
}

export interface ISearchStrategy {
  search(normalizedQuery: string, limit: number, offset: number): Promise<SearchResult[]>
}
