import jwt from 'jsonwebtoken';

// verify the jwt token sent by the user
export function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      message: 'Authentication token is required.'
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      message: 'Invalid or expired authentication token.'
    });
  }
}

// allow visitors and verify users when a token is provided
export function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  // allow visitors who are not logged in
  if (!authHeader) {
    req.user = null;
    return next();
  }

  // check the token format
  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      message: 'Invalid authentication token.'
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      message: 'Invalid or expired authentication token.'
    });
  }
}