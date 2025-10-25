const storage = require('./utils/storage');
const { hashPassword } = require('./utils/helpers');

const fixAdminUser = async () => {
  try {
    const users = await storage.getUsers();
    
    // Remove any existing admin user
    const filteredUsers = users.filter(user => user.email !== 'admin@ssms.com');
    
    // Create new admin user
    const adminUser = {
      id: 1,
      username: 'admin',
      email: 'admin@ssms.com',
      password: await hashPassword('admin123'), // This will hash the password
      role: 'admin',
      isApproved: true,
      createdAt: new Date().toISOString()
    };
    
    filteredUsers.unshift(adminUser);
    await storage.saveUsers(filteredUsers);
    
    console.log('Admin user created successfully!');
    console.log('Email: admin@ssms.com');
    console.log('Password: admin123');
    console.log('Please change the password after first login!');
    
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
};

fixAdminUser();
