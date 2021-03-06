var gulp       = require("gulp");
var sourcemaps = require("gulp-sourcemaps");
var babel      = require("gulp-babel");
var watch      = require("gulp-watch");
var plumber    = require("gulp-plumber");
 
gulp.task("default", function () {
    return gulp.src("bin-src/**/*.js")
        .pipe(sourcemaps.init())
        .pipe(babel({ stage: 1 }))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest("bin"));
});

gulp.task("dev", function () {
    return gulp.src("bin-src/**/*.js")
        .pipe(plumber())
        .pipe(watch("bin-src/**/*.js"))
        .pipe(sourcemaps.init())
        .pipe(babel({ stage: 1 }))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest("bin"));
});