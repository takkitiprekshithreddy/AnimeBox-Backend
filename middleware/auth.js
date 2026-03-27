const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  // 1. Get the token from the header (Postman/React will send it as "Bearer <token>")
  const authHeader = req.header('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  // Extract the actual token string
  const token = authHeader.split(' ')[1];

  try {
    // 2. Verify the token using your secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 3. Attach the decoded user ID to the request object
    req.user = decoded; 
    
    // 4. Move on to the next function (the actual route)
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};