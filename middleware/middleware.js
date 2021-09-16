const request = require('request');

let check = (req, res, next) => {
  let body = {
    url: 'https://api.github.com/user/public_emails',
    headers: {
      Authorization: 'token ' + req.session.access_token,
      'User-Agent': 'Login-App'
    }
  }
  
  request.get( body, (error, response, body) => {
    body = JSON.parse(body);
    if(body.message) {
      return res.status(404).json({ success: false, message: "invalid access code" });
    }
    
    next();
  });
}

module.exports = check;