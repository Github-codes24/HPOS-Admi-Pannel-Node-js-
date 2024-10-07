const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CategorySchema = new Schema({
    names: [{
        type: String,
        default: "NT-C",
    }],
});

module.exports = mongoose.model("category", CategorySchema);
