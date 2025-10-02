const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 50
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    validate: {
      validator: validator.isEmail,
      message: 'Email không hợp lệ'
    }
  },
  fullName: {
    type: String,
    default: "",
    trim: true,
    maxlength: 100
  },
  avatarUrl: {
    type: String,
    default: "",
    validate: {
      validator: function(url) {
        return !url || validator.isURL(url);
      },
      message: 'Avatar URL không hợp lệ'
    }
  },
  status: {
    type: Boolean,
    default: false
  },
  role: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role',
    required: true
  },
  loginCount: {
    type: Number,
    default: 0,
    min: 0
  },
  isDelete: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

userSchema.pre('save', async function(next) {
  const user = this;
  
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  
  next();
});

userSchema.methods.comparePassword = async function(password) {
  return bcrypt.compare(password, this.password);
};

userSchema.methods.toJSON = function() {
  const user = this;
  const userObject = user.toObject();
  
  delete userObject.password;
  return userObject;
};

userSchema.pre(/^find/, function(next) {
  this.find({ isDelete: { $ne: true } });
  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;