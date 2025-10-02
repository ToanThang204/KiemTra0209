const express = require('express');
const router = express.Router();
const {
  createUser,
  getAllUsers,
  getUserById,
  getUserByUsername,
  updateUser,
  softDeleteUser,
  activateUser,
  updateLoginCount
} = require('../controllers/userController');

router.post('/', createUser);
router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.get('/username/:username', getUserByUsername);
router.put('/:id', updateUser);
router.delete('/:id', softDeleteUser);

router.post('/activate', activateUser);

router.patch('/:id/login', updateLoginCount);

module.exports = router;