import jwt from 'jsonwebtoken';

function generateJWT(login = 'test', pass = '123') {
  return jwt.sign({
    login,
    pass
  }, 'secret', {
    expiresIn: 24 * 60 * 60
  });
}

export function jwtAuth(req, res, next) {
  const { login, pass } = req.body;
  if (login === 'admin' && pass === "admin") {
    const token = generateJWT(login, pass);
    
    const authResponse = {
      code: 200,
      message: "OK",
      data: {
        user: {
          email: "...",
          username: login
        }
      },
      token
    };
    res.json(authResponse);
  } else {
    res.status(404).send({
      code: 404,
      message: "Not Found",
    });
  }
  next();
};

export function verifyJwt(req, res, next) {
  try {
    jwt.verify(req.headers['x-access-token'], 'secret');
    next();
  } catch(e) {
    res.status(403).json({ error: 'Access denied.' });
  }
}