const { Router } = require('express');

const MealsController = require('../controllers/MealsController');

const mealsRoutes = Router();

const mealsController = new MealsController();

mealsRoutes.post('/:user_id', mealsController.create);
mealsRoutes.get('/:id', mealsController.show);
mealsRoutes.delete('/:id', mealsController.delete);
mealsRoutes.patch('/:id', mealsController.update);

module.exports = mealsRoutes;
