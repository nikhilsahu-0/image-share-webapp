const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Enter Your Name"],
  },
  email: {
    type: String,
    required: [true, "Enter An Email Address"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "Provide a vlaid Email Address"],
  },
  photo: String,
  password: {
    type: String,
    required: [true, "Enter a password"],
    minlength: 8,
  },
  passwordConfirm: {
    type: String,
    required: [true, "Enter password to confirm"],
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: "Password Missmatch",
    },
  },
  following: Array,
  bio: String,
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

userSchema.methods.checkPassword = async function (password, userPassword) {
  return await bcrypt.compare(password, userPassword);
};

// userSchema.methods.passwordChangedAfter = function (JWTTimestamp) {
//   if (this.passwordChangedAt) {
//     const changedTimestamp = parseInt(this.passwordChangedAt.getTime(), 10);
//     return JWTTimestamp < changedTimestamp;
//   }
//   return false;
// };

const User = mongoose.model("User", userSchema);

module.exports = User;
