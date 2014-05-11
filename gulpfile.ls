require! <[gulp gulp-util gulp-livescript gulp-watch]>
gutil = gulp-util
var http-server
livereload-server = require('tiny-lr')!
livereload = -> gulp-livereload livereload-server

gulp.task 'js:app' ->
  app = gulp.src 'app/**/*.ls'
    .pipe gulp-livescript({+bare}).on 'error', gutil.log
    .pipe gulp.dest 'static/compiled-js'

gulp.task 'build' <[js:app]>

gulp.task 'httpServer' ->
  require! express
  app = express!
  app.use require('connect-livereload')!
  app.use '/static' express.static "static"
  app.all '/**' (req, res, next) ->
    res.sendfile './index.html'
  # use http-server here so we can close after protractor finishes
  http-server := require 'http' .create-server app
  port = 5000
  http-server.listen port, ->
    console.log "Running on http://localhost:#port"

gulp.task 'dev' <[httpServer build]> ->
  LIVERELOADPORT = 35729
  livereload-server.listen LIVERELOADPORT, ->
    return gutil.log it if it
  gulp.watch ['app/**/*.ls'] <[js:app]>
