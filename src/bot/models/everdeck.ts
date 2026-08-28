/*
    Based on the Everdeck design by efofecks
    https://thewrongtools.wordpress.com/2019/10/10/the-everdeck/

    The Everdeck is a 120-card deck that constitutes eight suits of 15 cards each.
    Among other uses, it can easily represent two standard 52-card decks (or 54/56
    card variants with jokers) in 7-bits with a bit of room to spare for metadata.

    There are multiple ways to project Everdeck cards into other types of decks.
    This provides flexibility in the types of games that can be played with this
    bot and simple card playing commands, in way that can be somewhat easily
    binary packed.
*/

//#region Flags and Markers

/**
 * The highest bit of an 8-bit value we use to indicate that a card is closed
 * (face down or facing away from the hand holder). 
 */
export const ClosedFlag = 1 << 7

export const ClosedMask = ~ClosedFlag

export function isClosed(card: number): boolean {
  return (card & ClosedFlag) !== 0
}

/**
 * A pile of cards facing up.
 */
export const DiscardPileMarker = 127

/**
 * A pile of cards facing down.
 */
export const DrawPileMarker = ClosedFlag | 127

export function isPile(card: number): boolean {
  return card === DiscardPileMarker || card === DrawPileMarker
}

/**
 * A fold of cards facing up.
 */
export const SpreadMarker = 126

/**
 * A fold of cards facing down/facing a player.
 */
export const HandMarker = ClosedFlag | 126

export function isFold(card: number): boolean {
  return card === SpreadMarker || card === HandMarker
}

/**
 * The card after this is from the deck of given number.
 * 
 * This is used for "three-byte" card representations, where the first byte
 * is this marker, the second byte is the deck number, and the third byte is
 * the card number.
 */
export const DeckNumberMarker = 120

/**
 * The card after this is from deck A.
 * 
 * This is used for "two-byte" card representations, where the first byte
 * is this marker, and the second byte is the card number.
 */
export const DeckAMarker = 121

/**
 * The card after this is from deck B.
 * 
 * This is used for "two-byte" card representations, where the first byte
 * is this marker, and the second byte is the card number.
 */
export const DeckBMarker = 122

/**
 * The card after this is from deck C.
 * 
 * This is used for "two-byte" card representations, where the first byte
 * is this marker, and the second byte is the card number.
 */
export const DeckCMarker = 123

/**
 * The card after this is from deck D.
 * 
 * This is used for "two-byte" card representations, where the first byte
 * is this marker, and the second byte is the card number.
 */
export const DeckDMarker = 124

/**
 * The card after this is from deck E.
 * 
 * This is used for "two-byte" card representations, where the first byte
 * is this marker, and the second byte is the card number.
 */
export const DeckEMarker = 125

/**
 * The card after this is from deck F.
 * 
 * This is used for "two-byte" card representations, where the first byte
 * is this marker, and the second byte is the card number.
 */
export const DeckFMarker = 120 | ClosedFlag

/**
 * The card after this is from deck G.
 * 
 * This is used for "two-byte" card representations, where the first byte
 * is this marker, and the second byte is the card number.
 */
export const DeckGMarker = 121 | ClosedFlag

/**
 * The card after this is from deck H.
 * 
 * This is used for "two-byte" card representations, where the first byte
 * is this marker, and the second byte is the card number.
 */
export const DeckHMarker = 122 | ClosedFlag

/**
 * The card after this is from deck I.
 * 
 * This is used for "two-byte" card representations, where the first byte
 * is this marker, and the second byte is the card number.
 */
export const DeckJMarker = 123 | ClosedFlag

/**
 * The card after this is from deck K.
 * 
 * This is used for "two-byte" card representations, where the first byte
 * is this marker, and the second byte is the card number.
 */
export const DeckKMarker = 124 | ClosedFlag

/**
 * The card after this is from deck L.
 * 
 * This is used for "two-byte" card representations, where the first byte
 * is this marker, and the second byte is the card number.
 */
export const DeckMMarker = 125 | ClosedFlag

//#endregion

//#region Cards

export type EverdeckSuit = '♣️' | '♠️' | '♥️' | '♦️' | '🪙' | '👑' | '🌙' | '⭐'
export type EverdeckFaceRank = 'X' | 'J' | 'Q' | 'K' | 'A'
export type EverdeckRank = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | EverdeckFaceRank
export type EverdeckPoints = 0 | 1 | 2 | 3 | 4 | 5

export interface EverdeckCard {
    readonly suit: EverdeckSuit
    readonly rank: EverdeckRank
    readonly sequence: number
    readonly word: string
    readonly letter: string
    readonly animal: string
    readonly points: EverdeckPoints
}

function suitIndex(suit: EverdeckSuit): number {
    switch (suit) {
        case '♣️': return 0
        case '♠️': return 1
        case '♥️': return 2
        case '♦️': return 3
        case '🪙': return 4
        case '👑': return 5
        case '🌙': return 6
        case '⭐': return 7
    }
}

function faceRankIndex(rank: EverdeckFaceRank): number {
    switch (rank) {
        case 'X': return 0
        case 'J': return 1
        case 'Q': return 2
        case 'K': return 3
        case 'A': return 4
    }
}

function sequenceNumber(suit: EverdeckSuit, rank: EverdeckRank): number {
    if (typeof rank === 'number') {
        return (suitIndex(suit) * 10) + rank
    }
    return (suitIndex(suit) * 5) + faceRankIndex(rank) + 80
}

class Card implements EverdeckCard {
    readonly #suit: EverdeckSuit
    get suit(): EverdeckSuit {
        return this.#suit
    }
    readonly #rank: EverdeckRank
    get rank(): EverdeckRank {
        return this.#rank
    }
    readonly #sequence: number
    get sequence(): number {
        return this.#sequence
    }
    readonly #word: string
    get word(): string {
        return this.#word
    }
    readonly #letter: string
    get letter(): string {
        return this.#letter
    }
    readonly #animal: string
    get animal(): string {
        return this.#animal
    }

    readonly #points: EverdeckPoints
    get points(): EverdeckPoints {
        return this.#points
    }

    constructor(suit: EverdeckSuit, rank: EverdeckRank, word: string, points: EverdeckPoints, animal: string) {
        this.#suit = suit
        this.#rank = rank
        this.#sequence = sequenceNumber(suit, rank)
        this.#word = word
        this.#letter = word.charAt(0)
        this.#points = points
        this.#animal = animal
    }
}

export const EverdeckCards: readonly EverdeckCard[] = Object.freeze([
    // ♣️ 0-9
    new Card('♣️', 0, 'Fool', 4, 'Clownfish'),
    new Card('♣️', 1, 'Magician', 3, 'Crow'),
    new Card('♣️', 2, 'Priestess', 4, 'Crane'),
    new Card('♣️', 3, 'Empress', 1, 'Cow'),
    new Card('♣️', 4, 'Emperor', 1, 'Lion'),
    new Card('♣️', 5, 'Hierophant', 3, 'Owl'),
    new Card('♣️', 6, 'Lovers', 2, 'Lovebirds'),
    new Card('♣️', 7, 'Chariot', 3, 'Horse'),
    new Card('♣️', 8, 'Strength', 2, 'Bear'),
    new Card('♣️', 9, 'Hermit', 2, 'Turtle'),
    // ♠️ 0-9
    new Card('♠️', 0, 'Fortune', 4, 'Clam & Pearl'),
    new Card('♠️', 1, 'Justice', 5, 'Eagle'),
    new Card('♠️', 2, 'Hanged', 3, 'Bat'),
    new Card('♠️', 3, 'Death', 3, 'Shark'),
    new Card('♠️', 4, 'Temperance', 1, 'Dove'),
    new Card('♠️', 5, 'Devil', 2, 'Snake'),
    new Card('♠️', 6, 'Tower', 1, 'Giraffe'),
    new Card('♠️', 7, 'Star', 2, 'Starfish'),
    new Card('♠️', 8, 'Moon', 3, 'Wolf'),
    new Card('♠️', 9, 'Sun', 2, 'Rooster'),
    // ♥️ 0-9
    new Card('♥️', 0, 'Initiate', 1, 'Duckling'),
    new Card('♥️', 1, 'Ritualist', 2, 'Rooster'),
    new Card('♥️', 2, 'Druid', 3, 'Deer'),
    new Card('♥️', 3, 'Nursemaid', 3, 'Seahorse'),
    new Card('♥️', 4, 'Overseer', 2, 'Giraffe'),
    new Card('♥️', 5, 'Elder', 1, 'Turtle'),
    new Card('♥️', 6, 'Interpreter', 1, 'Chameleon'),
    new Card('♥️', 7, 'Raider', 2, 'Shark'),
    new Card('♥️', 8, 'Zealot', 5, 'Rhino'),
    new Card('♥️', 9, 'Outsider', 1, 'Swallow'),
    // ♦️ 0-9
    new Card('♦️', 0, 'Escapist', 1, 'Squid'),
    new Card('♦️', 1, 'Inquisitor', 1, 'Cat'),
    new Card('♦️', 2, 'Unbeliever', 2, 'Snake'),
    new Card('♦️', 3, 'Exorcist', 1, 'Jellyfish'),
    new Card('♦️', 4, 'Pacifist', 4, 'Panda'),
    new Card('♦️', 5, 'Traitor', 1, 'Mantis'),
    new Card('♦️', 6, 'Sacrifice', 3, 'Lamb'),
    new Card('♦️', 7, 'Talent', 2, 'Frog'),
    new Card('♦️', 8, 'Occultist', 2, 'Bat'),
    new Card('♦️', 9, 'Shepherd', 3, 'Dog'),
    // 🪙 0-9
    new Card('🪙', 0, 'Youth', 5, 'Lamb'),
    new Card('🪙', 1, 'Archmage', 2, 'Fox'),
    new Card('🪙', 2, 'Oracle', 1, 'Dove'),
    new Card('🪙', 3, 'Regent', 2, 'Kangaroo & Joey'),
    new Card('🪙', 4, 'General', 3, 'Eagle'),
    new Card('🪙', 5, 'Noble', 2, 'Bull'),
    new Card('🪙', 6, 'Emissary', 1, 'Butterfly'),
    new Card('🪙', 7, 'Vanguard', 4, 'Boar'),
    new Card('🪙', 8, 'Legion', 3, 'Albatrosses'),
    new Card('🪙', 9, 'Eccentric', 1, 'Clownfish'),
    // 👑 0-9
    new Card('👑', 0, 'Explorer', 1, 'Donkey'),
    new Card('👑', 1, 'Sentinel', 2, 'Crane'),
    new Card('👑', 2, 'Orphan', 2, 'Panda'),
    new Card('👑', 3, 'Executioner', 1, 'Spider'),
    new Card('👑', 4, 'Orderly', 1, 'Dog'),
    new Card('👑', 5, 'Beast', 4, 'Tiger'),
    new Card('👑', 6, 'Usurper', 3, 'Cat'),
    new Card('👑', 7, 'Understudy', 3, 'Lovebirds'),
    new Card('👑', 8, 'Thief', 2, 'Mouse'),
    new Card('👑', 9, 'Blacksmith', 4, 'Swordfish'),
    // 🌙 0-9
    new Card('🌙', 0, 'Novice', 2, 'Puppy'),
    new Card('🌙', 1, 'Alchemist', 1, 'Squid'),
    new Card('🌙', 2, 'Visionary', 4, 'Owl'),
    new Card('🌙', 3, 'Physician', 4, 'Starfish'),
    new Card('🌙', 4, 'Rector', 2, 'Dolphin'),
    new Card('🌙', 5, 'Teacher', 2, 'Kangaroo & Joey'),
    new Card('🌙', 6, 'Trader', 2, 'Monkey'),
    new Card('🌙', 7, 'Navigator', 3, 'Whale'),
    new Card('🌙', 8, 'Outlaw', 1, 'Boar'),
    new Card('🌙', 9, 'Logician', 3, 'Octopus'),
    // ⭐ 0-9
    new Card('⭐', 0, 'Gambler', 4, 'Horse'),
    new Card('⭐', 1, 'Arbiter', 1, 'Elephant'),
    new Card('⭐', 2, 'Insomniac', 1, 'Crow'),
    new Card('⭐', 3, 'Assassin', 1, 'Mantis'),
    new Card('⭐', 4, 'Bystander', 4, 'Cow'),
    new Card('⭐', 5, 'Trickster', 2, 'Fox'),
    new Card('⭐', 6, 'Orator', 1, 'Parrot'),
    new Card('⭐', 7, 'Dremer', 3, 'Butterfly'),
    new Card('⭐', 8, 'Impostor', 2, 'Chameleon'),
    new Card('⭐', 9, 'Weaver', 5, 'Spider'),
    // ♣️ XJQKA
    new Card('♣️', 'X', 'Excuse', 1, 'Seahorse'),
    new Card('♣️', 'J', 'Xroads', 5, 'Firefly'),
    new Card('♣️', 'Q', 'Artistry', 1, 'Manta'),
    new Card('♣️', 'K', 'Exemplar', 1, 'Dolphin'),
    new Card('♣️', 'A', 'Aeon', 2, 'Elephant'),
    // ♠️ XJQKA
    new Card('♠️', 'X', 'Unclean', 2, 'Vulture'),
    new Card('♠️', 'J', 'Regimen', 1, 'Bee'),
    new Card('♠️', 'Q', 'Enigma', 1, 'Octopus'),
    new Card('♠️', 'K', 'Opposition', 1, 'Tiger'),
    new Card('♠️', 'A', 'World', 4, 'Whale'),
    // ♥️ XJQKA
    new Card('♥️', 'X', 'Upstart', 3, 'Puppy'),
    new Card('♥️', 'J', 'Guide', 4, 'Donkey'),
    new Card('♥️', 'Q', 'Muse', 4, 'Swan'),
    new Card('♥️', 'K', 'Idol', 1, 'Bird of Paradise'),
    new Card('♥️', 'A', 'Radiant', 2, 'Firefly'),
    // ♦️ XJQKA
    new Card('♦️', 'X', 'Outcast', 1, 'Mouse'),
    new Card('♦️', 'J', 'Yeoman', 5, 'Bull'),
    new Card('♦️', 'Q', 'Nightmare', 3, 'Centipede'),
    new Card('♦️', 'K', 'Duelist', 2, 'Swordfish'),
    new Card('♦️', 'A', 'Curator', 4, 'Squirrel'),
    // 🪙 XJQKA
    new Card('🪙', 'X', 'Narcissist', 2, 'Deer'),
    new Card('🪙', 'J', 'Immigrant', 1, 'Swallow'),
    new Card('🪙', 'Q', 'Craftsman', 4, 'Monkey'),
    new Card('🪙', 'K', 'Hero', 3, 'Lion'),
    new Card('🪙', 'A', 'Immortal', 1, 'Jellyfish'),
    // 👑 XJQKA
    new Card('👑', 'X', 'Leper', 3, 'Centipede'),
    new Card('👑', 'J', 'Acrobat', 1, 'Frog'),
    new Card('👑', 'Q', 'Angel', 1, 'Bird of Paradise'),
    new Card('👑', 'K', 'Knight', 5, 'Rhino'),
    new Card('👑', 'A', 'Narrator', 2, 'Parrot'),
    // 🌙 XJQKA
    new Card('🌙', 'X', 'Quack', 5, 'Duckling'),
    new Card('🌙', 'J', 'Ranger', 3, 'Bear'),
    new Card('🌙', 'Q', 'Architect', 1, 'Bee'),
    new Card('🌙', 'K', 'Expert', 1, 'Swan'),
    new Card('🌙', 'A', 'Enlightened', 1, 'Albatrosses'),
    // ⭐ XJQKA
    new Card('⭐', 'X', 'Lunatic', 3, 'Wolf'),
    new Card('⭐', 'J', 'Investigator', 2, 'Vulture'),
    new Card('⭐', 'Q', 'Imp', 2, 'Squirrel'),
    new Card('⭐', 'K', 'Rogue', 3, 'Manta'),
    new Card('⭐', 'A', 'Archivist', 1, 'Clam & Pearl'),
])

export function everdeckWord(id: number): string {
    if (isClosed(id)) {
        return '🎴'
    }
    if (id >= 0 && id <= 120) {
        return EverdeckCards[id].word
    }
    return '<No card>'
}

export function everdeckLetter(id: number): string {
    if (isClosed(id)) {
        return '🎴'
    }
    if (id >= 0 && id < 120) {
        return EverdeckCards[id].letter
    }
    return '🃏'
}
export function pcSuitEmoji(id: number): string {
    if (isClosed(id)) {
        return '🎴'
    }
    if (id < 0 || id >= 120) {
        return '🪧'
    }
    const card = EverdeckCards[id]
    switch (card.suit) {
        case '🪙': return '♣️'
        case '👑': return '♠️'
        case '🌙': return '♥️'
        case '⭐': return '♦️'
        default:
            return card.suit
    }
}

export function everdeckSuitEmoji(id: number): string {
    if (isClosed(id)) {
        return '🎴'
    }
    if (id < 0 || id >= 120) {
        return '🪧'
    }
    const card = EverdeckCards[id]
    return card.suit
}

export function suitColor(emoji: EverdeckSuit): 'black' | 'red' | 'yellow' | 'blue' {
    switch (emoji) {
        case '♣️':
        case '♠️':
            return 'black'
        case '♥️':
        case '♦️':
            return 'red'
        case '🪙':
        case '👑':
            return 'yellow'
        case '🌙':
        case '⭐':
            return 'blue'
    }
}

export function pcRankEmoji(id: number): string {
    if (isClosed(id)) {
        return '🎴'
    }
    if (id < 0 || id >= 120) {
        return '🪧'
    }
    const card = EverdeckCards[id]
    if (card.rank === 0 || card.rank === 1) {
        return '🃏'
    }
    if (card.rank === 'X') {
        return '10'
    }
    if (typeof card.rank === 'number') {
        return card.rank.toString()
    }
    return card.rank
}

export function everdeckRankEmoji(id: number): string {
    if (isClosed(id)) {
        return '🎴'
    }
    if (id < 0 || id >= 120) {
        return '🪧'
    }
    const card = EverdeckCards[id]
    if (typeof card.rank === 'number') {
        return card.rank.toString()
    }
    return card.rank
}

export function pcCardEmoji(card: number): string {
    if (isClosed(card)) {
        return '🎴'
    }
    return `${pcRankEmoji(card)}${pcSuitEmoji(card)}`
}

export function everdeckCardEmoji(card: number): string {
    if (isClosed(card)) {
        return '🎴'
    }
    return `${everdeckRankEmoji(card)}${everdeckSuitEmoji(card)}`
}

//#endregion
