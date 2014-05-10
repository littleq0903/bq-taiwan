require! <[gulp gulp-util gulp-livescript]>
gutil = gulp-util

gulp.task 'js:app' ->
  app = gulp.src 'app/**/*.ls'
    .pipe gulp-livescript({+bare}).on 'error', gutil.log
    .pipe gulp.dest 'static/compiled-js'

gulp.task 'build' <[js:app]>
