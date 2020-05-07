import * as Discord from 'discord.js'
import { promises as fs } from 'fs'
import { applyMiddleware, createStore } from 'redux'
import { createEpicMiddleware } from 'redux-observable'
import { BotToken } from './secrets.json'

const StoreFile = 'store.json'
const rootEpic: any = null // TODO
const reducer: any = null // TODO

async function main (): Promise<void> {
  const client = new Discord.Client()

  const epicMiddleware = createEpicMiddleware</* TODO */ any, unknown, unknown>({
    dependencies: {
      client
    }
  })

  let baseState: any

  try {
    const storeFile = await fs.readFile(StoreFile)
    if (typeof storeFile === 'string') {
      baseState = JSON.parse(storeFile)
    }
  } catch (err) {
    console.warn('No previous state', err)
  }

  const store = createStore(reducer, baseState, applyMiddleware(epicMiddleware))

  client.on('error', err => console.error(err))
  client.on('ready', () => console.log(`Logged in as ${client.user?.tag ?? '*unknown*'}!`))

  await client.login(BotToken)
  await client.user?.setPresence({
    activity: { name: 'bureaucrat', type: 'PLAYING' }
  })

  epicMiddleware.run(rootEpic)

  // Try to cleanly disconnect
  process.on('SIGINT', async () => {
    console.log('Logging out…')
    // TODO: Shutdown epics
    try {
      await client.destroy()
    } catch (err) {
      console.error('Error disconnecting', err)
    }
    console.log('Saving final state…')
    try {
      await fs.writeFile(StoreFile, JSON.stringify(store.getState()), { encoding: 'utf-8' })
    } catch (err) {
      console.error('Error saving state', err)
    }
    // Ensure the process exits
    process.exit()
  })
}

main()
  .catch(err => console.error(err))
