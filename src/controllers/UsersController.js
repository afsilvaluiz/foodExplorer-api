const { hash } = require('bcryptjs');

const AppError = require('../utils/AppError');
const sqliteConnection = require('../database/sqlite');

class UsersController {
  async create(request, response) {
    const {
      name, email, password, is_admin = false,
    } = request.body;

    const database = await sqliteConnection();
    const checkUsersExists = await database.get('SELECT * FROM users WHERE email = (?)', [email]);

    if (checkUsersExists) {
      throw new AppError('This email is already in use');
    }

    const hashedPassword = await hash(password, 8);

    await database.run(
      'INSERT INTO users (name, email, password, is_admin) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, is_admin],
    );

    return response.status(202).json();
  }

  async update(request, response) {
    const { name, email } = request.body;
    const { id } = request.params;

    const database = await sqliteConnection();
    const user = await database.get('SELECT * FROM users WHERE id = (?)', [id]);

    if (!user) {
      throw new AppError('User not found');
    }

    const userWithUpdatedEmail = await database.get('SELECT * FROM users WHERE email = (?)', [email]);

    if (userWithUpdatedEmail && userWithUpdatedEmail.id !== user.id) {
      throw new AppError('This email is already in use');
    }

    user.name = name;
    user.email = email;

    await database.run(
      `
        UPDATE users SET
        name = ?,
        email = ?,
        updated_at = ?
        WHERE id = ?`,
      [user.name, user.email, new Date(), id],
    );

    return response.json();
  }
}

module.exports = UsersController;
