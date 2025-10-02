const User = require('../models/User');
const Role = require('../models/Role');

const createUser = async (req, res) => {
  try {
    const { username, password, email, fullName, avatarUrl, role } = req.body;
    
    const roleExists = await Role.findById(role);
    if (!roleExists) {
      return res.status(400).json({
        success: false,
        message: 'Role không tồn tại'
      });
    }
    
    const user = new User({
      username,
      password,
      email,
      fullName,
      avatarUrl,
      role
    });
    
    await user.save();
    
    await user.populate('role');
    
    res.status(201).json({
      success: true,
      message: 'Tạo user thành công',
      data: user
    });
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `${field === 'username' ? 'Username' : 'Email'} đã tồn tại`
      });
    }
    
    res.status(400).json({
      success: false,
      message: 'Lỗi khi tạo user',
      error: error.message
    });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, username, fullName } = req.query;
    
    let query = {};
    
    if (username) {
      query.username = { $regex: username, $options: 'i' };
    }
    
    if (fullName) {
      query.fullName = { $regex: fullName, $options: 'i' };
    }
    
    const skip = (page - 1) * limit;
    
    const users = await User.find(query)
      .populate('role', 'name description')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });
    
    const total = await User.countDocuments(query);
    
    res.json({
      success: true,
      data: users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách users',
      error: error.message
    });
  }
};

// Lấy user theo ID
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(id).populate('role', 'name description');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy user'
      });
    }
    
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thông tin user',
      error: error.message
    });
  }
};

// Lấy user theo username
const getUserByUsername = async (req, res) => {
  try {
    const { username } = req.params;
    
    const user = await User.findOne({ username }).populate('role', 'name description');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy user'
      });
    }
    
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thông tin user',
      error: error.message
    });
  }
};

// Cập nhật user
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    
    // Không cho phép cập nhật một số trường
    delete updateData.password; // Password cần cập nhật riêng
    delete updateData.loginCount; // loginCount chỉ được cập nhật bởi hệ thống
    
    // Kiểm tra role nếu có cập nhật
    if (updateData.role) {
      const roleExists = await Role.findById(updateData.role);
      if (!roleExists) {
        return res.status(400).json({
          success: false,
          message: 'Role không tồn tại'
        });
      }
    }
    
    const user = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('role', 'name description');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy user'
      });
    }
    
    res.json({
      success: true,
      message: 'Cập nhật user thành công',
      data: user
    });
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `${field === 'username' ? 'Username' : 'Email'} đã tồn tại`
      });
    }
    
    res.status(400).json({
      success: false,
      message: 'Lỗi khi cập nhật user',
      error: error.message
    });
  }
};

// Xóa mềm user
const softDeleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findByIdAndUpdate(
      id,
      { isDelete: true },
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy user'
      });
    }
    
    res.json({
      success: true,
      message: 'Xóa user thành công'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa user',
      error: error.message
    });
  }
};

// Kích hoạt user - chuyển status thành true
const activateUser = async (req, res) => {
  try {
    const { email, username } = req.body;
    
    if (!email || !username) {
      return res.status(400).json({
        success: false,
        message: 'Email và username là bắt buộc'
      });
    }
    
    // Tìm user với email và username khớp
    const user = await User.findOne({ 
      email: email.toLowerCase(), 
      username 
    }).populate('role', 'name description');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Thông tin email và username không khớp'
      });
    }
    
    // Cập nhật status thành true
    user.status = true;
    await user.save();
    
    res.json({
      success: true,
      message: 'Kích hoạt user thành công',
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi kích hoạt user',
      error: error.message
    });
  }
};

// Cập nhật login count
const updateLoginCount = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findByIdAndUpdate(
      id,
      { $inc: { loginCount: 1 } },
      { new: true }
    ).populate('role', 'name description');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy user'
      });
    }
    
    res.json({
      success: true,
      message: 'Cập nhật login count thành công',
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật login count',
      error: error.message
    });
  }
};

module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  getUserByUsername,
  updateUser,
  softDeleteUser,
  activateUser,
  updateLoginCount
};