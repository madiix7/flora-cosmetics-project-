export interface RawFragranceData {
  externalId: string
  source: string
  brandName: string
  name: string
  concentration?: string
  gender?: string
  releaseYear?: number
  description?: string
  imageUrl?: string
  topNotes?: string[]
  middleNotes?: string[]
  baseNotes?: string[]
  accords?: { name: string; strength?: number }[]
  families?: string[]
  aliases?: string[]
}

export interface IFragranceSource {
  readonly name: string
  readonly priority: number
  search(query: string): Promise<RawFragranceData | null>
}
