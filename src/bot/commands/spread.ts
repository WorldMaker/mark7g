import type { CommandInteraction, MessagePayload } from '@buape/carbon'
import { displaySet, findDealerDeck, TableState } from '../models/table.ts'
import { TableTransactionCommand } from './table-tx.ts'

export class SpreadCommand extends TableTransactionCommand {
  name = 'spread'
  override description = 'Spread a number of cards onto the table'
  override options = [
    {
      name: 'count',
      type: 4, // ApplicationCommandOptionType.Integer,
      description: 'Number of cards to spread',
      required: false,
    },
  ]

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
    if (deck.draw === null || deck.spread === null) {
      return Promise.resolve({
        content:
          'The deck you are dealing does not have a default draw pile or spread.',
        ephemeral: true,
      })
    }
    const draw = table.state[deck.draw]
    const spread = table.state[deck.spread]
    const spreadInfo = table.sets[deck.spread]
    if (!draw || !spread || !spreadInfo) {
      return Promise.resolve({
        content: 'The draw pile or spread is missing from the table state.',
        ephemeral: true,
      })
    }
    const count = interaction.options.getInteger('count') ?? 1
    if (count > draw.length) {
      return Promise.resolve({
        content:
          `Cannot spread ${count} cards. Only ${draw.length} cards available in the draw pile.`,
        ephemeral: true,
      })
    }
    for (let i = 0; i < count; i++) {
      // default face up
      spread.push(draw.pop()!.unclose())
    }
    return Promise.resolve({
      content: displaySet(table, deck.spread),
      ephemeral: false,
    })
  }
}
