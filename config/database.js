const mongoose = require("mongoose");

const dbConnect = () => {
  mongoose
    .connect(process.env.DATABASE_URL)
    .then(() => {
      console.log("Database successfully connected");
    })
    .catch((err) => {
      console.log(err);
    });
};
module.exports = dbConnect;
