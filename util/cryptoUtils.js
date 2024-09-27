const crypto = require('crypto');

// Function to hash the ID using the secret key
const hashId = (id, secretKey) => {
    const hash = crypto.createHmac('sha256', secretKey)
                       .update(id.toString())
                       .digest('hex');
    return hash;
};

module.exports = { hashId };