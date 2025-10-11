import { spawn } from 'child_process';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: '../.env' });

const PORT = process.env.WEBHOOK_PORT || 3001;
const ngrokPath = path.join(__dirname, 'node_modules', 'ngrok', 'bin', 'ngrok.exe');

console.log('🔄 Starting ngrok tunnel using CLI...\n');
console.log(`📍 Port: ${PORT}`);
console.log(`🔧 Ngrok binary: ${ngrokPath}\n`);

// Start ngrok using the CLI directly
const ngrokProcess = spawn(ngrokPath, ['http', PORT.toString(), '--log=stdout'], {
  stdio: ['ignore', 'pipe', 'pipe']
});

let tunnelUrl = null;
let isReady = false;

ngrokProcess.stdout.on('data', (data) => {
  const output = data.toString();
  
  // Look for the tunnel URL in the output
  const urlMatch = output.match(/url=(https:\/\/[^\s]+)/);
  if (urlMatch && !tunnelUrl) {
    tunnelUrl = urlMatch[1];
    isReady = true;
    
    console.log('✅ Ngrok tunnel established!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📡 PUBLIC WEBHOOK URL:');
    console.log(`   ${tunnelUrl}/api/webhooks/paystack`);
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
  }
  
  // Show other important messages
  if (output.includes('lvl=eror') || output.includes('lvl=crit')) {
    console.error('❌ Error:', output);
  }
});

ngrokProcess.stderr.on('data', (data) => {
  const error = data.toString();
  if (!error.includes('lvl=info')) {
    console.error('⚠️  Warning:', error);
  }
});

ngrokProcess.on('error', (error) => {
  console.error('❌ Failed to start ngrok:', error.message);
  process.exit(1);
});

ngrokProcess.on('close', (code) => {
  if (code !== 0 && code !== null) {
    console.log(`\n🔴 Ngrok process exited with code ${code}`);
  } else {
    console.log('\n🔴 Ngrok tunnel closed');
  }
  process.exit(code || 0);
});

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  console.log('\n🔴 Closing ngrok tunnel...');
  ngrokProcess.kill();
  process.exit(0);
});

// Timeout check
setTimeout(() => {
  if (!isReady) {
    console.log('\n⏱️  Ngrok is taking longer than expected...');
    console.log('💡 This might mean:');
    console.log('   1. The webhook server is not running on port', PORT);
    console.log('   2. Your auth token needs to be configured');
    console.log('   3. There\'s a network issue\n');
    console.log('📝 Check the logs above for more details');
  }
}, 10000);