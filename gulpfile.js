var gulp = require('gulp');
var exec = require('child_process').exec;
var chalk = require('chalk');
var argv = require('yargs').argv;
var sass = require("gulp-sass");
var autoprefixer = require('gulp-autoprefixer');

gulp.task('default', ['build']);

gulp.task('build', ['build-styles'], function() {
  exec('mkdocs build', function (err, stdout, stderr) {});
  console.log("\n" + chalk.green('Documentation is now built.') + "\n");
});

gulp.task('clean', function() {
  exec('mkdocs build --clean', function (err, stdout, stderr) {});
  console.log("\n" + chalk.green('Documentation is now cleaned.') + "\n");
});

gulp.task('watch', function() {
  var port = argv.port || 8000;
  exec('mkdocs serve --dev-addr=0.0.0.0:' + port, function (err, stdout, stderr) {});
  console.log("\n" + chalk.green('Server now running on port: ') + chalk.yellow(port) + "\n");
  gulp.watch(['docs/styles/**/*.*'], ['build-styles']);
});

gulp.task('watch-styles', function() {
  gulp.watch(['docs/styles/**/*.*'], ['build-styles']);
});

gulp.task('build-styles', function() {
  return gulp.src(['./docs/styles/style.scss'])
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer({
      browsers: ['last 3 versions', '> 5%', 'Firefox > 3', 'ie >= 8']
    }))
    .pipe(gulp.dest('./docs/styles'));
});
