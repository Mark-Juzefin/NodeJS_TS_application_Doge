import { Request, Response } from 'express';

const express = require('express');
const rp = require('request-promise');
const db = require('./db.ts');

const PORT = process.env.PORT || 8080;
const app = express();

app.use(express.json());

app.post('/upload/dog/image', async (req: Request, res: Response) => {
  try {
    const { size } = req.body;
    const url = 'https://random.dog/woof.json';
    const img = await rp.get({ url, json: true });
    const imgURL = img.url;
    const imgSizeBytes = img.fileSizeBytes;
    const imgName = imgURL.split('/').pop();
    const imgExt = imgURL.split('.').pop();

    if (imgExt !== 'mp4' && imgExt !== 'webm') {
      const doge = await db.query(`
      insert into doggos (fileName, width, height, fileSizeBytes)
      values
      ( '${imgName}', ${size.width}, ${size.height}, ${imgSizeBytes} )
      returning id`);

      res.json(doge.rows);
    } else {
      res.status(400).send('Something went wrong');
    }
  } catch (error) {
    res.status(500).send('Something went wrong');
  }
});

app.get('/list/dog/images', async (req: Request, res: Response) => {
  try {
    const doggos = await db.query('select * from doggos');
    res.status(200).send(doggos.rows);
  } catch (error) {
    res.status(500).send('Something went wrong');
  }
});

app.listen(PORT, () => {
  console.log('Server do work!');
});
