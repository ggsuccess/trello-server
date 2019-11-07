const express = require('express');
const app = express(),
  http = require('http');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const expressSession = require('express-session');
const cors = require('cors');
const mysql = require('mysql');
const router = express.Router();
const connection = mysql.createConnection({});

app.set('port', process.env.PORT || 3000);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());
app.use(cookieParser());
app.use(
  expressSession({
    secret: 'my key',
    resave: true,
    saveUninitialized: true
  })
);
app.use((req, res, next) => {
  console.log('요청 처리');

  res.end();
});
app.get('/', (req, res) => {
  res.send('Root');
});

http.createServer(app).listen(app.get('port'), () => {
  console.log('express 서버 시작됨');
});
let pool = mysql.createPool({
  connectionLimit: 10,
  host: 'localhost',
  user: 'root',
  password: '1234',
  database: 'trello',
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
        console.log('추가한 유저아이디:' + insertId);
      } else {
        console.log('사용자 추가 실패');
      }
    });
  }
});

let authUser = (email, password, callback) => {
  pool.getConnection((err, conn) => {
    if (err) {
      if (conn) {
        conn.release();
      }
      callback(err, null);
      return;
    }

    let columns = ['email', 'name', 'password'];
    let tablename = 'users';
    let exec = conn.query(
      'select ?? from ?? where email = ? and password = ?',
      [columns, tablename, email, password],
      (err, rows) => {
        conn.release();

        if (rows.length > 0) {
          console.log(
            '이메일 [%s], 패스워드 [%s]가 일치하는 사용자 찾음',
            email,
            password
          );
          callback(null, rows);
        } else {
          //일치하는 사용자 못 찾음
          callback(null, null);
        }
      }
    );
  });
};

router.route('/login').post((req, res) => {
  console.log('/login 호출됨,');

  let paramEmail = req.body.email || req.query.email;
  let paramPassword = req.body.password || req.query.password;

  if (pool) {
    authUser(paramEmail, paramPassword, (err, rows) => {
      if (err) {
        console.error('로그인 중 에러:' + err.stack);
        alert('로그인 실패');
        return;
      }
      if (rows) {
        console.dir(rows);

        let username = rows[0].name;
      }
    });
  }
});
