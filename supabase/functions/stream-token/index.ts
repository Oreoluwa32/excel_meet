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
    const { user_id } = await req.json()

    if (!user_id) {
      return new Response(JSON.stringify({ error: 'user_id is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Create token for the user
    const token = serverClient.createToken(user_id)

    return new Response(JSON.stringify({ token }), {
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
