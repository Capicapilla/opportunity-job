export const authMiddleware = (req, res, next) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ error: "No autorizado" });
  }
  req.user = req.session.user; // { id, role }
  next();
};
