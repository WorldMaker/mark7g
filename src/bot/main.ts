import { Client } from '@buape/carbon'
import { createHandler } from '@buape/carbon/adapters/fetch'

const BaseUrl = Deno.env.get('BASE_URL')
const DeploySecret = Deno.env.get('DEPLOY_SECRET')
const ClientId = Deno.env.get('DISCORD_CLIENT_ID')
const PublicKey = Deno.env.get('DISCORD_PUBLIC_KEY')
const Token = Deno.env.get('DISCORD_TOKEN')
const devGuilds = Deno.env.get('DEV_GUILDS')?.split(',') ?? undefined

const client = new Client({
  baseUrl: BaseUrl!,
  deploySecret: DeploySecret!,
  clientId: ClientId!,
  publicKey: PublicKey!,
  token: Token!,
  devGuilds,
}, { commands: [] })

if (import.meta.main) {
  const handler = createHandler(client)

  Deno.serve((request) => handler(request, {}))
}
