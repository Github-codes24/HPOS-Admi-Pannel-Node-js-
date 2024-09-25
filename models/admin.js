const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    fullName: {
        type: String,
        require: true,
    },
    password: {
        type: String,
        require: true,
    },
    confirmPassword: {
        type: String,
        require: true,
    },
    userName: {
        type: String,
        require: true,
        unique: true,
    },
    // token: {
    //     type: String,
    //     require: true,
    // },
});

module.exports = mongoose.model("admin", UserSchema);
