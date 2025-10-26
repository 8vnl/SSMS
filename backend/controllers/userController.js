const storage = require('../utils/storage');

const getPendingUsers = async (req, res) => {
  try {
    const users = await storage.getUsers();
    const pendingUsers = users.filter(user => !user.isApproved);
    
    res.json(pendingUsers);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const approveUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const users = await storage.getUsers();
    
    const userIndex = users.findIndex(user => user.id === parseInt(userId));
    if (userIndex === -1) {
      return res.status(404).json({ message: 'User not found' });
    }

    users[userIndex].isApproved = true;
    await storage.saveUsers(users);

    const updatedUser = { ...users[userIndex] };
    delete updatedUser.password;

    res.json({ message: 'User approved successfully', user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const denyUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const users = await storage.getUsers();
    
    const userIndex = users.findIndex(user => user.id === parseInt(userId));
    if (userIndex === -1) {
      return res.status(404).json({ message: 'User not found' });
    }

    users.splice(userIndex, 1);
    await storage.saveUsers(users);

    res.json({ message: 'User registration denied and removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await storage.getUsers();
    const usersWithoutPasswords = users.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
    
    res.json(usersWithoutPasswords);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!['admin', 'user', 'viewer'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const users = await storage.getUsers();
    const userIndex = users.findIndex(user => user.id === parseInt(userId));
    
    if (userIndex === -1) {
      return res.status(404).json({ message: 'User not found' });
    }

    users[userIndex].role = role;
    await storage.saveUsers(users);

    const updatedUser = { ...users[userIndex] };
    delete updatedUser.password;

    res.json({ message: 'User role updated successfully', user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const users = await storage.getUsers();
    
    const userIndex = users.findIndex(user => user.id === parseInt(userId));
    if (userIndex === -1) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent deleting yourself
    if (users[userIndex].id === req.user.id) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    users.splice(userIndex, 1);
    await storage.saveUsers(users);

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { 
  getPendingUsers, 
  approveUser, 
  denyUser, 
  getAllUsers,
  updateUserRole,
  deleteUser
};
