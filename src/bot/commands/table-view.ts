import { Command, type CommandInteraction, MessagePayload } from '@buape/carbon'
import {
  deserialize,
  getTable,
  TableState,
  TableStore,
} from '../models/table.ts'

export abstract class TableViewCommand extends Command {
  override defer = true

  override preCheck(interaction: CommandInteraction): Promise<boolean> {
    return Promise.resolve(
      interaction.channel !== null && interaction.channel.isSendable(),
    )
  }

  abstract viewTable(
    interaction: CommandInteraction,
    state: TableState,
  ): Promise<MessagePayload>

  override async run(interaction: CommandInteraction) {
    const kv = await Deno.openKv()
    const result = await getTable(kv, interaction.channel!.id)
    const store: TableStore = result.value ??
      {
        id: interaction.channel!.id,
        decks: [],
        sets: [],
        state: new Uint8Array(),
      }
    const state = deserialize(store)

    try {
      const messagePayload = await this.viewTable(interaction, state)
      await interaction.reply(messagePayload)
    } catch (error) {
      console.error('Failed to view table:', interaction.channel!.id, error)
      interaction.reply({ content: 'Failed to view table.', ephemeral: true })
    } finally {
      kv.close()
    }
  }
}
