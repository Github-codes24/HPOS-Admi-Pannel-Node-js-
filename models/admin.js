const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    Fullname: {
        type: String,
        require: true,
    },
    password: {
        type: String,
        require: true,
    },
    confirmpassword: {
        type: String,
        require: true,
    },
    username: {
        type: String,
        require: true,
        unique: true,
    },
    // token: {
    //     type: String,
    //     require: true,
    // },
});

module.exports = mongoose.model("users", UserSchema);
