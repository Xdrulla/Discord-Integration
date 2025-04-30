const admin = require("firebase-admin");
const db = require("../config/firebase");

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token não fornecido" });
  }

  const token = authHeader.split("Bearer ")[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);

    let role = decodedToken.role;

    if (!role) {
      const snapshot = await db.collection("users")
        .where("email", "==", decodedToken.email)
        .limit(1)
        .get();

      if (!snapshot.empty) {
        const userData = snapshot.docs[0].data();
        role = userData.role || "leitor";
      } else {
        role = "leitor";
      }
    }

    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      role
    };

    next();
  } catch (error) {
    console.error("Erro ao verificar token:", error);
    return res.status(401).json({ error: "Token inválido" });
  }
};

module.exports = authMiddleware;
