import type { CommandInteraction, MessagePayload } from '@buape/carbon'
import { findDealerDeck, TableState } from '../../models/table.ts'
import { TableTransactionCommand } from '../table-tx.ts'

export class SpreadCommand extends TableTransactionCommand {
  name = 'spread'
  override description = 'Discard a spread of cards'

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
    if (deck.discard === null || deck.spread === null) {
      return Promise.resolve({
        content:
          'The deck you are dealing does not have a default discard pile or spread.',
        ephemeral: true,
      })
    }
    const discard = table.state[deck.discard]
    const spread = table.state[deck.spread]
    const spreadInfo = table.sets[deck.spread]
    if (!discard || !spread || !spreadInfo) {
      return Promise.resolve({
        content: 'The discard pile or spread is missing from the table state.',
        ephemeral: true,
      })
    }
    if (spread.length <= 0) {
      return Promise.resolve({
        content: `No cards to discard.`,
        ephemeral: true,
      })
    }
    const count = spread.length
    while (spread.length > 0) {
      // default face up
      discard.push(spread.pop()!.unclose())
    }
    return Promise.resolve({
      content: `Discarded ${count} cards from ${spreadInfo.name}.`,
      ephemeral: false,
    })
  }
}
