// app/api/frames/route.js

import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import tmp from 'tmp';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');
  const timestamp = searchParams.get('timestamp');
  

  if (!url || !timestamp) {
    return NextResponse.json({ error: 'url and timestamp are required' }, { status: 400 });
  }

  const cleanUrl = url.split('?')[0]; // Remove ?si=...
  const tempDir = tmp.dirSync({ unsafeCleanup: true });
  const outputImage = path.join(tempDir.name, 'thumb.jpg');

  // Use yt-dlp instead of youtube-dl here
  const ytdlCmd = `yt-dlp -f worst -g "${cleanUrl}"`;

  return new Promise((resolve) => {
    exec(ytdlCmd, (err, stdout) => {
      if (err) {
        return resolve(
          NextResponse.json({ error: 'yt-dlp failed', details: err.message }, { status: 500 })
        );
      }

      const videoStreamURL = stdout.trim();
      const ffmpegCmd = `ffmpeg -ss ${timestamp} -i "${videoStreamURL}" -frames:v 1 -q:v 2 "${outputImage}" -y`;

      exec(ffmpegCmd, (err) => {
        if (err || !fs.existsSync(outputImage)) {
          return resolve(
            NextResponse.json({ error: 'ffmpeg failed', details: err?.message }, { status: 500 })
          );
        }

        const imageBuffer = fs.readFileSync(outputImage);
        tempDir.removeCallback();

        return resolve(
          new NextResponse(imageBuffer, {
            status: 200,
            headers: {
              'Content-Type': 'image/jpeg',
            },
          })
        );
      });
    });
  });
}

// // porikoponar malik allah.sokol poriko;ponar kol khati tini ei laren.tar upor amar somporno vorosa.ocirei tinni amake proanti diba.amar atta ke shanto korba.khoramoy ei hridoy se andolito korba.uni amar jnno porikolpona koe rekehsen.just exucution korar pala.khora attay tini jom bristi diye boriye diben.bondo hin jibone tini procor sobakhanki diben, procor bondhu diben.jader kase ami sidha gahda tader nikot tini amay ak binno rope present korben.sobai dekhe tak lege cokh kopal e uthe jabe.hoito aj na hoi kal tini khub sigroi amake prosanti dan korben.je din e asi, osthir hoye asi sei din ekdin foriye jabe.khub sigroi foriye jabe.