import { DeckAMarker, DeckBMarker, DrawPileMarker } from './everdeck.ts'
import { CardSet, CardState } from './table.ts'
import { assertEquals } from '@std/assert'

Deno.test('serialize a sample card set', () => {
  const sampleSet = new CardSet(DrawPileMarker)
  sampleSet.push(new CardState(0, 1))
  sampleSet.push(new CardState(0, 2))
  sampleSet.push(new CardState(0, 3))
  sampleSet.push(new CardState(1, 1))
  sampleSet.push(new CardState(1, 2))
  sampleSet.push(new CardState(2, 1))
  const deckMap = sampleSet.deckMap
  assertEquals(deckMap.primaryId, 0)
  assertEquals(deckMap.secondaryIds.size, 2)
  assertEquals(deckMap.markerIds.size, 2)
  assertEquals(deckMap.secondaryIds.get(1), DeckAMarker)
  assertEquals(deckMap.secondaryIds.get(2), DeckBMarker)
  assertEquals(sampleSet.length, 6)
  const size = sampleSet.size()
  assertEquals(size, 14)
  const buffer = new Uint8Array(size)
  const bytesWritten = sampleSet.serialize(buffer, 0)
  assertEquals(bytesWritten, size)
  assertEquals(buffer.length, size)
  // header and deck map
  assertEquals(buffer[0], DrawPileMarker)
  assertEquals(buffer[1], DeckBMarker)
  assertEquals(buffer[2], 0)
  assertEquals(buffer[3], 1)
  assertEquals(buffer[4], 2)
  // card data
  assertEquals(buffer[5], 1)
  assertEquals(buffer[6], 2)
  assertEquals(buffer[7], 3)
  assertEquals(buffer[8], DeckAMarker)
  assertEquals(buffer[9], 1)
  assertEquals(buffer[10], DeckAMarker)
  assertEquals(buffer[11], 2)
  assertEquals(buffer[12], DeckBMarker)
  assertEquals(buffer[13], 1)
})

Deno.test('deserialize a sample card set', () => {
  const buffer = new Uint8Array([
    DrawPileMarker,
    DeckBMarker,
    0,
    1,
    2,
    1,
    2,
    3,
    DeckAMarker,
    1,
    DeckAMarker,
    2,
    DeckBMarker,
    1,
  ])
  const sampleSet = new CardSet(DrawPileMarker)
  const bytesRead = sampleSet.deserialize(buffer, 0)
  assertEquals(bytesRead, buffer.length)
  assertEquals(sampleSet.length, 6)
  const deckMap = sampleSet.deckMap
  assertEquals(deckMap.primaryId, 0)
  assertEquals(deckMap.secondaryIds.size, 2)
  assertEquals(deckMap.markerIds.size, 2)
  assertEquals(deckMap.secondaryIds.get(1), DeckAMarker)
  assertEquals(deckMap.secondaryIds.get(2), DeckBMarker)
  assertEquals(deckMap.markerIds.get(DeckAMarker), 1)
  assertEquals(deckMap.markerIds.get(DeckBMarker), 2)
})
