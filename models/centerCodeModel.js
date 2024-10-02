const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const centerCodeSchema = new Schema({
    centerName: {
        type: String,
        require: true,
    },
    centerCode: {
        type: String,
        require: true,
    },
}, { timestamps: true });

module.exports = mongoose.model("centerCode", centerCodeSchema);
