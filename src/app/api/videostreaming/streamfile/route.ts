import fs from 'fs';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';
const jwtSecret = process.env.NEXT_PUBLIC_SELF

export async function GET(req: NextRequest) {
    const token = req.headers.get('Authorization')
    if (!token || token !== `Bearer ${jwtSecret}`) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }
  const { searchParams } = new URL(req.url);
  const filename = searchParams.get('filename');

  const filePath = path.resolve('.', 'public/storedcatvideos/video', filename as string);

  // Controlla se il file esiste
  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ message: 'File not found' }, { status: 404 });
  }

  // Ottieni le dimensioni del file
  const stat = fs.statSync(filePath);
  const fileSize = stat.size;

  const range = req.headers.get('range');

  if (range) {
    // Gestione dello streaming parziale del file
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

    if (start >= fileSize) {
      return new Response('Requested range not satisfiable', { status: 416 });
    }

    const chunkSize = (end - start) + 1;
    const file = fs.createReadStream(filePath, { start, end });

    const headers = new Headers({
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunkSize.toString(),
      'Content-Type': 'video/mp4',
    });

    const readableStream = new ReadableStream({
      start(controller) {
        file.on('data', (chunk) => controller.enqueue(chunk));
        file.on('end', () => controller.close());
        file.on('error', (err) => controller.error(err));
      },
    });

    return new Response(readableStream, { headers, status: 206 });
  } else {
    const headers = new Headers({
      'Content-Length': fileSize.toString(),
      'Content-Type': 'video/mp4',
    });

    const fileStream = fs.createReadStream(filePath);

    // Converte il ReadStream in un ReadableStream
    const readableStream = new ReadableStream({
      start(controller) {
        fileStream.on('data', (chunk) => controller.enqueue(chunk));
        fileStream.on('end', () => controller.close());
        fileStream.on('error', (err) => controller.error(err));
      },
    });

    return new Response(readableStream, { headers });
  }
}
