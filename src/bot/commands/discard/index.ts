import { CommandWithSubcommands } from '@buape/carbon'
import { SpreadCommand } from './spread.ts'

export class DiscardCommand extends CommandWithSubcommands {
  name = 'discard'
  override description = 'Discard cards'
  subcommands = [new SpreadCommand()]
}
