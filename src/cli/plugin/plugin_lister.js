const fs = require('fs');

export function list(settings, logger) {
  fs.readdir(settings.pluginDir, function (err, files) {

    files
    .filter(function (file) {
      return file[0] !== '.';
    })
    .forEach(function (pluginFile) {
      logger.log(pluginFile);
    });
  });
}