import { assertEquals } from '@std/assert'
import {
  DeckFMarker,
  DeckGMarker,
  DeckHMarker,
  DeckJMarker,
  DeckKMarker,
  DeckMMarker,
  DiscardPileMarker,
  DrawPileMarker,
  EverdeckCards,
  HandMarker,
  SpreadMarker,
} from './everdeck.ts'

Deno.test('sequence number matches card lookup order', () => {
  assertEquals(EverdeckCards.length, 120)
  for (let i = 0; i < 120; i++) {
    const card = EverdeckCards[i]
    const seq = card.sequence
    assertEquals(seq, i)
  }
})

Deno.test('animals are pairs', () => {
  const animalCounts = EverdeckCards.reduce((acc, card) => {
    acc[card.animal] = (acc[card.animal] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  for (const [animal, count] of Object.entries(animalCounts)) {
    assertEquals(count, 2, `Animal ${animal} does not have a pair`)
  }
})

Deno.test('type value of markers are equal', () => {
  assertEquals(DiscardPileMarker, 127)
  assertEquals(DrawPileMarker, 383)
  assertEquals(SpreadMarker, 126)
  assertEquals(HandMarker, 382)
  assertEquals(DeckFMarker, 376)
  assertEquals(DeckGMarker, 377)
  assertEquals(DeckHMarker, 378)
  assertEquals(DeckJMarker, 379)
  assertEquals(DeckKMarker, 380)
  assertEquals(DeckMMarker, 381)
})
