var bower       = require('bower'),
    gulp        = require('gulp'),
    runSequence = require('run-sequence');

gulp.task('clean', function(done) {
  done();
});

gulp.task('bower', function(done) {
  var orgDir = process.cwd();
  process.chdir('./client');
  bower.commands
    .install()
    .on('end', function() {
      process.chdir(orgDir);
      done();
    });
});

gulp.task('build', function(done) {
  runSequence('clean', 'bower', done);
});

gulp.task('default', ['build']);
