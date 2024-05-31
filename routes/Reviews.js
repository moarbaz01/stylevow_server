const Router = require('express').Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' })

// Import COntrollers
const { create, deleteReview, getReviews } = require('../controllers/Reviews');
const { verifyUser } = require('../middlewares/auth')

// ROUTES
Router.post('/create', upload.array('images'), verifyUser, create);
Router.delete('/delete', deleteReview);
Router.get('/reviews', getReviews);

module.exports = Router;