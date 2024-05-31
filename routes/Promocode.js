const Router = require('express').Router();

// Import all promocode routes
const {create, deletePromocode, update, getAll, getPromocodeByCode } = require('../controllers/Promocode');
const { verifyUser } = require('../middlewares/auth');

// Routes
Router.post('/create', verifyUser, create);
Router.delete('/delete', verifyUser, deletePromocode);
Router.put('/update', verifyUser, update);
Router.get('/getAll', getAll);
Router.post('/get', verifyUser, getPromocodeByCode);

module.exports = Router;
