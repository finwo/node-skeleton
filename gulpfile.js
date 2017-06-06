var bower       = require('bower'),
    cleanCss    = require('gulp-clean-css'),
    engine      = require('./client/lib/template-engine'),
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
    targetDir = __dirname + '/web';

// Configure i18n
i18n.configure({
  directory  : approot + '/config/languages/',
  locales    : Object.keys(config.languages),
  updateFiles: false
});

// Configure the template engine
engine.enableI18n(i18n);
    
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

gulp.task('css', function() {
  gulp
    .src(sourceDir + '/assets/styles/*.less')
    .pipe(less({}))
    .pipe(cleanCss())
    .pipe(gulp.dest(targetDir + '/assets/css'))
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

gulp.task('build', function(done) {
  runSequence('clean', 'bower', 'css', 'html', done);
});

gulp.task('default', ['build']);
