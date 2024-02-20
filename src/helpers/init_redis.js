const redis = require('redis');

// Create a Redis client
const client = redis.createClient({
    host: 'redis-12952.c135.eu-central-1-1.ec2.cloud.redislabs.com',
    port: 12952,
    password: 'Xhhc0D7Xh67PKVSYspsBcvCSauunqBI6'
});

// Event handlers
client.on('connect', () => {
    console.log('Connected to Redis');
});

client.on('ready', () => {
    console.log('Redis is ready to use');
});

client.on('error', (error) => {
    console.error('Redis error:', error);
});

client.on('end', () => {
    console.log('Disconnected from Redis');
});

// Handle process termination
process.on('SIGINT', () => {
    client.quit();
    console.log('Process terminated, Redis connection closed');
});

module.exports = client;
