const { withPlugins } = require('@expo/config-plugins');

module.exports = function withNotifee(config) {
  return withPlugins(config, []);
};