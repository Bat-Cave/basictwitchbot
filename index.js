const express = require('express');
const cors = require('cors');
const port = 6969;
const app = express();
const tmi = require('tmi.js');;

app.use(express.static(`${__dirname}/../build`));
app.use(express.json());
app.use(cors());

let sessionInfo = {
  monkeydrumma: {
    viewers: [],
    viewerCount: 0,
    accessToken: '',
    saidHello: [],
    rps: [],
    rpsBattles: [],
    itemsBought: [],
    gemsGiven: [],
    viewerInIntervalCount: [],
    raffleStarted: false,
    raffleInfo: [],
    battleSteps: [false, false, false, false],
    battleStarted: false,
    readyToAttack: true,
    displaySprites: [],
    trades: [],
    broadcastId: '',
    rpsBattles: [],
    gambleTimeout: [],
    bttvEmotes: ['monkaS', 'blobDance', 'ricardoFlick', 'ddHuh', 'headBang', 'CrabPls', 'KEKW', 'WaitWhat', 'DIAMOND', 'catShake', 'kongPLS', 'Dance', 'hypeE', 'steveP', 'saxJAM']
  }
}


// Define configuration options
const opts = {
  options: {
    clientId: '5devpuv8z5lzj04naarp8jazoohys2',
  },
  identity: {
    username: 'bilbobanana',
    password: 'oauth:ognxy9xf874v1pbwt8k6ecig5uxp4i'
  },
  channels: [
    'monkeydrumma'
  ]
};



// Create a client with our options
const client = new tmi.client(opts);

// Register our event handlers (defined below)
client.on('chat', onMessageHandler);
client.on('connected', onConnectedHandler);
// client.on('join', onJoinHandler);
// client.on('part', onPartHandler);

// Connect to Twitch:
client.connect();

//Commands
let commands = [
  { name: '!rps', desc: 'Play Rock, Paper, Scissors agains MegaMonkey' },
//   { name: '!dadjoke', desc: 'MegaMonkey tells you a dad joke' },
//   { name: '!wyr', desc: 'MegaMonkey asks a would you rather question' },
//   { name: '!randomfact', desc: 'MegaMonkey tells you a random fact' },
//   { name: '!discord', desc: 'Get my discord invite link' },
//   { name: '!steam', desc: 'Get my steam friend code' },
//   { name: '!tiktok', desc: 'Get my tik tok link' },
//   { name: '!youtube', desc: 'Get my youtube link' },
//   { name: '!emotes', desc: 'See a list of available emotes' },
//   { name: '!followage', desc: 'See how long you have been following this channel' },
//   { name: '!shop', desc: 'Get a link to the Gem shop' },
//   { name: '!gemcount', desc: 'See how many Gems you have' },
//   { name: '!skins', desc: 'Get a link to the latest boss battle skins' },
]


// Called every time a message comes in
async function onMessageHandler(target, context, msg, self) {
  if (self) { return; }

  let channel = target.slice(1, target.length);
  let messageId = context.id;
  let commandExecuted = '';

  const commandName = msg.split(' ');
  const command = commandName[0].trim().toLowerCase();
  const params = commandName[1] ? commandName[1].trim().toLowerCase() : '';
  const params2 = commandName[2] ? commandName[2].trim().toLowerCase() : '';
  const params3 = commandName[3] ? commandName[3].trim().toLowerCase() : '';


  if (!sessionInfo[channel].saidHello.includes(context.username)) {
    let badges = context.badges;
    let message = `<3 Hello, ${context.username}! Thank you for being here <3`;
    if (badges && badges.vip) {
      message = `Roll out the Red Carpet, we have a VIP here. Welcome ${context.username}! ThankEgg`;
    }
    if (badges && badges.moderator) {
      message = `KomodoHype Mod ${context.username} in the house! KomodoHype `;
    }
    if (context.username === 'brookedawson2') {
      message = `Sugar Daddy ${context.username} is here! VirtualHug VirtualHug VirtualHug `;
    }
    if (context.username === 'totally_not_lord') {
      message = `PrimeMe THE LORD HAS ARRIVEEE PrimeMe`;
    }
    if (context.username === 'frostedflakes4206969') {
      message = `Time to grab some milk! ${context.username} is here! DoritosChip DoritosChip DoritosChip `;
    }
    if (context.username === 'luluboberts') {
      message = `<3 <3 <3 <3 OUR WIFE IS HERE <3 <3 <3 <3 `;
    }
    commandExecuted = '!hello';
    sessionInfo[channel].saidHello.push(context.username)
    client.say(target, message);
  }

}

// Called every time the bot connects to Twitch chat
function onConnectedHandler(addr, port) {
  console.log(`Connected to ${addr}:${port}`);
  client.api({
    url: `https://id.twitch.tv/oauth2/token?client_id=${process.env.BOT_ID}&client_secret=${process.env.BOT_SECRET}&grant_type=client_credentials`,
    method: "POST",
  }, (err, res, body) => {
    sessionInfo['monkeydrumma'].accessToken = body.access_token;
  });
}



app.listen(port, () => console.log(`Server started on ${port}`));