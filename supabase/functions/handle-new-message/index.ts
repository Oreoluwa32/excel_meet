// Supabase Edge Function to handle new messages and trigger Pusher
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

    // Standard Supabase Webhook payload structure
    const { record, type, table } = payload

    if (type !== 'INSERT' || table !== 'messages' || !record) {
      return new Response(JSON.stringify({ skipped: true }), { headers: { 'Content-Type': 'application/json' } })
    }

    // Extract message details
    const { conversation_id, sender_id, content, created_at, id } = record
    const channel = `chat-${conversation_id}`
    const event = 'new-message'
    const data = {
      id,
      conversationId: conversation_id,
      senderId: sender_id,
      content,
      createdAt: created_at,
      isRead: false
    }

    // Trigger Pusher event
    const pusherUrl = `https://api-${PUSHER_CLUSTER}.pusher.com/apps/${PUSHER_APP_ID}/events`
    
    const body = JSON.stringify({
      name: event,
      channel: channel,
      data: JSON.stringify(data),
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

    const result = await response.json()
    console.log('Pusher response:', result)

    return new Response(JSON.stringify(result), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
})
