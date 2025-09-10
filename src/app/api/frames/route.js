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

  const cleanUrl = url.split('?')[0];
  const tempDir = tmp.dirSync({ unsafeCleanup: true });
  const outputImage = path.join(tempDir.name, 'thumb.jpg');

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
