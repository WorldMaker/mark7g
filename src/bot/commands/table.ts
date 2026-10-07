import { CommandInteraction, MessagePayload } from '@buape/carbon'
import { TableViewCommand } from './table-view.ts'
import { displaySet, TableState } from '../models/table.ts'

export class TableCommand extends TableViewCommand {
  name = 'table'
  override description = 'View the table'

  override viewTable(
    _interaction: CommandInteraction,
    state: TableState,
  ): Promise<MessagePayload> {
    const sets = state.sets.map((_set, idx) => displaySet(state, idx))
    const table = sets.join('\n')
    return Promise.resolve({
      content: table,
      ephemeral: false,
    })
  }
}
