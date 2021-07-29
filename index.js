require('dotenv').config();


const express = require('express');
const cors = require('cors');
const port = 6969;
const app = express();
const tmi = require('tmi.js');
const giveMeAJoke = require('give-me-a-joke');
const wouldYouRather = require('./wouldyourather');
const rf = require('random-facts');
const fetch = require('node-fetch');
const jsonfile = require('jsonfile');
const { google } = require('googleapis');
const session = require('express-session');
let passport = require('passport');
const OAuth2Strategy = require('passport-oauth').OAuth2Strategy;
const request = require('request');
const handlebars = require('handlebars');

const TWITCH_CLIENT_ID = process.env.BOT_ID;
const TWITCH_SECRET = process.env.BOT_SECRET;
const SESSION_SECRET = process.env.SESSION_SECRET;
const CALLBACK_URL = `http://localhost:${port}/auth/twitch/callback`;

app.use(express.static(`${__dirname}/../build`));
app.use(session({ secret: SESSION_SECRET, resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());
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




OAuth2Strategy.prototype.userProfile = function (accessToken, done) {
  var options = {
    url: 'https://api.twitch.tv/helix/users',
    method: 'GET',
    headers: {
      'Client-ID': TWITCH_CLIENT_ID,
      'Accept': 'application/vnd.twitchtv.v5+json',
      'Authorization': 'Bearer ' + accessToken
    }
  };

  request(options, function (error, response, body) {
    if (response && response.statusCode == 200) {
      done(null, JSON.parse(body));
    } else {
      done(JSON.parse(body));
    }
  });
}

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});

passport.use('twitch', new OAuth2Strategy({
  authorizationURL: 'https://id.twitch.tv/oauth2/authorize',
  tokenURL: 'https://id.twitch.tv/oauth2/token',
  clientID: TWITCH_CLIENT_ID,
  clientSecret: TWITCH_SECRET,
  callbackURL: CALLBACK_URL,
  state: true
},
  function (accessToken, refreshToken, profile, done) {
    profile.accessToken = accessToken;
    profile.refreshToken = refreshToken;
    sessionInfo.monkeydrumma.accessToken = accessToken;
    sessionInfo.monkeydrumma.broadcastId = profile.data[0].id;
    console.log(profile.data[0].id);
    done(null, profile);
  }
));

// Set route to start OAuth link, this is where you define scopes to request

// Define a simple template to safely generate HTML with values from user's profile
var template = handlebars.compile(`
<html><head><title>Twitch Auth Sample</title></head>
<table>
    <tr><th>Access Token</th><td>{{accessToken}}</td></tr>
    <tr><th>Refresh Token</th><td>{{refreshToken}}</td></tr>
    <tr><th>Display Name</th><td>{{display_name}}</td></tr>
    <tr><th>Bio</th><td>{{bio}}</td></tr>
    <tr><th>Image</th><td>{{logo}}</td></tr>
</table></html>`);

// If user has an authenticated session, display it, otherwise display link to authenticate
app.get('/', function (req, res) {
  if (req.session && req.session.passport && req.session.passport.user) {
    res.send(template(req.session.passport.user));
  } else {
    res.send('<html><head><title>Twitch Auth Sample</title></head><a href="/auth/twitch"><img src="http://ttv-api.s3.amazonaws.com/assets/connect_dark.png"></a></html>');
  }
});




















const auth = new google.auth.GoogleAuth({
  keyFile: "credentials.json",
  scopes: "https://www.googleapis.com/auth/spreadsheets",
})
const sheets = async (range, action, values) => {
  const sheetsClient = await auth.getClient();

  const googleSheets = google.sheets({ version: "v4", auth: sheetsClient });

  let spreadsheetId = "1ZFa3jk0mz2SYAq4xCOPgFDL7ZJMb_ysG5fO-QwFedV8";
  let valueInputOption = 'USER_ENTERED';

  let rows;

  switch (action) {
    case 'getSouls':
      const getSouls = await googleSheets.spreadsheets.values.get({
        auth,
        spreadsheetId,
        range,
      })

      return (getSouls.data.values[1][0]);

    case 'getGems':
      const getGems = await googleSheets.spreadsheets.values.get({
        auth,
        spreadsheetId,
        range,
      })

      rows = getGems.data.values;

      let g = 0;

      for (let r = 1; r < rows.length; r++) {
        if (rows[r][0] == values) {
          g = +rows[r][1];
        }
      }

      return (g);

    case 'updateGems':
      const getCurrGems = await googleSheets.spreadsheets.values.get({
        auth,
        spreadsheetId,
        range,
      })

      let gemrows = getCurrGems.data.values;
      let username = values[0];
      let updatedGemCount = values[1];
      let userRange = `Viewers!A${gemrows.length + 1}:E${gemrows.length + 1}`;
      let updateValues;
      let userNameFound = false;
      for (let r = 1; r < gemrows.length; r++) {
        if (gemrows[r][0] == username) {
          userNameFound = true;
          userRange = `Viewers!B${r + 1}`;
          break;
        }
      }
      if (userNameFound) {
        updateValues = [[updatedGemCount]];
      } else {
        console.log("Username not found. Adding to List.");
        updateValues = [[username, updatedGemCount, 0, 0, 0]];
      }


      let res = {
        values: updateValues,
      }
      const updateGems = await googleSheets.spreadsheets.values.update({
        auth,
        spreadsheetId,
        range: userRange,
        valueInputOption,
        resource: res,
      });

      return ([username, updatedGemCount]);

    case 'getRPSRecord':
      const getRPSRecord = await googleSheets.spreadsheets.values.get({
        auth,
        spreadsheetId,
        range,
      })

      rpsrows = getRPSRecord.data.values;

      let record = [0, 0, 0];

      for (let r = 1; r < rpsrows.length; r++) {
        if (rpsrows[r][0] == values) {
          record[0] = +rpsrows[r][2];
          record[1] = +rpsrows[r][3];
          record[2] = +rpsrows[r][4];
          break;
        }
      }

      return (record);

    case 'updateRPSRecord':
      const getCurrRPSRecord = await googleSheets.spreadsheets.values.get({
        auth,
        spreadsheetId,
        range,
      })

      let recordrows = getCurrRPSRecord.data.values;
      let un = values[0];
      let updatedRecord = values[1];
      let userR = `Viewers!A${recordrows.length + 1}:E${recordrows.length + 1}`;
      let updateV;
      let userNameF = false;
      for (let r = 1; r < recordrows.length; r++) {
        if (recordrows[r][0] == un) {
          userNameF = true;
          userR = `Viewers!C${r + 1}:E${r + 1}`;
          break;
        }
      }
      if (userNameF) {
        updateV = [[updatedRecord[0], updatedRecord[1], updatedRecord[2]]];
      } else {
        console.log("Username not found. Adding to List.");
        updateV = [[un, 0, updatedRecord[0], updatedRecord[1], updatedRecord[2]]];
      }


      let reso = {
        values: updateV,
      }
      const updateRPSRecord = await googleSheets.spreadsheets.values.update({
        auth,
        spreadsheetId,
        range: userR,
        valueInputOption,
        resource: reso,
      });

      return (`Updated ${un}'s rps record to ${updatedRecord}`);

    case 'getItems':
      const getItems = await googleSheets.spreadsheets.values.get({
        auth,
        spreadsheetId,
        range,
      })

      let items = getItems.data.values;

      return (items);

    case 'updateItems':
      const getCurrItems = await googleSheets.spreadsheets.values.get({
        auth,
        spreadsheetId,
        range,
      })

      let itemsrows = getCurrItems.data.values;
      let itemname = values[0].toLowerCase().split(' ').join('-');
      let owner = values[1];
      let trade = values[2];
      let ownerNameRange;
      let updatedItems;
      let itemFound = false;
      let itemOwned = false;
      let itemOwner = '';
      for (let r = 1; r < itemsrows.length; r++) {
        if (itemsrows[r][2].toLowerCase().split(' ').join('-') == itemname) {
          itemFound = true;
          if (itemsrows[r][1] === 'none' || trade) {
            ownerNameRange = `Items!B${r + 1}`;
            break;
          } else {
            itemOwned = true;
            itemOwner = itemsrows[r][1];
            break;
          }
        }
      }
      if (itemOwned && !trade) {
        return (`${itemOwner}`);
      }
      if (itemFound) {
        updatedItems = [[owner]];
      } else {
        console.log("Item not found.");
      }


      let Itemsres = {
        values: updatedItems,
      }
      const updateItems = await googleSheets.spreadsheets.values.update({
        auth,
        spreadsheetId,
        range: ownerNameRange,
        valueInputOption,
        resource: Itemsres,
      });

      return ('success');

    default:
      const metaData = await googleSheets.spreadsheets.get({
        auth,
        spreadsheetId,
      })
      return (metaData.data);
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
client.on('whisper', onWhisperHandler);
client.on('connected', onConnectedHandler);
client.on('join', onJoinHandler);
client.on('part', onPartHandler);

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