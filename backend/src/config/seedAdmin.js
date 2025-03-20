const User = require('../models/User');

const seedAdmin = async () => {
    try {
        // Check if admin already exists
        const adminExists = await User.findOne({ email: 'admin@citacerdas.com' });
        
        if (!adminExists) {
            const admin = await User.create({
                name: 'Admin',
                email: 'admin@citacerdas.com',
                password: 'admin123',
                role: 'admin',
                status: 'active',
                nik: 'ADM001',
                level: 5
            });
            
            console.log('Admin user created successfully');
            return admin;
        }
        
        console.log('Admin user already exists');
        return adminExists;
    } catch (error) {
        console.error('Error seeding admin:', error);
        throw error;
    }
};

module.exports = seedAdmin;