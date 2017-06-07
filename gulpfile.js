var bower       = require('bower'),
    cleanCss    = require('gulp-clean-css'),
    engine      = require('./client/lib/template-engine'),
    fs          = require('fs-extra'),
    gulp        = require('gulp'),
    htmlmin     = require('gulp-htmlmin'),
    i18n        = require('i18n'),
    less        = require('gulp-less'),
    runSequence = require('run-sequence');

// Helpers
require('./src/helpers');

// Initialize config
global.approot = __dirname;
global.config  = require('./config');

// Build settings
var sourceDir = __dirname + '/client/app',
    targetDir = config.http.static_route;

// Configure i18n
i18n.configure({
  directory  : approot + '/config/languages/',
  locales    : Object.keys(config.languages),
  updateFiles: false
});

// Configure the template engine
engine.enableI18n(i18n);
    
gulp.task('clean', function(done) {
  fs.remove(targetDir, function(err) {
    if(!err) {
      return done();
    }
    throw err;
  });
});

gulp.task('bower', function(done) {
  bower.commands
    .install()
    .on('end', function() {
      fs.ensureSymlink( sourceDir + '/../bower_components', targetDir + '/assets/bower', done);
    });
});

gulp.task('css', function(done) {
  var maps = {
    '/assets/styles/*.less': '/assets/css',
    '/assets/styles/pages/*.less': '/assets/css/pages'
  };
  var mapKeys = Object.keys(maps);
  (function next() {
    var mapKey = mapKeys.shift();
    if(!mapKey) return done();
    gulp
      .src( sourceDir + mapKey )
      .pipe(less({}))
      .pipe(cleanCss())
      .pipe(gulp.dest( targetDir + maps[mapKey] ))
      .on('end', next)
  })();
});

gulp.task('html', function(done) {
  var languages = Object.keys(config.languages);
  engine.partials(sourceDir + '/partials/**/*.hbs');
  (function next() {
    var language = languages.shift();
    if(!language) return done();
    if(language=='default') return next();
    i18n.setLocale(language);
    engine.data({
      _config: config,
      _lang  : language
    });
    gulp
      .src(sourceDir + '/*.hbs')
      .pipe(engine.render())
      .pipe(htmlmin({ collapseWhitespace: true }))
      .pipe(gulp.dest( targetDir + '/' + language + '/' ))
      .on('end', next);
  })();
});

gulp.task('images', function(done) {
  var extensions = [ 'gif', 'ico', 'png' ];
  (function next() {
    var extension = extensions.shift();
    if (!extension) return done();
    gulp
      .src( sourceDir + '/assets/images/**/*.' + extension )
      .pipe(gulp.dest(targetDir + '/assets/img'))
      .on('end', next)
  })();
});

gulp.task('build', function(done) {
  runSequence('clean', 'bower', 'css', 'html', 'images', done);
});

gulp.task('default', ['build']);