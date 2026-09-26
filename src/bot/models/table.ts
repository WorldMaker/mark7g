import { DeckDescription } from './deck.ts'
import {
  DeckMarker,
  DeckMarkers,
  DeckNumberMarker,
  DiscardPileMarker,
  DrawPileMarker,
  HandMarker,
  isDeckMarker,
  isSet,
  SpreadMarker,
} from './everdeck.ts'

const TableExpiration = 2 /* hr */ * 60 /* min */ * 60 /* sec */ * 1000 /* ms */

export class CardState {
  #deckId: number
  #cardId: number

  constructor(deckId: number, cardId: number) {
    this.#deckId = deckId
    this.#cardId = cardId
  }

  get deckId() {
    return this.#deckId
  }

  get cardId() {
    return this.#cardId
  }

  size(deckMap: DeckMap): number {
    if (this.#deckId === deckMap.primaryId) {
      return 1
    } else if (deckMap.secondaryIds.has(this.#deckId)) {
      return 2
    }
    return 3
  }

  serialize(deckMap: DeckMap, buffer: Uint8Array, offset: number): number {
    if (this.#deckId === deckMap.primaryId) {
      buffer[offset] = this.#cardId
      return 1
    } else if (deckMap.secondaryIds.has(this.#deckId)) {
      buffer[offset] = deckMap.secondaryIds.get(this.#deckId)!
      buffer[offset + 1] = this.#cardId
      return 2
    } else {
      buffer[offset] = DeckNumberMarker
      buffer[offset + 1] = this.#deckId
      buffer[offset + 2] = this.#cardId
      return 3
    }
  }
}

export interface DeckMap {
  primaryId: number
  secondaryIds: Map<number, DeckMarker>
  markerIds: Map<DeckMarker, number>
}

function hasDeckMarker(byte: number, deckMap: DeckMap): byte is DeckMarker {
  return deckMap.markerIds.has(byte as DeckMarker)
}

function deserializeCard(
  buffer: Uint8Array,
  offset: number,
  deckMap: DeckMap,
): { cardState: CardState; bytesRead: number } {
  const firstByte = buffer[offset]
  if (firstByte === DeckNumberMarker) {
    const deckId = buffer[offset + 1]
    const cardId = buffer[offset + 2]
    return { cardState: new CardState(deckId, cardId), bytesRead: 3 }
  } else if (hasDeckMarker(firstByte, deckMap)) {
    return {
      cardState: new CardState(
        deckMap.markerIds.get(firstByte)!,
        buffer[offset + 1],
      ),
      bytesRead: 2,
    }
  }
  return {
    cardState: new CardState(deckMap.primaryId, firstByte),
    bytesRead: 1,
  }
}

export class CardSet {
  #type: DiscardPileMarker | DrawPileMarker | HandMarker | SpreadMarker
  get type() {
    return this.#type
  }

  #cardState: CardState[] = []
  #deckCounts: Map<number, number> = new Map()

  constructor(
    type: DiscardPileMarker | DrawPileMarker | HandMarker | SpreadMarker,
  ) {
    this.#type = type
  }

  push(cardState: CardState) {
    this.#cardState.push(cardState)
    const deckId = cardState.deckId
    this.#deckMap = undefined
    this.#deckCounts.set(deckId, (this.#deckCounts.get(deckId) ?? 0) + 1)
  }

  remove(cardState: CardState) {
    this.#deckMap = undefined
    const index = this.#cardState.indexOf(cardState)
    if (index !== -1) {
      this.#cardState.splice(index, 1)
      const deckId = cardState.deckId
      const count = this.#deckCounts.get(deckId) ?? 0
      if (count > 1) {
        this.#deckCounts.set(deckId, count - 1)
      } else {
        this.#deckCounts.delete(deckId)
      }
    }
  }

  at(index: number): CardState | undefined {
    return this.#cardState[index]
  }

  [Symbol.iterator](): Iterator<CardState> {
    return this.#cardState[Symbol.iterator]()
  }

  get length(): number {
    return this.#cardState.length
  }

  #deckMap?: DeckMap

  get deckMap() {
    this.#deckMap ??= this.#buildDeckMap()
    return Object.freeze(this.#deckMap)
  }

  #buildDeckMap(): DeckMap {
    const sorted = Array.from(this.#deckCounts.entries()).sort((a, b) =>
      b[1] - a[1]
    )
    const primaryId = sorted.length > 0 ? sorted[0][0] : 0
    const secondaryIds = new Map<number, DeckMarker>()
    const markerIds = new Map<DeckMarker, number>()
    for (let i = 1; i < Math.min(sorted.length, DeckMarkers.length + 1); i++) {
      markerIds.set(DeckMarkers[i - 1], sorted[i][0])
      secondaryIds.set(sorted[i][0], DeckMarkers[i - 1])
    }
    return { primaryId, secondaryIds, markerIds }
  }

  #lastSize?: number

  size(): number {
    if (this.#cardState.length === 0) {
      this.#lastSize = 1
      return this.#lastSize
    }
    this.#deckMap ??= this.#buildDeckMap()
    // header is {type}{primaryDeck} | {type}{decknumber}{primaryDeck} | {type}{highestDeckMarker}{primaryDeck}{...deckMarkers}
    const primaryIsDeckMarker = isDeckMarker(this.#deckMap.primaryId)
    const primaryOnlySize = primaryIsDeckMarker ? 3 : 2
    const headerSize = this.#deckMap.markerIds.size > 0
      ? 3 + this.#deckMap.markerIds.size
      : primaryOnlySize
    this.#lastSize = headerSize +
      this.#cardState.reduce((sum, card) => sum + card.size(this.#deckMap!), 0)
    return this.#lastSize
  }

  serialize(buffer: Uint8Array, offset: number): number {
    if (this.#cardState.length === 0) {
      buffer[offset] = this.#type
      if (this.#lastSize !== undefined && this.#lastSize !== 1) {
        console.warn(
          `Serialized size mismatch: expected ${this.#lastSize}, was 1`,
        )
      }
      return 1
    }
    this.#deckMap ??= this.#buildDeckMap()
    let currentOffset = offset
    // Serialize header/deck map
    buffer[currentOffset++] = this.#type
    if (this.#deckMap.markerIds.size === 0) {
      if (isDeckMarker(this.#deckMap.primaryId)) {
        buffer[currentOffset++] = DeckNumberMarker
        buffer[currentOffset++] = this.#deckMap.primaryId
      } else {
        buffer[currentOffset++] = this.#deckMap.primaryId
      }
    } else {
      const highestDeckMarker = DeckMarkers[this.#deckMap.markerIds.size - 1]
      buffer[currentOffset++] = highestDeckMarker
      buffer[currentOffset++] = this.#deckMap.primaryId
      for (const marker of DeckMarkers.slice(0, this.#deckMap.markerIds.size)) {
        buffer[currentOffset++] = this.#deckMap.markerIds.get(marker)!
      }
    }
    // Serialize cards
    for (const card of this.#cardState) {
      currentOffset += card.serialize(this.#deckMap, buffer, currentOffset)
    }
    const size = currentOffset - offset
    if (this.#lastSize !== undefined && size !== this.#lastSize) {
      console.warn(
        `Serialized size mismatch: expected ${this.#lastSize}, was ${size}`,
      )
    }
    return currentOffset - offset
  }

  deserialize(buffer: Uint8Array, offset: number, length?: number): number {
    let currentOffset = offset
    // Safety check that types match
    const type = buffer[currentOffset]
    if (type !== this.#type) {
      throw new Error(`Type mismatch: expected ${this.#type}, got ${type}`)
    }
    currentOffset++
    // Deserialize header/deck map
    this.#deckMap = {
      primaryId: 0,
      secondaryIds: new Map(),
      markerIds: new Map(),
    }
    this.#deckCounts = new Map()
    this.#cardState = []
    const endOffset = offset + (length ?? (buffer.length - offset))
    if (currentOffset >= buffer.length) {
      return currentOffset - offset
    }
    const firstByte = buffer[currentOffset]
    if (isSet(firstByte)) {
      if (length !== undefined && currentOffset < endOffset) {
        console.warn(
          `Unexpected set marker at offset ${currentOffset} before end of specified length.`,
        )
      }
      return currentOffset - offset
    }
    if (!isDeckMarker(firstByte)) {
      this.#deckMap.primaryId = firstByte
    } else if (firstByte === DeckNumberMarker) {
      currentOffset++
      this.#deckMap.primaryId = buffer[currentOffset]
    } else {
      const highestDeckMarker = firstByte
      currentOffset++
      this.#deckMap.primaryId = buffer[currentOffset]
      for (
        const marker of DeckMarkers.slice(
          0,
          DeckMarkers.indexOf(highestDeckMarker) + 1,
        )
      ) {
        currentOffset++
        const deckId = buffer[currentOffset]
        this.#deckMap.markerIds.set(marker, deckId)
        this.#deckMap.secondaryIds.set(deckId, marker)
      }
    }
    currentOffset++
    // Deserialize cards
    while (currentOffset < endOffset) {
      if (isSet(buffer[currentOffset])) {
        if (length !== undefined && currentOffset < endOffset) {
          console.warn(
            `Unexpected set marker at offset ${currentOffset} before end of specified length.`,
          )
        }
        break
      }
      const { cardState, bytesRead } = deserializeCard(
        buffer,
        currentOffset,
        this.#deckMap,
      )
      this.#deckCounts.set(
        cardState.deckId,
        (this.#deckCounts.get(cardState.deckId) ?? 0) + 1,
      )
      this.#cardState.push(cardState)
      currentOffset += bytesRead
    }
    return currentOffset - offset
  }
}

export interface SimpleSetDescription {
  type: DrawPileMarker | DiscardPileMarker | SpreadMarker
  name: string
  dealer?: boolean
}

export interface HandDescription {
  type: HandMarker
  name: string
  player: string
}

export type SetDescription = SimpleSetDescription | HandDescription

export interface TableDescription {
  id: string
  decks: DeckDescription[]
  sets: SetDescription[]
}

export interface TableStore extends TableDescription {
  state: Uint8Array
}

export interface TableState extends TableDescription {
  state: CardSet[]
}

export function serialize(table: TableState): TableStore {
  const size = table.state.reduce((acc, set) => acc + set.size(), 0)
  const buffer = new Uint8Array(size)
  let offset = 0
  for (const set of table.state) {
    offset += set.serialize(buffer, offset)
  }
  return {
    ...table,
    state: buffer,
  }
}

export function deserialize(table: TableStore): TableState {
  const state: CardSet[] = []
  let offset = 0
  while (offset < table.state.length) {
    const marker = table.state[offset]
    if (!isSet(marker)) {
      throw new Error(`Unexpected marker at offset ${offset}: ${marker}`)
    }
    if (marker !== table.sets[state.length].type) {
      throw new Error(`Unexpected set type at offset ${offset}: ${marker}`)
    }
    const set = new CardSet(marker)
    offset += set.deserialize(table.state, offset)
    state.push(set)
  }
  return {
    ...table,
    state,
  }
}

export function getTable(kv: Deno.Kv, tableId: string) {
  return kv.get<TableStore>(['tables', tableId])
}

export function updateTable(kv: Deno.Kv, table: TableStore) {
  return kv.set(['tables', table.id], table, { expireIn: TableExpiration })
}
