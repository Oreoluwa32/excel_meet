// Supabase Edge Function to handle new messages/conversations and trigger Pusher
import { serve } from 'https://deno.land/std@0.192.0/http/server.ts'

const PUSHER_APP_ID = Deno.env.get('PUSHER_APP_ID')
const PUSHER_KEY = Deno.env.get('PUSHER_KEY')
const PUSHER_SECRET = Deno.env.get('PUSHER_SECRET')
const PUSHER_CLUSTER = Deno.env.get('PUSHER_CLUSTER') || 'eu'

serve(async (req) => {
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
    const payload = await req.json()
    console.log('Webhook payload received:', payload)

    const { record, type, table } = payload

    if (!record) {
      return new Response(JSON.stringify({ skipped: true, reason: 'No record' }), { headers: { 'Content-Type': 'application/json' } })
    }

    let pusherEvents = []

    if (table === 'messages' && type === 'INSERT') {
      // 1. Notify the specific chat channel
      pusherEvents.push({
        channel: `chat-${record.conversation_id}`,
        name: 'new-message',
        data: {
          id: record.id,
          conversationId: record.conversation_id,
          senderId: record.sender_id,
          content: record.content,
          createdAt: record.created_at,
          isRead: false
        }
      })

      // 2. Also notify the participants' conversation lists that an update happened
      // We need to know who the participants are. 
      // Since we don't have the conversation record here, we can't easily get both IDs
      // but we can at least notify that something changed.
      // For now, we'll focus on the chat channel which is the most critical.
    } 
    
    if (table === 'conversations' && type === 'INSERT') {
      // Notify both participants about the new conversation
      const participants = [record.participant_1_id, record.participant_2_id]
      participants.forEach(userId => {
        pusherEvents.push({
          channel: `user-${userId}-conversations`,
          name: 'new-conversation',
          data: record
        })
      })
    }

    if (pusherEvents.length === 0) {
      return new Response(JSON.stringify({ skipped: true }), { headers: { 'Content-Type': 'application/json' } })
    }

    // Trigger Pusher events (one by one or use batching if supported)
    // For simplicity, we'll just trigger the first one for now as it's the most common
    // or loop if there are multiple.
    
    const results = []
    for (const event of pusherEvents) {
      const pusherUrl = `https://api-${PUSHER_CLUSTER}.pusher.com/apps/${PUSHER_APP_ID}/events`
      
      const body = JSON.stringify({
        name: event.name,
        channel: event.channel,
        data: JSON.stringify(event.data),
      })

      const timestamp = Math.floor(Date.now() / 1000)
      const bodyMd5 = await crypto.subtle.digest('MD5', new TextEncoder().encode(body))
      const bodyMd5Hex = Array.from(new Uint8Array(bodyMd5))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')

      const authString = `POST\n/apps/${PUSHER_APP_ID}/events\nauth_key=${PUSHER_KEY}&auth_timestamp=${timestamp}&auth_version=1.0&body_md5=${bodyMd5Hex}`
      
      const key = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(PUSHER_SECRET),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      )
      
      const signature = await crypto.subtle.sign(
        'HMAC',
        key,
        new TextEncoder().encode(authString)
      )
      
      const authSignature = Array.from(new Uint8Array(signature))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')

      const response = await fetch(
        `${pusherUrl}?auth_key=${PUSHER_KEY}&auth_timestamp=${timestamp}&auth_version=1.0&body_md5=${bodyMd5Hex}&auth_signature=${authSignature}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: body,
        }
      )
      results.push(await response.json())
    }

    return new Response(JSON.stringify(results), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), { status: 500 })
  }
})
