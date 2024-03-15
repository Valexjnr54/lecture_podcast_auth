const crypto = require('crypto');

async function generateStrongPassword(length) {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_+=';
    const randomBytes = crypto.randomBytes(length);
    let password = '';
    for (let i = 0; i < length; i++) {
        const index = randomBytes[i] % chars.length;
        password += chars[index];
    }
    return password;
}

module.exports = {
    generateStrongPassword
};
