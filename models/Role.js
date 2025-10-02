const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    default: "",
    trim: true
  },
  isDelete: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

roleSchema.methods.toJSON = function() {
  const role = this;
  const roleObject = role.toObject();
  return roleObject;
};

roleSchema.pre(/^find/, function(next) {
  this.find({ isDelete: { $ne: true } });
  next();
});

const Role = mongoose.model('Role', roleSchema);

module.exports = Role;