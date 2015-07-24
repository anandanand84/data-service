var gulp   = require('gulp');
var tsc    = require('gulp-tsc');
var shell  = require('gulp-shell');
var runseq = require('run-sequence');
var download = require("gulp-download");
var closureCompiler = require('gulp-closure-compiler');
var protoUrl = 'http://traderslab.in:9010/proto/StockMessages.proto'

var paths = {
  tscripts : { src : ['app/src/**/*.ts'],
        dest : 'app/build' }
};

gulp.task('default', function(){
  runseq('update-proto','generate-dts-proto','copy-proto','watchrun')
});

gulp.task('update-proto',function(){
  download(protoUrl)
    .pipe(gulp.dest("app/src/"));
});

gulp.task('generate-dts-proto',shell.task(['protoc -I=. --dts_out=. StockMessages.proto'],{cwd:'app/src/'}));


gulp.task('copy-proto', function() {
    gulp.src('app/src/StockMessages.proto')
   .pipe(gulp.dest('./app/build/'));
});

// ** Running ** //

gulp.task('run', shell.task([
  'node DataService-Minified.js'
],{cwd:'app/build/'}));
// ** Watching ** //

gulp.task('watch', function () {
  gulp.watch(paths.tscripts.src, ['compile:typescript','browserify-ts']);
});

gulp.task('watchrun', function () {
  gulp.watch(paths.tscripts.src, runseq('compile:typescript','browserify-ts','compress'));
});


gulp.task('build', ['compile:typescript']);

gulp.task('compile:typescript', function () {
  return gulp
  .src(paths.tscripts.src)
  .pipe(tsc({
    emitError: true
  }))
  .pipe(gulp.dest(paths.tscripts.dest));
});

gulp.task('compress', function() {
  return gulp.src('app/build/DataService-Browsified.js')
    .pipe(closureCompiler({
      compilerPath: 'bower_components/closure-compiler/compiler.jar',
      fileName:'DataService-Minified.js',
      compilerFlags: {
        compilation_level: 'SIMPLE_OPTIMIZATIONS',
        warning_level:'default'
       }
    }))
    .pipe(gulp.dest('app/build/'));
});

// Basic usage 
gulp.task('browserify-ts', shell.task(['browserify DataService.js --no-bundle-external -o DataService-Browsified.js'],{cwd:"app/build/"}));