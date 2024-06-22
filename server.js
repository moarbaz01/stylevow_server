const express = require("express");
require("dotenv").config();
const PORT = process.env.PORT || 5000;
require("./config/database")();
require("./config/cloudinary")();
const bodyParser = require("body-parser");
const multer = require('multer');
const cors = require("cors");
const app = express();
// Cookie parser
const cookieParser = require("cookie-parser");
app.use(cookieParser());

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/') // Specify the directory where uploaded files should be stored
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname) // Specify how to name the uploaded files
  }
});

const upload = multer({ storage: storage });

app.use(bodyParser.json());
app.use(cors(
  {
    origin: process.env.BASE_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  }
));


// Models
require('./models/Address');
require('./models/Cart');
require('./models/Card');
require('./models/Order');
require('./models/Product');
require('./models/Reviews');
// require('./models/');

// ROUTES
const User = require("./routes/User");
const Profile = require("./routes/Profile");
const Category = require("./routes/Category");
const Product = require("./routes/Product");
const Cart = require('./routes/Cart');
const Reviews = require('./routes/Reviews');
const Promocode = require('./routes/Promocode');
const Order = require('./routes/Order');
const Payment = require('./routes/Payment');

app.use("/api/v1", User);
app.use("/api/v1/profile", Profile);
app.use("/api/v1/category", Category);
app.use("/api/v1/products", Product);
app.use("/api/v1/cart", Cart);
app.use("/api/v1/review", Reviews);
app.use("/api/v1/order", Order);
app.use("/api/v1/promocode", Promocode);
app.use("/api/v1/payment", Payment);

app.listen(PORT, () => {
  console.log(`Server successfully running on ${PORT}`);
});
