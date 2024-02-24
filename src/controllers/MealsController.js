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

  async index(request, response) {
    const { user_id } = request.query;

    const meals = await knex('meals')
      .select(
        'meals.id as id',
        'meals.name as title',
        'meals.description',
        'meals.price',
        'meals.image',
        'meals.created_at',
        'meals.updated_at',
        'meals.category',
        'ingredients.id as ingredient_id',
        'ingredients.name as ingredient_name',
        'ingredients.image as ingredient_image',
      )
      .leftJoin('ingredients', 'meals.id', 'ingredients.meals_id')
      .where('meals.created_by', user_id)
      .orderBy('meals.name');

    const formattedMeals = [];
    let currentMeal = null;
    meals.forEach((row) => {
      if (!currentMeal || currentMeal.id !== row.id) {
        currentMeal = {
          id: row.id,
          title: row.title,
          description: row.description,
          price: row.price,
          image: row.image,
          created_at: row.created_at,
          updated_at: row.updated_at,
          category: row.category,
          ingredients: [],
        };
        formattedMeals.push(currentMeal);
      }
      if (row.ingredient_id) {
        currentMeal.ingredients.push({
          id: row.ingredient_id,
          name: row.ingredient_name,
          image: row.ingredient_image,
        });
      }
    });

    return response.json(formattedMeals);
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
