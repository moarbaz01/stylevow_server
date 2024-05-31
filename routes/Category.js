const Router = require('express').Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

// IMPORT ALL REQUIRED CONTROLLERS
const {deleteCategory, create, update,category, categories } = require('../controllers/Category');
const {isAdmin, verifyUser} = require('../middlewares/auth');

// CREATE ROUTES
Router.post('/create',upload.single('image') ,verifyUser ,isAdmin, create);
Router.put('/update', upload.single('image'),verifyUser,isAdmin, update);
Router.delete('/delete', verifyUser ,isAdmin, deleteCategory);
Router.get('/get', category);
Router.get('/all', categories);

module.exports = Router;