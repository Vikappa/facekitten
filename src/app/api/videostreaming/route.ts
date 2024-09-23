import fs from 'fs';
import path from 'path';
import { postVideoIndexes } from '../../../../public/storedcatvideos/video/postVideosIndexes';

const getRandomFilePath = ():string =>{
    return postVideoIndexes[Math.floor(Math.random() * postVideoIndexes.length)]
}

export default function handler(req, res) {
    
    const filePath = getRandomFilePath()

  // Controlla se il file esiste
  if (!fs.existsSync(filePath)) {
    res.status(404).json({ message: 'File not found' });
    return;
  }

  // Ottieni la dimensione del file per gestire la risposta a chunk
  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  
  const range = req.headers.range;
  
  if (range) {
    // Gestisci lo streaming di range (parziale) del file
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

    if (start >= fileSize) {
      res.status(416).send('Requested range not satisfiable');
      return;
    }

    const chunkSize = (end - start) + 1;
    const file = fs.createReadStream(filePath, { start, end });

    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunkSize,
      'Content-Type': 'video/mp4', // Modifica in base al tipo di file
    });

    file.pipe(res);
  } else {
    // Streaming completo del file
    res.writeHead(200, {
      'Content-Length': fileSize,
      'Content-Type': 'video/mp4', // Modifica in base al tipo di file
    });

    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  }
}
