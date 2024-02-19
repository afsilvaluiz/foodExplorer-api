const { hash, compare } = require('bcryptjs');

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
    const { name, email, password, old_password } = request.body;
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

    if (password && !old_password) {
      throw new AppError('Please provide the old password to set the new password');
    }

    if (password && old_password) {
      const checkOldPassword = await compare(old_password, user.password);

      if (!checkOldPassword) {
        throw new AppError('The old password does not match');
      }

      user.password = await hash(password, 8);
    }

    await database.run(
      `
        UPDATE users SET
        name = ?,
        email = ?,
        password = ?,
        updated_at = DATETIME('now')
        WHERE id = ?`,
      [user.name, user.email, user.password, new Date(), id],
    );

    return response.json();
  }
}

module.exports = UsersController;
