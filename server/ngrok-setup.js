import ngrok from 'ngrok';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

const PORT = process.env.WEBHOOK_PORT || 3001;

async function startNgrok() {
  try {
    console.log('🔄 Starting ngrok tunnel...\n');
    
    // First, aggressively disconnect any existing tunnels
    try {
      console.log('🧹 Cleaning up any existing ngrok tunnels...');
      await ngrok.disconnect();
      await ngrok.kill();
      // Wait for cleanup to complete and ngrok to fully shut down
      await new Promise(resolve => setTimeout(resolve, 3000));
      console.log('✅ Cleanup complete\n');
    } catch (cleanupError) {
      // Ignore cleanup errors - there might not be any existing tunnels
      console.log('ℹ️  No existing tunnels to clean up\n');
      // Still wait a bit to ensure clean state
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Build ngrok config
    const ngrokConfig = {
      addr: PORT,
      proto: 'http',
      onStatusChange: status => {
        console.log('📊 Ngrok status:', status);
      },
      onLogEvent: data => {
        console.log('📝 Ngrok log:', data);
      }
    };
    
    // Only add authtoken if it exists and is not empty
    if (process.env.NGROK_AUTH_TOKEN && process.env.NGROK_AUTH_TOKEN.trim() !== '') {
      ngrokConfig.authtoken = process.env.NGROK_AUTH_TOKEN;
    }
    
    console.log('🔌 Connecting to ngrok...');
    const url = await ngrok.connect(ngrokConfig);

    console.log('✅ Ngrok tunnel established!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📡 PUBLIC WEBHOOK URL:');
    console.log(`   ${url}/api/webhooks/paystack`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('📋 SETUP INSTRUCTIONS:');
    console.log('   1. Copy the URL above');
    console.log('   2. Go to https://dashboard.paystack.com/settings/developer');
    console.log('   3. Scroll to "Webhook URL" section');
    console.log('   4. Paste the URL and save');
    console.log('   5. Select these events:');
    console.log('      • charge.success');
    console.log('      • subscription.create');
    console.log('      • subscription.disable');
    console.log('      • subscription.not_renew');
    console.log('      • invoice.create');
    console.log('      • invoice.update');
    console.log('      • invoice.payment_failed');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('⚠️  Keep this terminal window open to maintain the tunnel!\n');

    // Keep the process running
    process.on('SIGINT', async () => {
      console.log('\n🔴 Closing ngrok tunnel...');
      await ngrok.disconnect();
      await ngrok.kill();
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Error starting ngrok:', error.message);
    console.error('\nFull error:', error);
    
    if (error.message.includes('authtoken') || error.message.includes('authentication')) {
      console.log('\n💡 TIP: Get a free ngrok auth token:');
      console.log('   1. Sign up at https://ngrok.com/');
      console.log('   2. Get your auth token from https://dashboard.ngrok.com/get-started/your-authtoken');
      console.log('   3. Add to .env: NGROK_AUTH_TOKEN=your_token_here\n');
    } else if (error.message.includes('tunnel') || error.message.includes('configuration')) {
      console.log('\n💡 TROUBLESHOOTING:');
      console.log('   1. Make sure the webhook server is running on port', PORT);
      console.log('   2. Check if another ngrok tunnel is already running');
      console.log('   3. Try killing any existing ngrok processes:');
      console.log('      Get-Process ngrok | Stop-Process -Force');
      console.log('   4. Sign up for a free ngrok account at https://ngrok.com/');
      console.log('   5. Add your auth token to .env file\n');
    } else if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 TIP: Make sure the webhook server is running first!');
      console.log('   Run this in another terminal:');
      console.log('   cd c:\\Users\\oreol\\Documents\\Projects\\excel_meet\\server');
      console.log('   npm start\n');
    }
    
    process.exit(1);
  }
}

startNgrok();