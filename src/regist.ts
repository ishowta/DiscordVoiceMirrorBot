import fetch from "node-fetch";
import { config } from "dotenv";

config();

const BOT_ID = process.env.DISCORD_BOT_1_APPLICATION_ID;
const BOT_TOKEN = process.env.DISCORD_BOT_1_TOKEN;
const GUILD_ID = process.env.DISCORD_GUILD_ID;

const commandsRegistAPIEndpoint = `https://discord.com/api/v8/applications/${BOT_ID}/guilds/${GUILD_ID}/commands`;
const commands = [
  {
    name: "join",
    description:
      "マイを`from`へ指定したチャンネルへ、スピカを`to`へ指定したチャンネルへスポーンさせ、ミラーが始まります",
    options: [
      {
        name: "from",
        description: "マイをスポーンさせるボイスチャンネル",
        type: 7,
        required: true,
      },
      {
        name: "to",
        description: "スピカをスポーンさせるボイスチャンネル",
        type: 7,
        required: true,
      },
    ],
  },
  {
    name: "leave",
    description: "マイとスピカにお別れをします",
    options: [],
  },
];

async function register(command: Object) {
  const response = await fetch(commandsRegistAPIEndpoint, {
    method: "post",
    body: JSON.stringify(command),
    headers: {
      Authorization: `Bot ${BOT_TOKEN}`,
      "Content-Type": "application/json",
    },
  });

  const json = await response.json();

  console.log(json);
}

for (const command of commands) {
  register(command);
}
