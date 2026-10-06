import { assertEquals } from '@std/assert'
import { TableState } from '../models/table.ts'
import { getNextDeckId } from './deck.ts'

Deno.test('getNextDeckId for half deck in empty state', () => {
  const table: TableState = {
    id: 'test',
    decks: [],
    sets: [],
    state: [],
  }
  const [nextId, high] = getNextDeckId(table, true)
  assertEquals(nextId, 0)
  assertEquals(high, false)
})

Deno.test('getNextDeckId for full deck in empty state', () => {
  const table: TableState = {
    id: 'test',
    decks: [],
    sets: [],
    state: [],
  }
  const [nextId, high] = getNextDeckId(table, false)
  assertEquals(nextId, 0)
  assertEquals(high, false)
})

Deno.test('getNextDeckId for half deck when one half deck exists', () => {
  const table: TableState = {
    id: 'test',
    decks: [{
      type: ['pc54'],
      low: {
        dealer: 'test',
        discard: null,
        draw: null,
        name: 'test',
        spread: null,
      },
    }],
    sets: [],
    state: [],
  }
  const [nextId, high] = getNextDeckId(table, true)
  assertEquals(nextId, 0)
  assertEquals(high, true)
})

Deno.test('getNextDeckId for full deck when one half deck exists', () => {
  const table: TableState = {
    id: 'test',
    decks: [{
      type: ['pc54'],
      low: {
        dealer: 'test',
        discard: null,
        draw: null,
        name: 'test',
        spread: null,
      },
    }],
    sets: [],
    state: [],
  }
  const [nextId, high] = getNextDeckId(table, false)
  assertEquals(nextId, 1)
  assertEquals(high, false)
})
