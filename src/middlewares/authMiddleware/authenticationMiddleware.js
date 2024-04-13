const jwt = require('jsonwebtoken');
const { Config } = require('../../config/config');

function authenticateJWT(req, res, next) {
    const token = req.header('Authorization');
  
    if (!token) {
      return res.status(401).json({ status: 401, message: 'Unauthorized: Token missing' });
    }

    if (!Config.Jwt_secret) {
      console.error('Jwt_secret is not defined!');
      res.status(500).json({ status: 500, message: 'Internal Server Error' });
      return;
    }
  
    jwt.verify(token.replace('Bearer ', ''), Config.Jwt_secret, (err, user) => {
      if (err) {
        return res.status(403).json({ status: 403, message: 'Forbidden: Invalid token' });
      }
  
      req.user = user;
      next();
    });
}

module.exports = {
    authenticateJWT
};
