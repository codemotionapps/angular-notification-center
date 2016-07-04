var fs = require('fs');
var gulp = require('gulp');
var concat = require('gulp-concat');
var header = require('gulp-header');
var rename = require('gulp-rename');
var es = require('event-stream');
var uglify = require('gulp-uglify');
var plumber = require('gulp-plumber');
var order = require("gulp-order");
var del = require('del');
var connect = require('gulp-connect');


var config = {
  pkg : JSON.parse(fs.readFileSync('./package.json')),
  banner:
      '/*!\n' +
      ' * <%= pkg.name %>\n' +
      ' * <%= pkg.homepage %>\n' +
      ' * Version: <%= pkg.version %> - <%= timestamp %>\n' +
      ' * License: <%= pkg.license %>\n' +
      ' */\n\n\n'
};

gulp.task('clean', function(cb) {
  del(['build/**/*'], cb);
});

gulp.task('scripts', ['clean'], function() {

  function buildDistJS(){
    return gulp.src('src/module.js')
      .pipe(plumber({
        errorHandler: handleError
      }));
  };

  es.merge(buildDistJS())
    .pipe(plumber({
      errorHandler: handleError
    }))
    .pipe(order([
      'module.js'
    ]))
    .pipe(concat('module.js'))
    .pipe(header(config.banner, {
      timestamp: (new Date()).toISOString(), pkg: config.pkg
    }))
    .pipe(gulp.dest('build'))
    .pipe(rename({suffix: '.min'}))
    .pipe(uglify({preserveComments: 'some'}))
    .pipe(gulp.dest('./build'))
    .pipe(connect.reload());
});

function handleError(err) {
  console.log(err.toString());
  this.emit('end');
};

gulp.task('build', ['scripts']);

gulp.task('default', ['scripts']);