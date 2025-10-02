const Role = require('../models/Role');

const createRole = async (req, res) => {
  try {
    const { name, description } = req.body;
    
    const role = new Role({
      name,
      description
    });
    
    await role.save();
    
    res.status(201).json({
      success: true,
      message: 'Tạo role thành công',
      data: role
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Tên role đã tồn tại'
      });
    }
    
    res.status(400).json({
      success: false,
      message: 'Lỗi khi tạo role',
      error: error.message
    });
  }
};

const getAllRoles = async (req, res) => {
  try {
    const { page = 1, limit = 10, name } = req.query;
    
    let query = {};
    
    if (name) {
      query.name = { $regex: name, $options: 'i' };
    }
    
    const skip = (page - 1) * limit;
    
    const roles = await Role.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });
    
    const total = await Role.countDocuments(query);
    
    res.json({
      success: true,
      data: roles,
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
      message: 'Lỗi khi lấy danh sách roles',
      error: error.message
    });
  }
};

const getRoleById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const role = await Role.findById(id);
    
    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy role'
      });
    }
    
    res.json({
      success: true,
      data: role
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thông tin role',
      error: error.message
    });
  }
};

const updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const role = await Role.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy role'
      });
    }
    
    res.json({
      success: true,
      message: 'Cập nhật role thành công',
      data: role
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Tên role đã tồn tại'
      });
    }
    
    res.status(400).json({
      success: false,
      message: 'Lỗi khi cập nhật role',
      error: error.message
    });
  }
};

const softDeleteRole = async (req, res) => {
  try {
    const { id } = req.params;
    
    const role = await Role.findByIdAndUpdate(
      id,
      { isDelete: true },
      { new: true }
    );
    
    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy role'
      });
    }
    
    res.json({
      success: true,
      message: 'Xóa role thành công'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa role',
      error: error.message
    });
  }
};

module.exports = {
  createRole,
  getAllRoles,
  getRoleById,
  updateRole,
  softDeleteRole
};