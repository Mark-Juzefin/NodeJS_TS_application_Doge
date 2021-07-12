import { Request, Response } from 'express';

const express = require('express');
const request = require('request');
const rp = require('request-promise');
const fs = require('fs');
const sharp = require('sharp');

const db = require('./db.ts');

const PORT = process.env.PORT || 8080;
const app = express();

app.use(express.json());

app.use(express.static('src/img'));

app.post('/upload/dog/image', async (req: Request, res: Response) => {
  try {
    const { size } = req.body;
    const url = 'https://random.dog/woof.json';
    const img = await rp.get({ url, json: true });
    const imgURL = img.url;
    const imgSizeBytes = img.fileSizeBytes;
    const imgName = imgURL.split('/').pop();
    const imgExt = imgURL.split('.').pop();

    if (imgExt !== 'mp4' && imgExt !== 'webm' && imgExt !== 'gif') {
      request(`https://random.dog/${imgName}`)
        .pipe(fs.createWriteStream(`src/img/original-${imgName}`))
        .on('close', () => {
          sharp(`src/img/original-${imgName}`)
            .resize(size.width, size.height)
            .toFile(`src/img/modified-${imgName}`, (err:any) => {
              if (err) {
                res.status(500).send('Image processing error');
              }
            });
        });

      const doge = await db.query(`
      insert into doggos (fileName, width, height, fileSizeBytes, "URLoriginal", "URLmodified")
      values
      ( '${imgName}', ${size.width}, ${size.height}, ${imgSizeBytes},'http://localhost:8080/original-${imgName}' , 'http://localhost:8080/modified-${imgName}' )
      returning id`);

      res.json(doge.rows);
    } else {
      res.status(400).send('Format not supported');
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

app.get('/list/dog/images', async (req: Request, res: Response) => {
  try {
    let query = 'select * from doggos ';
    let width = 0;
    let height = 0;
    if (req.body.size) {
      width = req.body.size.width;
      height = req.body.size.height;
    }

    if (width && height) {
      query += `where width = ${width} and height = ${height}`;
    } else if (width) {
      query += `where width = ${width}`;
    } else if (height) {
      query += `where height = ${height}`;
    }

    const doggos = await db.query(query);
    res.status(200).send(doggos.rows);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.listen(PORT, () => {
  console.log('Server do work!');
});
