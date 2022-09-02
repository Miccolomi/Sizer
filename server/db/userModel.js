const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const bcryptSalt = process.env.BCRYPT_SALT;

const UserSchema = new mongoose.Schema(
  {
    email: {
        type: String,
        required: [true, "Please provide an Email!"],
        unique: true,
      },
    
      password: {
        type: String,
        required: [true, "Please provide a password!"],
        unique: true,
      },
      change_password : {
        type: String,
        required: [true, "Please provide a default (change) password!"],
        unique: false,
      },
      type : {
        type: String,
        required: [true, "Please provide type of USER!"],
        unique: false,
      }
},     
{ timestamps: true }

)

/*
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  const hash = await bcrypt.hash(this.password, Number(bcryptSalt));
  this.password = hash;
  next();
});
*/

  module.exports = mongoose.model.Users || mongoose.model("users", UserSchema);