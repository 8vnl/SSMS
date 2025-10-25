const express = require('express');
const { 
  getPendingUsers, 
  approveUser, 
  denyUser, 
  getAllUsers 
} = require('../controllers/userController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const router = express.Router();

router.get('/pending', auth, admin, getPendingUsers);
router.put('/approve/:userId', auth, admin, approveUser);
router.delete('/deny/:userId', auth, admin, denyUser);
router.get('/', auth, admin, getAllUsers);

module.exports = router;