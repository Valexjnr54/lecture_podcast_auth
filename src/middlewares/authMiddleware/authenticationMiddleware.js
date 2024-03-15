const jwt = require('jsonwebtoken');
const { Config } = require('../../config/config');

function authenticateJWT(req, res, next) {
    const token = req.header('Authorization');
  
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized: Token missing' });
    }

    if (!Config.Jwt_secret) {
      console.error('Jwt_secret is not defined!');
      res.status(500).json({ message: 'Internal Server Error' });
      return;
    }
  
    jwt.verify(token.replace('Bearer ', ''), Config.Jwt_secret, (err, user) => {
      if (err) {
        return res.status(403).json({ message: 'Forbidden: Invalid token' });
      }
  
      req.user = user;
      next();
    });
}

module.exports = {
    authenticateJWT
};
