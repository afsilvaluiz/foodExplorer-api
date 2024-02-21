const { Router } = require('express');

const MealsController = require('../controllers/MealsController');

const mealsRoutes = Router();

const mealsController = new MealsController();

mealsRoutes.post('/:user_id', mealsController.create);

module.exports = mealsRoutes;
