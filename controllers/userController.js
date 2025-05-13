const { users } = require('../data/storage');

// Read
exports.getAllUsers = (req, res) => res.json(users);
exports.getUserByEmail = (req, res) => {
  const { email } = req.body;
  const user = users.find(u => u.email === email);
  user ? res.json(user) : res.status(404).json({ message: 'No encontrado' });
};

// Create
exports.createUser = (req, res) => {
  const { name, email, password } = req.body;
  if (users.find(u => u.email === email)) return res.status(409).json({ message: 'Ya existe' });
  users.push({ name, email, password });
  res.status(201).json({ message: 'Creado correctamente' });
};

// Update
exports.updateUser = (req, res) => {
  const { email, name, password } = req.body;
  const user = users.find(u => u.email === email);
  if (!user) return res.status(404).json({ message: 'No encontrado' });
  if (name) user.name = name;
  if (password) user.password = password;
  res.json({ message: 'Actualizado correctamente' });
};

// Delete
exports.deleteUser = (req, res) => {
  const { email } = req.body;
  const index = users.findIndex(u => u.email === email);
  if (index === -1) return res.status(404).json({ message: 'No encontrado' });
  users.splice(index, 1);
  res.json({ message: 'Eliminado correctamente' });
};
