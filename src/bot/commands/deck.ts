import { TableState } from '../models/table.ts'
import { isLowHalfDeckDescription } from '../models/deck.ts'

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
