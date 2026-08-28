import { assertEquals } from '@std/assert'
import { EverdeckCards } from './everdeck.ts'

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
