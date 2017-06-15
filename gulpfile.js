var bower       = require('bower'),
    cleanCss    = require('gulp-clean-css'),
    co          = require('co'),
    engine      = require('./client/lib/template-engine'),
    fs          = require('fs-extra'),
    gulp        = require('gulp'),
    gutil       = require('gulp-util'),
    i18n        = require('i18n'),
    less        = require('gulp-less'),
    runSequence = require('run-sequence');

var sourceDir, targetDir;

gulp.task('config', co.wrap(function*() {
  require('./src/helper');
  global.approot = __dirname;
  global.config  = yield require('./config');
  sourceDir = approot + '/client/app';
  targetDir = config.http.static_route;
}));

gulp.task('clean', function(done) {
  fs.remove(targetDir)
    .then(function(){done();});
});

gulp.task('engine', function(done) {
  i18n.configure({
    directory  : approot + '/config/language/',
    locales    : Object.keys(config.language),
    updateFiles: false
  });
  engine.enableI18n(i18n);
  gutil.log('Languages', Object.keys(config.language));
  done();
});

gulp.task('bower', function(done) {
  bower.commands
    .install()
    .on('end', function() {
      fs.ensureSymlink( approot + '/bower_components', targetDir + '/assets/bower', done);
    });
});

gulp.task('css', function(done) {
  var maps    = {
    '/assets/styles/*.less'      : '/assets/css',
    '/assets/styles/pages/*.less': '/assets/css/pages'
  };
  var mapKeys = Object.keys(maps);
  (function next() {
    var mapKey = mapKeys.shift();
    if ( !mapKey ) return done();
    gulp
      .src(sourceDir + mapKey)
      .pipe(less({}))
      .pipe(cleanCss())
      .pipe(gulp.dest(targetDir + maps[ mapKey ]))
      .on('end', next)
  })();
});

gulp.task('build', function(done) {
  runSequence('config', 'clean', 'engine', 'bower', 'css', done)
});

gulp.task('default', ['build']);
