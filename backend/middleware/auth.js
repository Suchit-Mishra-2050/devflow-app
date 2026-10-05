import jwt from "jsonwebtoken";

const authUser = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).send("Authorization token is required");
  }

  try {
    const token = authorization.split(" ")[1];
    const userId = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = userId.id;
    next();
  } catch (error) {
    return res.status(401).send("Invalid or expired token");
  }
};

export default authUser;
