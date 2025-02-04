const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const centerCodeSchema = new Schema({
    centerName: {
        type: String,
        required: true,
    },
    centerCode: {
        type: String,
    },
}, { timestamps: true });

module.exports = mongoose.model("centerCode", centerCodeSchema);
