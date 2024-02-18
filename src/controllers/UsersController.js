
const AppError = require('../utils/AppError');
const sqliteConnection = require('../database/sqlite')

class UsersController {
  async create(request, response) {
    const { name, email, password, is_admin = false } = request.body;

    const database = await sqliteConnection();
    const checkUsersExists = await database.get('SELECT * FROM users WHERE email = (?)', [email])

    if(checkUsersExists) {
      throw new AppError('This email is already in use')
    }

    await database.run(
      'INSERT INTO users (name, email, password, is_admin) VALUES (?, ?, ?, ?)',
      [name, email, password, is_admin]
    );

    return response.status(202).json();
  }
}

module.exports = UsersController;
