const storage = require('../utils/storage');
const { comparePassword, generateToken } = require('../utils/helpers');

const login = async (req, res) => {
  try {
    console.log('Login request received:', {
      body: req.body,
      headers: req.headers,
      ip: req.ip
    });

    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      console.log('Missing email or password');
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const users = await storage.getUsers();
    const user = users.find(u => u.email === email);
    
    if (!user) {
      console.log('User not found:', email);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await comparePassword(password, user.password);
    console.log('Password match result:', isMatch);

    if (!isMatch) {
      console.log('Password does not match for user:', email);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    if (!user.isApproved) {
      console.log('User not approved:', email);
      return res.status(400).json({ message: 'Account pending admin approval' });
    }

    const token = generateToken({ userId: user.id, email: user.email });

    console.log('Login successful for:', email);
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
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    console.log('Registration attempt:', { username, email });

    const users = await storage.getUsers();
    
    const existingUser = users.find(user => 
      user.email === email || user.username === username
    );

    if (existingUser) {
      return res.status(400).json({ 
        message: 'User already exists with this email or username' 
      });
    }

    const { hashPassword, generateId } = require('../utils/helpers');
    
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

    console.log('User registered successfully:', email);
    res.status(201).json({ 
      message: 'User registered successfully. Waiting for admin approval.' 
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { register, login };