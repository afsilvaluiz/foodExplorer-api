const knex = require('../database/knex');

class MealsController {
  async create(request, response) {
    const {
      name, description, category, price, image, ingredients,
    } = request.body;
    const { user_id } = request.params;

    const [meals_id] = await knex('meals').insert({
      name,
      description,
      category,
      price,
      image,
      created_by: user_id,
      updated_by: user_id,
    });

    const ingredientsInsert = ingredients.map((name) => ({
      meals_id,
      name,
      created_by: user_id,
    }));

    await knex('ingredients').insert(ingredientsInsert);

    return response.json();
  }
}

module.exports = MealsController;
