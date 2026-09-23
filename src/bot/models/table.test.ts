import {
  DeckAMarker,
  DeckBMarker,
  DiscardPileMarker,
  DrawPileMarker,
  SpreadMarker,
} from './everdeck.ts'
import {
  CardSet,
  CardState,
  deserialize,
  serialize,
  TableState,
  TableStore,
} from './table.ts'
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

Deno.test('serialize an empty table state', () => {
  const tableState = {
    decks: [],
    sets: [],
    state: [],
  }
  const tableStore = serialize(tableState)
  assertEquals(tableStore.decks, tableState.decks)
  assertEquals(tableStore.sets, tableState.sets)
  assertEquals(tableStore.state.length, 0)
})

Deno.test('deserialize an empty table state', () => {
  const tableStore = {
    decks: [],
    sets: [],
    state: new Uint8Array(0),
  }
  const tableState = deserialize(tableStore)
  assertEquals(tableState.decks, tableStore.decks)
  assertEquals(tableState.sets, tableStore.sets)
  assertEquals(tableState.state.length, 0)
})

Deno.test('serialize a sample table state', () => {
  const drawPile = new CardSet(DrawPileMarker)
  drawPile.push(new CardState(0, 1))
  const discardPile = new CardSet(DiscardPileMarker)
  discardPile.push(new CardState(0, 2))
  const spread = new CardSet(SpreadMarker)
  spread.push(new CardState(0, 3))
  const tableState: TableState = {
    decks: [{
      type: 'everdeck',
      dealer: 'test',
      discard: 1,
      draw: 0,
      spread: 2,
      name: 'Test',
    }],
    sets: [{ type: DrawPileMarker, name: 'Test Draw' }, {
      type: DiscardPileMarker,
      name: 'Test Discard',
    }, { type: SpreadMarker, name: 'Test' }],
    state: [drawPile, discardPile, spread],
  }
  const tableStore = serialize(tableState)
  assertEquals(tableStore.decks, tableState.decks)
  assertEquals(tableStore.sets, tableState.sets)
  assertEquals(tableStore.state.length, 9)
  assertEquals(tableStore.state[0], DrawPileMarker)
  assertEquals(tableStore.state[1], 0)
  assertEquals(tableStore.state[2], 1)
  assertEquals(tableStore.state[3], DiscardPileMarker)
  assertEquals(tableStore.state[4], 0)
  assertEquals(tableStore.state[5], 2)
  assertEquals(tableStore.state[6], SpreadMarker)
  assertEquals(tableStore.state[7], 0)
  assertEquals(tableStore.state[8], 3)
})

Deno.test('deserialize a sample table state', () => {
  const tableStore: TableStore = {
    decks: [{
      type: 'everdeck',
      dealer: 'test',
      discard: 1,
      draw: 0,
      spread: 2,
      name: 'Test',
    }],
    sets: [{ type: DrawPileMarker, name: 'Test Draw' }, {
      type: DiscardPileMarker,
      name: 'Test Discard',
    }, { type: SpreadMarker, name: 'Test' }],
    state: new Uint8Array([
      DrawPileMarker,
      0,
      1,
      DiscardPileMarker,
      0,
      2,
      SpreadMarker,
      0,
      3,
    ]),
  }
  const tableState = deserialize(tableStore)
  assertEquals(tableState.decks, tableStore.decks)
  assertEquals(tableState.sets, tableStore.sets)
  assertEquals(tableState.state.length, 3)
  assertEquals(tableState.state[0].length, 1)
  assertEquals(tableState.state[0].at(0)?.deckId, 0)
  assertEquals(tableState.state[0].at(0)?.cardId, 1)
  assertEquals(tableState.state[1].length, 1)
  assertEquals(tableState.state[1].at(0)?.deckId, 0)
  assertEquals(tableState.state[1].at(0)?.cardId, 2)
  assertEquals(tableState.state[2].length, 1)
  assertEquals(tableState.state[2].at(0)?.deckId, 0)
  assertEquals(tableState.state[2].at(0)?.cardId, 3)
})
