/* jshint node: true */
'use strict';

var watchify = require('watchify');
var browserify = require('browserify');
var gulp = require('gulp');
var sass = require('gulp-sass');
var source = require('vinyl-source-stream');
var del = require('del');
var uglify = require('gulp-uglify');
var shell = require('gulp-shell');
//var SysCodeBuilder = require('gulp-sysCodeBuilder');
var Server = require('karma').Server;
var mocha = require('gulp-mocha');
var gutil = require('gulp-util');
var protractor = require("gulp-protractor").protractor;
var gulpSequence = require('gulp-sequence');

var b =  browserify({entries: ['src/appModule.js', 'src/node_modules/angular-material-expansion-panel/dist/md-expansion-panel.js'],cache: {},packageCache: {},plugin: [watchify]});
var b_no_watch =  browserify({entries: ['src/appModule.js', 'src/node_modules/angular-material-expansion-panel/dist/md-expansion-panel.js'], cache: {}, packageCache: {}, plugin: []});

/*This task makes a single js file for our project*/
gulp.task('browserify', bundle);

b.on('update', bundle); // on any dep update, runs the bundler
//bundle();

gulp.task('browserify_no_watch', function (){
  return  b_no_watch.bundle()
  .pipe(source('bundle.js'))
  .pipe(gulp.dest('./src'));
});

gulp.task('cleanwww', ['browserify_no_watch'], function () {
     //Clear destination
    return del(['www'],{force: true});
});

/*This task will copy all necessary files for a www directory. Later can be used with cordova to make an mobile app*/
gulp.task('www',['cleanwww'], function () {

 //Copy css and js with minification
 //Cordova Assets not needed in /www
gulp.src(['src/**/angular-material.min.css','src/**/@sysnovare/**', '!src/assets/cordova/**', '!src/assets/cordova', 'src/**/assets/**', '!src/scss/**'])
    .pipe(gulp.dest('./www'));

gulp.src(['src/index.js'])
    //.pipe(uglify())
    .pipe(gulp.dest('./www'));
 
    gulp.src(['src/bundle.js'])
    //.pipe(uglify())
    .pipe(gulp.dest('./www'));

  return gulp.src(['!src/node_modules/**/*.*','src/**/*.html'])
    .pipe(gulp.dest('./www'));
});

gulp.task('buildApk', ['www'], shell.task(['cordova build android']));

gulp.task('installDevice', ['buildApk'], shell.task(['adb install -r android-debug.apk'], {cwd: './platforms/android/build/outputs/apk/'}));

function bundle() {

  return  b.bundle()
  .on('error', function (err) {
            console.log(err.toString());
            this.emit("end");
        })
  .pipe(source('bundle.js'))
  .pipe(gulp.dest('./src'));

}

// Compile Scss to Css
gulp.task('compile-scss', function() {
  return gulp.src('src/scss/**/*.scss')
  .pipe(sass())
  .pipe(gulp.dest('src/assets/css/'));
});

// Watch and Compile on scss files change
gulp.task('watch-scss', function() {
  gulp.watch('src/scss/**/*.scss', ['compile-scss']);
});

/*var buildPath='./src/nav/*.json';
gulp.task('SysCodeBuilder', function () {
    console.log(SysCodeBuilder);
    return gulp.src([buildPath])
        .pipe(SysCodeBuilder())
        .pipe(gulp.dest(buildPath));


});*/

gulp.task('run-karma', function (done) {
  // command line: $karma start
  return new Server({
      configFile: __dirname + '/karma.conf.js',
      singleRun: true
      }, function(err){
          if(err === 0){
              done();
          } else {
              done(new gutil.PluginError('karma', {
                  message: 'Karma Tests failed: ' + err
              }));
              process.exit(1);
          }
      }).start(' --reporters html');
});

gulp.task('run-mocha', function (done) {  
  // command line: $mocha spec/mocha/*.js
  return gulp.src(['src/tests/spec/mocha/**/*Spec.js'], { read: false })        
         .pipe(mocha({ reporter: 'mochawesome',
                       reporterOptions: {
                          reportDir: 'src/tests/report/mocha',
                          reportName: 'index',
                          reportTitle: 'Mocha Test',
                          inlineAssets: true}
                  }))
         .on('error', function(err){
             done(new gutil.PluginError('Mocha', {
                  message: 'Mocha Tests failed: ' + err.message.toString()
              }));
              process.exit(1);
         });
});

gulp.task('run-protractor', function(done) {
    // command line: $protractor protractor.conf.js
    gulp.src(['src/tests/spec/protractor/**/*Spec.js'])  
            .pipe(protractor({'configFile': 'protractor.conf.js',
            }))
            .on('error', function(e) {
                done(new gutil.PluginError('Protractor', {
                  message: 'Protractor Tests failed: ' + e.message.toString()
                }));
                process.exit(1);
            })
            .on('end', done);
});

gulp.task('run-test', gulpSequence('run-mocha', 'run-karma','run-protractor'));
