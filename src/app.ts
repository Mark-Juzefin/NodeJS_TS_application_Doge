const express = require('express');

const PORT = process.env.PORT || 8088;
const app = express();

app.listen(PORT, () => {
  console.log('Server do work!');
});
