const storage = require('../utils/storage');
const { generateId, hashPassword, comparePassword, generateToken } = require('../utils/helpers');

const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const users = await storage.getUsers();
    
    // Check if user already exists
    const existingUser = users.find(user => 
      user.email === email || user.username === username
    );

    if (existingUser) {
      return res.status(400).json({ 
        message: 'User already exists with this email or username' 
      });
    }

    // Create new user
    const newUser = {
      id: generateId(users),
      username,
      email,
      password: await hashPassword(password),
      role: 'user',
      isApproved: false,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    await storage.saveUsers(users);

    res.status(201).json({ 
      message: 'User registered successfully. Waiting for admin approval.' 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const users = await storage.getUsers();
    const user = users.find(u => u.email === email);
    
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    if (!user.isApproved) {
      return res.status(400).json({ message: 'Account pending admin approval' });
    }

    const token = generateToken({ userId: user.id, email: user.email });

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { register, login };