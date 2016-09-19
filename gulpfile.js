'use strict';

var gulp = require('gulp');
var browserify = require('gulp-browserify');
var htmlreplace = require('gulp-html-replace');
var jshint = require('gulp-jshint');
var minify = require('gulp-minify');

var paths = {
  html: ['index.html'],
  js: {
    all: ['gulpfile.js', 'js/**'],
    entryPoints: ['js/app.js']
  },
  assets: ['textures/**'],
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
    .pipe(minify({
        ext:{
            src:'-debug.js',
            min:'.js'
        },
        exclude: ['tasks'],
        ignoreFiles: ['.combo.js', '-min.js']
    }))
    .pipe(gulp.dest(paths.target));
});

// JS linting
gulp.task('lint', function() {
  return gulp.src(paths.js.all)
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'));
});

// Build for production
gulp.task('build', ['browserify'], function() {
  console.log("Building app for production.");
  // HTML source
  gulp.src(paths.html)
    .pipe(htmlreplace({
        'js': 'app.js'
      }))
    .pipe(gulp.dest(paths.target));
  // Assets
  gulp.src(paths.assets)
    .pipe(gulp.dest(paths.target + 'textures'));
});

// Auto-run tasks on file changes
gulp.task('watch', function() {
  gulp.watch(paths.js.all, ['lint', 'browserify']);
});

// Run main tasks on launch
gulp.task('default', ['lint', 'browserify', 'build'], function() {});
