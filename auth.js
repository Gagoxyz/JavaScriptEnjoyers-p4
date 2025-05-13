const jwt = require("jsonwebtoken"); // Importamos la librería jsonwebtoken para manejar JWT

const SECRET_KEY = "Miniatura"; // Clave secreta para firmar y verificar los tokens JWT

const auth = {
  /**
   * Genera un token JWT para un usuario dado.
   *
   * @function generateToken
   * @memberof auth
   * @param {Object} user - Objeto de usuario que contiene al menos el email.
   * @param {string} user.email - Correo electrónico del usuario.
   * @returns {string} Token JWT firmado con una duración de 1 hora.
   * @example
   * const token = auth.generateToken({ email: "user@example.com" });
   */
  generateToken: (user) => {
    return jwt.sign({ email: user.email, role: user.role }, SECRET_KEY, { expiresIn: "1h" });
  },

  /**
   * Verifica un token JWT.
   *
   * @function verifyToken
   * @memberof auth
   * @param {string} token - Token JWT a verificar.
   * @returns {Object|null} Decodificado del token si es válido, o `null` si no lo es.
   * @example
   * const decoded = auth.verifyToken(token);
   */
  verifyToken: (token) => {
    try {
      return jwt.verify(token, SECRET_KEY);
    } catch (err) {
      return null;
    }
  },

  /**
   * Obtiene la información del usuario desde un token JWT.
   *
   * @function getUserFromToken
   * @memberof auth
   * @param {string} token - Token JWT a procesar.
   * @returns {Object|null} Objeto decodificado del usuario, o `null` si el token no es válido o no existe.
   * @example
   * const user = auth.getUserFromToken(token);
   */
  getUserFromToken: (token) => {
    if (!token) return null;

    try {
      const decoded = jwt.verify(token, SECRET_KEY);
      return decoded;
    } catch (err) {
      console.error("Token inválido:", err);
      return null;
    }
  }
};

module.exports = auth;

