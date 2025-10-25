const storage = require('./utils/storage');
const { comparePassword } = require('./utils/helpers');

const debugAuth = async () => {
  try {
    console.log('=== DEBUG AUTHENTICATION ===');
    
    // Check if we can read users
    const users = await storage.getUsers();
    console.log('Total users:', users.length);
    console.log('Users:', JSON.stringify(users, null, 2));
    
    // Test admin login
    const testEmail = 'admin@ssms.com';
    const testPassword = 'admin123';
    
    const user = users.find(u => u.email === testEmail);
    console.log('\n=== FINDING USER ===');
    console.log('Looking for email:', testEmail);
    console.log('User found:', user ? 'YES' : 'NO');
    
    if (user) {
      console.log('User details:', {
        id: user.id,
        email: user.email,
        isApproved: user.isApproved,
        role: user.role,
        passwordLength: user.password ? user.password.length : 'no password'
      });
      
      // Test password comparison
      console.log('\n=== PASSWORD CHECK ===');
      const isMatch = await comparePassword(testPassword, user.password);
      console.log('Password matches:', isMatch);
      console.log('User approved:', user.isApproved);
      console.log('Can login:', isMatch && user.isApproved);
    }
    
  } catch (error) {
    console.error('Debug error:', error);
  }
};

debugAuth();
