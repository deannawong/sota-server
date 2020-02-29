const jwt = require('jsonwebtoken');
// JWT
const checkToken = (res, req, next) => {
  // might need to add these headers to accepted CORS
  let token = req.headers['x-access-token'] || req.headers['authorization'];
  if (token.startsWith('Bearer')) {
    token = token.slice(7, token.length);
  }

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
