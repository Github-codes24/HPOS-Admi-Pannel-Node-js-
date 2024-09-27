const mongoose = require("mongoose");

mongoose
    .connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
    .then((res) => {
        console.log("MongoDB Connected!");
    })
    .catch((err) => {
        console.log(err);
    });