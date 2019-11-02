const express = require('express');
const app = express(),
  http = require('http');
const cors = require('cors');
const mysql = require('mysql');
const router = express.Router();
const connection = mysql.createConnection({});

app.set('port', process.env.PORT || 3000);

app.use(cors());
app.use((req, res, next) => {
  console.log('요청 처리');

  res.end();
});
app.get('/', (req, res) => {
  res.send('Root');
});

http.createServer(app).listen(app.get('port'), function() {
  console.log('express 서버 시작됨');
});
let pool = mysql.createPool({
  connectionLimit: 10,
  host: 'localhost',
  user: 'root',
  password: '1234',
  database: '',
  debug: false
});

let addUser = (email, name, password, callback) => {
  pool.getConnection((err, conn) => {
    if (err) {
      if (conn) {
        conn.release();
      }
      callback(err, null);
      return;
    }
    let data = { email: email, name: name, password: password };

    let exec = conn.query('insert into users set ?', data, (err, result) => {
      conn.release();
      if (err) {
        console.log('SQL실행시 오류발생');
        console.dir(err);

        callback(err, null);
        return;
      }
      callback(null, result);
    });
  });
};

router.route('/adduser').post((req, res) => {
  console.log('/adduser호출됨');

  let paramEmail = req.body.email || req.query.email;
  let paramName = req.body.name || req.query.name;
  let paramPassword = req.body.password || req.query.password;

  if (pool) {
    addUser(paramEmail, paramName, paramPassword, (err, addedUser) => {
      if (err) {
        console.log('사용자 추가 오류 발생' + err.stack);
        return;
      }
      if (addedUser) {
        console.dir(addedUser);

        var insertId = addedUser.insertId;
      }
    });
  }
});
