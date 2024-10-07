const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CasteSchema = new Schema({
    names: [{
        type: String,
    }],
});

module.exports = mongoose.model("caste", CasteSchema);
