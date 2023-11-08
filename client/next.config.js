module.exports = {
  webpack: (config) => {
    config.watchOptions.poll = 300; //this is to help nextjs to notice file changes
    return config;
  },
};
