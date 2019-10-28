const express = require('express');
const app = express();
const mysql = require('mysql');
const connection = mysql.createConnection({});

app.set('port', process.env.PORT || 3000);

app.get('/', (req, res) => {
  res.send('Root');
});
