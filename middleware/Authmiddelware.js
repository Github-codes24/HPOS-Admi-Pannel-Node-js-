const jwt = require("jsonwebtoken");

// Middleware to verify JWT and authenticate user
const isAuth = (req, res, next) => {
    // Retrieve the JWT token from the request headers
    const token = req.headers["x-acciojob"];

    // Variable to store the verification result
    let verified;

    try {
        // Verify the token using the JWT secret
        verified = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
        // If token verification fails, return an error response
        return res.status(400).send({
            status: 400,
            message: "JWT not provided or invalid. Please login",
            data: err,
        });
    }

    // If token is successfully verified
    if (verified) {
        // Attach the verified token data to the request object for further use
        req.locals = verified;
        next(); // Proceed to the next middleware or route handler
    } else {
        // If verification fails (though this block is redundant here due to the try-catch)
        res.status(401).send({
            status: 401,
            message: "User not authenticated. Please login",
        });
    }
};

module.exports = { isAuth };
