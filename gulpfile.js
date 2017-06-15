var co          = require('co'),
    fs          = require('fs-extra'),
    gulp        = require('gulp')
    runSequence = require('run-sequence');

var sourceDir, targetDir;

gulp.task('config', co.wrap(function*(done) {
  require('./src/helper');
  global.approot = __dirname;
  global.config  = yield require('./config');
  sourceDir = approot + '/client/app';
  targetDir = config.http.static_route;
  
  console.log(config);
  done();
}));

gulp.task('clean', ['config'], function(done) {
  fs.remove(targetDir)
    .then(function(){done();});
});

gulp.task('build', ['clean'], function(done) {
  runSequence(done)
});

gulp.task('default', function(done) {
  runSequence('build', done);
});
