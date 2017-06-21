module.exports = {
  name   : 'mongodb',
  options: process.env.MONGODB_URI || 'mongodb://localhost:27017/trackthis'
};
