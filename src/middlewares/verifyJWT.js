import jwt from "jsonwebtoken";

export const verifyJWT = (req, res, next) => {
  try {
    const token =
      req.cookies?.access_token ||
      req.headers.authorization?.split(" ")[1];

      console.log(token);

    if (!token) return res.status(401).json({ error: "Unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};
