import {
  everdeckAnimalEmoji,
  everdeckCardEmoji,
  everdeckLetterEmoji,
  pcCardEmoji,
  tarotCardEmoji,
} from './everdeck.ts'

export type HalfDeckType =
  | 'pc52'
  | 'pc53'
  | 'pc54'
  | 'pc55'
  | 'pc56'
  | 'pc57'
  | 'pc58'
  | 'pc59'
  | 'pc60'

export type DoubleDeckType =
  | 'pc2x52'
  | 'pc2x53'
  | 'pc2x54'
  | 'pc2x55'
  | 'pc2x56'
  | 'pc2x57'
  | 'pc2x58'
  | 'pc2x59'
  | 'pc2x60'

export type FullDeckType =
  | 'everdeck'
  | 'tarot'
  | 'letter'
  | 'animal'
  | DoubleDeckType

export type DeckType = HalfDeckType | FullDeckType

export function isHalfDeck(deckType: DeckType): deckType is HalfDeckType {
  return deckType.startsWith('pc') && !deckType.startsWith('pc2x')
}

export interface DeckInfo {
  name: string
  dealer: string | null
  draw: number | null
  discard: number | null
  spread: number | null
}

export interface LowHalfDeckDescription {
  type: [HalfDeckType]
  low: DeckInfo
}

export function isLowHalfDeckDescription(
  deck: DeckDescription,
): deck is LowHalfDeckDescription {
  return Array.isArray(deck.type) && deck.type.length === 1
}

export interface HighHalfDeckDescription {
  type: [HalfDeckType, HalfDeckType]
  low: DeckInfo
  high: DeckInfo
}

export function isHighHalfDeckDescription(
  deck: DeckDescription,
): deck is HighHalfDeckDescription {
  return Array.isArray(deck.type) && deck.type.length === 2
}

export type HalfDeckDescription =
  | LowHalfDeckDescription
  | HighHalfDeckDescription

export interface FullDeckDescription extends DeckInfo {
  type: FullDeckType
}

export function isFullDeckDescription(
  deck: DeckDescription,
): deck is FullDeckDescription {
  return typeof deck.type === 'string'
}

export type DeckDescription =
  | HalfDeckDescription
  | FullDeckDescription

export interface DeckBuilder {
  type: DeckType
  name: string
  description: string
  display(card: number): string
  generate(high?: boolean): IteratorObject<number>
}

export type DeckBuilders = Readonly<Record<DeckType, DeckBuilder>>

function* range(start: number, end: number) {
  for (let i = start; i < end; i++) {
    yield i
  }
}

// a sort of hilbert curve to mix up the suits/"values"
const loJokers = [0, 30, 21, 11, 20, 10, 31, 1]

function* generateLoDeck(jokers: number) {
  // clubs
  yield* range(2, 10)
  yield* range(80, 85)
  // spades
  yield* range(12, 20)
  yield* range(85, 90)
  // hearts
  yield* range(22, 30)
  yield* range(90, 95)
  // diamonds
  yield* range(32, 40)
  yield* range(95, 100)
  // jokers
  for (let i = 0; i < jokers; i++) {
    yield loJokers[i]
  }
}

const hiJokers = [40, 70, 61, 51, 60, 50, 71, 41]

function* generateHiDeck(jokers: number) {
  // clubs
  yield* range(42, 50)
  yield* range(100, 105)
  // spades
  yield* range(52, 60)
  yield* range(105, 110)
  // hearts
  yield* range(62, 70)
  yield* range(110, 115)
  // diamonds
  yield* range(72, 80)
  yield* range(115, 120)
  // jokers
  for (let i = 0; i < jokers; i++) {
    yield hiJokers[i]
  }
}

export function isHighDeckCard(card: number): boolean {
  return (card >= 40 && card < 80) || (card >= 100 && card < 120)
}

function* generate2xDeck(jokers: number) {
  yield* generateLoDeck(jokers)
  yield* generateHiDeck(jokers)
}

function* generateTarotDeck() {
  // clubs and spades form the major arcana
  // clubs
  yield* range(0, 10)
  yield 84 // ace
  // spades
  yield* range(10, 20)
  yield 89 // ace
  // hearts
  yield* range(20, 30)
  yield* range(90, 95)
  // diamonds
  yield* range(30, 40)
  yield* range(95, 100)
  // moons
  yield* range(60, 70)
  yield* range(110, 115)
  // stars
  yield* range(70, 80)
  yield* range(115, 120)
}

function* generatePcDeckBuilders(): Iterable<DeckBuilder> {
  for (let i = 52; i <= 60; i++) {
    const deckType = `pc${i}` as DeckType
    const deckJokers = i - 52
    yield {
      type: deckType,
      name: `Playing Card Deck (${deckJokers} jokers)`,
      description: 'A standard 52-card playing deck',
      display: pcCardEmoji,
      generate: (high: boolean) =>
        high ? generateHiDeck(deckJokers) : generateLoDeck(deckJokers),
    }
    const doubleDeckType = `pc2x${i}` as DeckType
    yield {
      type: doubleDeckType,
      name: `Double Playing Card Deck (${deckJokers} jokers)`,
      description: 'A standard 52-card playing deck, doubled',
      display: pcCardEmoji,
      generate: () => generate2xDeck(deckJokers),
    }
  }
}

const pcDeckBuilders = Object.fromEntries(
  Array.from(generatePcDeckBuilders())
    .map((builder) => [builder.type, builder]),
) as Record<HalfDeckType | DoubleDeckType, DeckBuilder>

export const deckBuilders: DeckBuilders = Object.freeze({
  ...pcDeckBuilders,
  everdeck: {
    type: 'everdeck',
    name: 'Everdeck',
    description: 'A complex deck of eight suits and 120 total cards',
    display: everdeckCardEmoji,
    generate: () => range(0, 120),
  },
  letter: {
    type: 'letter',
    name: 'Letter Deck',
    description:
      'A deck consisting of letters with points in roughly English distribution',
    display: everdeckLetterEmoji,
    generate: () => range(0, 120),
  },
  animal: {
    type: 'animal',
    name: 'Animal Deck',
    description: 'A deck consisting pairs of various animals',
    display: everdeckAnimalEmoji,
    generate: () => range(0, 120),
  },
  tarot: {
    type: 'tarot',
    name: 'Tarot Deck',
    description: 'A traditional tarot deck with 78 cards',
    display: tarotCardEmoji,
    generate: generateTarotDeck,
  },
})
