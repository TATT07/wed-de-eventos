const jwt = require("jsonwebtoken");
const SECRET = "mi_secreto_seguro";

function authMiddleware(req, res, next) {
  const token = req.headers["authorization"];
  if (!token) return res.status(401).json({ error: "Token requerido" });

  try {
    const decoded = jwt.verify(token.split(" ")[1], SECRET);
    req.user = decoded; // datos del usuario
    next();
  } catch (err) {
    res.status(401).json({ error: "Token inválido" });
  }
}

module.exports = authMiddleware;
