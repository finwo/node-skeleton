module.exports = {
  name: 'mongodb',
  options: {
    url: process.env.MONGODB_URI || 'mongodb://localhost:27017/trackthis'
  }
};
