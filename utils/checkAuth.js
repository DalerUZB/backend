import jwt from "jsonwebtoken";

export default async (req, res, next) => {
  const token = (req.headers.authorization || "").replace(/Bearer\s?/, "");
  
  if (token) {
    try {
      const decoded = jwt.verify(token, "sav571p");
      const { id, _id } = decoded;
      req.userId = id || _id;
      next();
    } catch (error) {
      return res.status(403).json({
        message: "нет доступа me",
      });
    }
  } else {
    return res.status(403).json({
      message: "нет доступа",
    });
  }
};
