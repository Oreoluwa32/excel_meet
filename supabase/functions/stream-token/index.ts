import { serve } from 'https://deno.land/std@0.192.0/http/server.ts'
import { StreamChat } from 'npm:stream-chat'

const STREAM_API_KEY = Deno.env.get('STREAM_API_KEY')
const STREAM_SECRET_KEY = Deno.env.get('STREAM_SECRET_KEY')

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    })
  }

  try {
    const serverClient = StreamChat.getInstance(STREAM_API_KEY!, STREAM_SECRET_KEY!)
    const { user_id, user_data, sync_users } = await req.json()

    if (!user_id && !sync_users) {
      return new Response(JSON.stringify({ error: 'user_id or sync_users is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Upsert the current user if data provided
    if (user_id && user_data) {
      await serverClient.upsertUser({
        id: user_id,
        ...user_data
      })
    }

    // Sync other users if provided
    if (sync_users && Array.isArray(sync_users)) {
      await serverClient.upsertUsers(sync_users)
    }

    // Create token for the user if user_id provided
    const token = user_id ? serverClient.createToken(user_id) : null

    return new Response(JSON.stringify({ token, success: true }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'An unknown error occurred' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
