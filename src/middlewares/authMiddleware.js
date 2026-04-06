const jwt = require("jsonwebtoken"); // Importing jsonwebtoken

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization; // Auth Type: Bearer Token

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    // If header doesn't exist or it doesn't start with 'Bearer'
    return res.status(401).json({
      message: "Authorization token is missing.", // Return a unsuccessful message
    });
  }

  const token = authHeader.split(" ")[1]; // Splitting the token by its space and retrieving its value

  try {
    const jwtSecret = "abcdefghijk";
    const decoded = jwt.verify(token, jwtSecret); // Checks signatre // token: jwt string received from the client // jwtSecret used to verify that tokeng
    console.log(decoded);
    req.user = { id: decoded.id, email: decoded.email }; // Injecting the user into the request
    next(); // Middleware is done, go to the next function
  } catch (error) {
    // Or catch error if there is something wrong
    console.log(error);
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};

module.exports = { authMiddleware };
