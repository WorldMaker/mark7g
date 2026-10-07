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
      const updated = await updateTable(kv, updatedStore, result.versionstamp)

      if (updated.ok) {
        await interaction.reply(messagePayload)
      } else {
        console.error(
          'Failed to update table:',
          interaction.channel!.id,
          updated,
        )
        await interaction.reply({
          content: 'Failed to update table.',
          ephemeral: true,
        })
      }
    } catch (error) {
      console.error('Failed to update table:', interaction.channel!.id, error)
      interaction.reply({ content: 'Failed to update table.', ephemeral: true })
    } finally {
      kv.close()
    }
  }
}
