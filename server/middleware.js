const jwt = require('jsonwebtoken');
// JWT
const checkToken = (res, req, next) => {
  // might need to add these headers to accepted CORS
  console.log('req headers in checkToken: ', req.headers);
  let token = req.headers['authorization'];
  console.log('token before slice: *******************************', token);
  if (token.startsWith('Bearer')) {
    token = token.slice(7, token.length);
  }
  console.log('token after slice in checkToken: *******************', token);
  if (token) {
    jwt.verify(token, procses.env.JWT_TOKEN, (err, decoded) => {
      if (err) {
        return res.json({
          success: false,
          message: 'token is not valid',
        });
      } else {
        req.decoded = decoded;
        next();
      }
    });
  } else {
    res.json({
      success: false,
      message: 'auth token is not provided',
    });
  }
};

module.exports = {
  checkToken,
};
