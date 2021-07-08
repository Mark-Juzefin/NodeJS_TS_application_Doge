import { Request, Response } from 'express';

const express = require('express');

const PORT = 8080;
const app = express();

app.post('/upload/dog/image', async (req: Request, res: Response) => {
  res.status(200).send('post');
});

app.get('/list/dog/images', async (req: Request, res: Response) => {
  res.status(200).send('get');
});

app.listen(PORT, () => {
  console.log('Server do work!');
});
