import { Command, type CommandInteraction, MessagePayload } from '@buape/carbon'
import {
  deserialize,
  getTable,
  serialize,
  TableState,
  TableStore,
  updateTable,
} from '../models/table.ts'

export abstract class TableTransactionCommand extends Command {
  override defer = true

  override preCheck(interaction: CommandInteraction): Promise<boolean> {
    return Promise.resolve(
      interaction.channel !== null && interaction.channel.isSendable(),
    )
  }

  abstract updateTable(
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
      const messagePayload = await this.updateTable(interaction, state)

      const updatedStore = serialize(state)
      await updateTable(kv, updatedStore, result.versionstamp)

      await interaction.reply(messagePayload)
    } catch (error) {
      console.error('Failed to update table:', interaction.channel!.id, error)
      interaction.reply('Failed to update table.')
    } finally {
      kv.close()
    }
  }
}
