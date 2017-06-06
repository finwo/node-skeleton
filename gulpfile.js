var bower       = require('bower'),
    gulp        = require('gulp'),
    runSequence = require('run-sequence');

gulp.task('clean', function(done) {
  done();
});

gulp.task('bower', function(done) {
  bower.commands
    .install()
    .on('end', function() {
      done();
    });
});

gulp.task('build', function(done) {
  runSequence('clean', 'bower', done);
});

gulp.task('default', ['build']);
