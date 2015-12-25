'use strict';

var gulp = require('gulp');
var browserify = require('gulp-browserify');
var jshint = require('gulp-jshint');

var paths = {
  js: {
    all: ['gulpfile.js', 'js/**'],
    entryPoints: ['js/app.js']
  },
  target: 'dist/',
};

// JS compiling
gulp.task('browserify', function() {
  return gulp.src(paths.js.entryPoints)
    .pipe(browserify({
      debug: true,
      insertGlobals: false,
      // transform: ['brfs']
    }))
    .pipe(gulp.dest(paths.target));
});

// JS linting
gulp.task('lint', function() {
  return gulp.src(paths.js.all)
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'));
});

// TODO: source compression

// Auto-run tasks on file changes
gulp.task('watch', function() {
  gulp.watch(paths.js.all, ['lint', 'browserify']);
});

// Run main tasks on launch
gulp.task('default', ['lint', 'browserify'], function() {});
