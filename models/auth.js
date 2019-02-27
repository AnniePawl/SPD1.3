const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// #TODO: Implement thing.model.js.

const Schema = mongoose.Schema;

const AuthSchema = new Schema({
  name: { type: String, required: true },
  username: { type: String, required: true },
  password: { type: String, select: false }
}, {
  timestamps: true
});

AuthSchema.pre('save', function (next) {
  const user = this;
  if (!user.isModified('password')) {
    return next();
  }
  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(user.password, salt, (error, hash) => {
      user.password = hash;
      return next();
    });
  });
  return 0;
});

AuthSchema.methods.comparePassword = function (password, done) {
  bcrypt.compare(password, this.password, (err, isMatch) => {
    done(err, isMatch);
  });
};

const Auth = mongoose.model('Auth', AuthSchema);
module.exports = Auth;
