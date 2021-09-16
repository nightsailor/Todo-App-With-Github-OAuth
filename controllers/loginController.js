const dotenv = require('dotenv');
const session = require('express-session');
const request = require('request');
const qs = require('querystring');
const randomString = require('randomstring');

dotenv.config({ path: './config/config.env' });
const redirect_uri = process.env.HOST + '/redirect';

module.exports = function(app){

app.use(
  session({
    secret: randomString.generate(),
    cookie: { maxAge: 15000 },
    resave: false,
    saveUninitialized: false
  })
);

app.get('/', (req, res, next) => {
  res.render('login.ejs');
});

app.get('/login', (req, res, next) => {
  req.session.csrf_string = randomString.generate();
  const githubAuthUrl =
    'https://github.com/login/oauth/authorize?' +
    qs.stringify({
      client_id: process.env.CLIENT_ID,
      redirect_uri: redirect_uri,
      state: req.session.csrf_string,
      scope: 'user:email'
    });
  res.redirect(githubAuthUrl);
});

app.all('/redirect', (req, res) => {
  const code = req.query.code;
  const returnedState = req.query.state;
  if (req.session.csrf_string === returnedState) {
    request.post(
      {
        url:
          'https://github.com/login/oauth/access_token?' +
          qs.stringify({
            client_id: process.env.CLIENT_ID,
            client_secret: process.env.CLIENT_SECRET,
            code: code,
            redirect_uri: redirect_uri,
            state: req.session.csrf_string
          })
      },
      (error, response, body) => {
        req.session.access_token = qs.parse(body).access_token;
        res.redirect('/todo');
      }
    );
  } else {
    res.redirect('/');
  }
});

}