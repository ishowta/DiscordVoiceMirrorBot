/**
 * ISC License
 *
 * Copyright (c) 2021, TumoiYorozu
 * Copyright (c) 2021, ishowta
 *
 * Permission to use, copy, modify, and/or distribute this software for any
 * purpose with or without fee is hereby granted, provided that the above
 * copyright notice and this permission notice appear in all copies.
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
 * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
 * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
 * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
 * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
 * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 */

import * as Discord from "discord.js";
import LiveStream from "./LiveStream";
import { config } from "dotenv";

config();

let liveStream: LiveStream | null = null;
let lived1 = false;
let lived2 = false;

async function run() {
  const clients = [new Discord.Client(), new Discord.Client()];

  function regist() {
    if (liveStream === null) {
      const mainCh = clients[0].channels.cache.find(
        (c) => c.id === process.env.DISCORD_DEFAULT_SPAWN_CHANNEL_ID
      ) as Discord.VoiceChannel;
      const subCh = clients[1].channels.cache.find(
        (c) => c.id === process.env.DISCORD_DEFAULT_SPAWN_CHANNEL_ID
      ) as Discord.VoiceChannel;

      liveStream = new LiveStream(mainCh, subCh);
    }

    liveStream.connectVoice();
  }

  clients[0].on("ready", () => {
    console.log("Login! ", clients[0].user ? clients[0].user.username : "");
  });
  clients[1].on("ready", () => {
    console.log("Login! ", clients[1].user ? clients[1].user.username : "");
    //regist();
  });

  async function on_message_main(message: Discord.Message) {
    if (message.content.startsWith("<start")) {
      if (!lived1) {
        lived1 = true;
        message.channel.send("おっけー");
        regist();
      } else {
        message.channel.send("もうやってるよ？");
      }
    }
    if (message.content.startsWith("<stop")) {
      if (lived1) {
        lived1 = false;
        message.channel.send("ばいばい");
        liveStream?.unconnectVoice();
      } else {
        message.channel.send("まだやってないよー");
      }
    }
  }

  async function on_message_sub(message: Discord.Message) {
    if (message.content.startsWith("<start")) {
      if (!lived2) {
        lived2 = true;
        message.channel.send("おっけー");
      } else {
        message.channel.send("もうやってるよ？");
      }
    }
    if (message.content.startsWith("<stop")) {
      if (lived2) {
        lived2 = false;
        message.channel.send("ばいばい");
      } else {
        message.channel.send("まだやってないよー");
      }
    }
  }

  clients[0].on("message", async (message) => await on_message_main(message));
  clients[1].on("message", async (message) => await on_message_sub(message));

  await clients[0].login(process.env.DISCORD_BOT_1_TOKEN);
  await clients[1].login(process.env.DISCORD_BOT_2_TOKEN);
}

run().then(() => {
  console.log("inited.");
});
