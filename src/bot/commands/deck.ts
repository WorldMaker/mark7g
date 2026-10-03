import { CardSet, CardState, TableState } from '../models/table.ts'
import {
  deckBuilders,
  DeckInfo,
  DeckType,
  HalfDeckType,
  isHalfDeck,
  isLowHalfDeckDescription,
} from '../models/deck.ts'
import { DrawPileMarker } from '../models/everdeck.ts'

export function getNextDeckId(
  table: TableState,
  half: boolean,
): [number, boolean] {
  if (half) {
    for (let i = 0; i < table.decks.length; i++) {
      const deck = table.decks[i]
      if (
        isLowHalfDeckDescription(deck)
      ) {
        return [i, true]
      }
    }
    if (table.decks.length >= 255) {
      throw new Error('Maximum number of decks reached')
    }
    return [table.decks.length, false]
  } else {
    if (table.decks.length >= 255) {
      throw new Error('Maximum number of decks reached')
    }
    return [table.decks.length, false]
  }
}

export interface DeckPlacementOptions {
  noDraw?: boolean
  noDiscard?: boolean
  noSpread?: boolean
  public?: boolean
}

export function placeDeck(
  table: TableState,
  dealer: string,
  type: DeckType,
  name: string,
  options?: DeckPlacementOptions,
) {
  const isHalfDeckType = isHalfDeck(type)
  const [deckId, isHigh] = getNextDeckId(table, isHalfDeckType)

  const deckBuilder = deckBuilders[type]

  let draw: number | null = null
  let discard: number | null = null
  let spread: number | null = null

  if (!options?.noDraw) {
    table.sets.push({
      type: DrawPileMarker,
      name: `${name} Draw`,
      dealer: !options?.public,
    })
    const pile = new CardSet(DrawPileMarker)
    pile.shuffle(
      deckBuilder.generate(isHigh).map((card) => new CardState(deckId, card)),
    )
    table.state.push(pile)
    draw = table.state.length - 1
  }
  if (!options?.noDiscard) {
    table.sets.push({
      type: DrawPileMarker,
      name: `${name} Discard`,
      dealer: !options?.public,
    })
    table.state.push(new CardSet(DrawPileMarker))
    discard = table.state.length - 1
  }
  if (!options?.noSpread) {
    table.sets.push({
      type: DrawPileMarker,
      name: `${name}`,
      dealer: !options?.public,
    })
    table.state.push(new CardSet(DrawPileMarker))
    spread = table.state.length - 1
  }

  const info: DeckInfo = {
    name,
    dealer: options?.public ? null : dealer,
    draw,
    discard,
    spread,
  }

  if (isHigh) {
    if (table.decks.length < deckId) {
      throw new Error(`Invalid deck placement, no low deck ${deckId}`)
    }
    const existingDeck = table.decks[deckId]
    if (!isLowHalfDeckDescription(existingDeck)) {
      throw new Error(
        `Invalid deck placement, expected low half deck at ${deckId}`,
      )
    }
    table.decks[deckId] = {
      type: [existingDeck.type[0], type as HalfDeckType],
      low: existingDeck.low,
      high: info,
    }
  } else if (isHalfDeckType) {
    table.decks[deckId] = {
      type: [type],
      low: info,
    }
  } else {
    table.decks[deckId] = {
      ...info,
      type: type,
    }
  }
}
