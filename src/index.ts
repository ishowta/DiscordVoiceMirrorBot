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
let nowLived = false;

async function run() {
  const clients = [new Discord.Client(), new Discord.Client()];

  function regist(from: string, to: string) {
    liveStream?.unconnectVoice();

    setTimeout(() => {
      const mainCh = clients[0].channels.cache.find(
        (c) => c.id === from
      ) as Discord.VoiceChannel;
      const subCh = clients[1].channels.cache.find(
        (c) => c.id === to
      ) as Discord.VoiceChannel;

      liveStream = new LiveStream(mainCh, subCh);

      liveStream.connectVoice();
    }, 500);
  }

  clients[0].on("ready", () => {
    console.log(
      "Login! ",
      clients[0].user ? clients[0].user.username : "Unknown"
    );
  });
  clients[1].on("ready", () => {
    console.log(
      "Login! ",
      clients[1].user ? clients[1].user.username : "Unknown"
    );
  });

  clients[0].ws.on("INTERACTION_CREATE" as any, async (interaction) => {
    const command = interaction.data.name as "join" | "leave";
    const args = interaction.data.options as {
      value: string;
      type: number;
      name: string;
    }[];

    let responseMessage = "";

    switch (command) {
      case "join": {
        nowLived = true;
        responseMessage = "おっけー";
        regist(args[0].value, args[1].value);
        break;
      }
      case "leave": {
        if (nowLived) {
          nowLived = false;
          responseMessage = "ばいばい";
          liveStream?.unconnectVoice();
        } else {
          responseMessage = "まだやってないよー";
        }
        break;
      }
    }

    const response = {
      data: {
        type: 4,
        data: {
          content: responseMessage,
        },
      },
    };

    (clients[0] as any).api
      .interactions(interaction.id, interaction.token)
      .callback.post(response);

    const subCliCh = clients[1].channels.cache.find(
      (ch) => ch.id === interaction.channel_id
    );
    if (subCliCh && subCliCh.type === "text") {
      (subCliCh as Discord.TextChannel).send(responseMessage);
    }
  });

  await clients[0].login(process.env.DISCORD_BOT_1_TOKEN);
  await clients[1].login(process.env.DISCORD_BOT_2_TOKEN);
}

run().then(() => {
  console.log("inited.");
});
