require('dotenv').config();
const localtunnel = require('localtunnel');
const fs = require('fs');
const path = require('path');
const { server, setWebappUrl, bot } = require('./server');

const PORT = process.env.PORT || 5000;
const SUBDOMAIN = 'checkaccount123-app';

let activeTunnel = null;

async function getPublicIP() {
  try {
    const res = await fetch('https://api.ipify.org');
    return await res.text();
  } catch (e) {
    return '175.100.11.77';
  }
}

async function establishTunnel() {
  console.log(`\n⏳ Connecting stable tunnel on port ${PORT}...`);

  const publicIP = await getPublicIP();

  try {
    activeTunnel = await localtunnel({
      port: PORT,
      subdomain: SUBDOMAIN
    });

    const publicUrl = activeTunnel.url;

    // Update in server & bot
    setWebappUrl(publicUrl);

    // Save to .env
    const envPath = path.join(__dirname, '.env');
    let envContent = fs.readFileSync(envPath, 'utf8');
    if (envContent.includes('WEBAPP_URL=')) {
      envContent = envContent.replace(/WEBAPP_URL=.*/g, `WEBAPP_URL=${publicUrl}`);
    } else {
      envContent += `\nWEBAPP_URL=${publicUrl}\n`;
    }
    fs.writeFileSync(envPath, envContent, 'utf8');

    console.log(`\n` + `='.`.repeat(30));
    console.log(`🏆 1xBET TELEGRAM MINI APP IS LIVE!`);
    console.log(`='.`.repeat(30));
    console.log(`\n📌 1. URL TO SEND TO BOTFATHER:`);
    console.log(`\x1b[32m\x1b[1m👉  ${publicUrl}  👈\x1b[0m\n`);
    console.log(`📌 2. If it asks for Tunnel Password, enter your Public IP:`);
    console.log(`👉  \x1b[33m\x1b[1m${publicIP}\x1b[0m\n`);
    console.log(`📌 3. Open Telegram & Test your Bot:`);
    console.log(`👉  @Checkaccount123_bot`);
    console.log(`👉  Tap 'Launch 1xBet Mini App' or the '⚽ 1xBet App' menu button!\n`);
    console.log(`📌 4. Local Web Preview:`);
    console.log(`👉  http://localhost:${PORT}`);
    console.log(`='.`.repeat(30) + `\n`);

    activeTunnel.on('close', () => {
      console.log('Tunnel connection lost. Reconnecting in 3s...');
      setTimeout(establishTunnel, 3000);
    });

    activeTunnel.on('error', (err) => {
      console.warn('Tunnel warning:', err.message);
    });

  } catch (err) {
    console.error('Localtunnel startup error:', err.message);
    console.log('Retrying in 5 seconds...');
    setTimeout(establishTunnel, 5000);
  }
}

// Start tunnel after server binds
setTimeout(establishTunnel, 1200);
