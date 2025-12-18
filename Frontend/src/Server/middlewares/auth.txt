const jwt = require('jsonwebtoken')

const auth = (req, res, next)=>{
    // Check for token in Authorization header first
    const authHeader = req.headers.authorization;
    let token = null;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7); // Remove 'Bearer ' prefix
    } else {
        // Fallback to cookie
        token = req.cookies.token;
    }
    
    if (!token) {
        return res.status(401).json({success: false, message: "Unauthorized access detected"})
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.user = decoded
        next();
    } catch (error) {
        res.status(500).json({success: false, message: "Unauthorized access detected"})
    }
}

module.exports = auth;