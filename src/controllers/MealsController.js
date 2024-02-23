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

    const ingredientsInsert = ingredients.map((ingredient) => ({
      meals_id,
      name: ingredient.name,
      created_by: user_id,
    }));

    await knex('ingredients').insert(ingredientsInsert);

    return response.json();
  }

  async show(request, response) {
    const { id } = request.params;

    const meal = await knex('meals').where({ id }).first();
    const ingredient = await knex('ingredients')
      .where({ meals_id: id })
      .orderBy('name');

    return response.json({
      ...meal,
      ingredient,
    });
  }

  async delete(request, response) {
    const { id } = request.params;

    await knex('meals').where({ id }).delete();

    return response.json();
  }

  async update(request, response) {
    const { id } = request.params;
    const {
      name, description, category, price, image, ingredients,
    } = request.body;

    const meal = await knex('meals').where({ id }).first();

    const mealUpdate = {
      name: name ?? meal.name,
      description: description ?? meal.description,
      category: category ?? meal.category,
      price: price ?? meal.price,
      image: image ?? meal.image,
    };

    if (ingredients) {
      await knex('ingredients').where({ meals_id: id }).delete();

      const ingredientsInsert = ingredients.map((ingredient) => ({
        meals_id: id,
        name: ingredient.name,
        created_by: meal.created_by,
      }
      ));

      await knex('ingredients').insert(ingredientsInsert);
    }

    mealUpdate.updated_by = meal.created_by;

    await knex('meals').where({ id }).update(mealUpdate);

    return response.json();
  }
}

module.exports = MealsController;
