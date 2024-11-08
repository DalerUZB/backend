import jwt from "jsonwebtoken";

export default async (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).send({ error: "Authentication required" });
  }

  try {
    const decoded = jwt.verify(token, "sav571p");
    const { id, _id } = decoded;
    req.userID = id || _id;
    if (req.userID !== undefined || null) {
      next();
    }
  } catch (e) {
    res.status(400).send({ error: "Invalid token" });
  }
};
