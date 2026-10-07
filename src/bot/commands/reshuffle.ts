import { CommandInteraction, MessagePayload } from '@buape/carbon'
import { displaySet, findDealerDeck, TableState } from '../models/table.ts'
import { TableTransactionCommand } from './table-tx.ts'

export class ReshuffleCommand extends TableTransactionCommand {
  name = 'reshuffle'
  override description = 'Reshuffle the discard into the deck'

  override async preCheck(interaction: CommandInteraction): Promise<boolean> {
    return (await super.preCheck(interaction)) && interaction.user !== null
  }

  override updateTable(
    interaction: CommandInteraction,
    table: TableState,
  ): Promise<MessagePayload> {
    const dealer = interaction.user!.id
    const deck = findDealerDeck(table, dealer)
    if (!deck) {
      return Promise.resolve({
        content: "You aren't the dealer of a deck.",
        ephemeral: true,
      })
    }
    if (deck.draw === null || deck.discard === null) {
      return Promise.resolve({
        content:
          'The deck you are dealing does not have a default draw pile or discard pile.',
        ephemeral: true,
      })
    }
    const draw = table.state[deck.draw]
    const discard = table.state[deck.discard]
    const discardInfo = table.sets[deck.discard]
    if (!draw || !discard || !discardInfo) {
      return Promise.resolve({
        content:
          'The draw pile or discard pile is missing from the table state.',
        ephemeral: true,
      })
    }

    if (discard.length === 0) {
      return Promise.resolve({
        content: `No cards in the discard pile to reshuffle.`,
        ephemeral: true,
      })
    }

    // default face down
    draw.shuffle(discard.clear().map((card) => card.close()))

    return Promise.resolve({
      content: `${displaySet(table, deck.discard)}\n${
        displaySet(table, deck.draw)
      }`,
      ephemeral: false,
    })
  }
}
