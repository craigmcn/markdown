const gulp = require('gulp')
const gulpif = require('gulp-if')
const argv = require('minimist')(process.argv.slice(2))
const env = argv.env ? argv.env : 'development'
const output = {
  development: './tmp',
  production: './dist',
}
const browserSync = require('browser-sync').create()

// CSS
gulp.task('css', (done) => {
  const autoprefixer = require('gulp-autoprefixer');
  const cleancss = require('gulp-clean-css')
  const rename = require('gulp-rename')

  gulp
    .src('./src/styles/index.css')
    .pipe(autoprefixer())
    .pipe(gulpif(env === 'production', cleancss()))
    .pipe(rename('./css/styles.css'))
    .pipe(gulp.dest(output[env]))
  done()
})

// JS
const browserify = require('browserify')
const babelify = require('babelify')
const source = require('vinyl-source-stream')
const buffer = require('vinyl-buffer')
const sourcemaps = require('gulp-sourcemaps')
const uglify = require('gulp-uglify')

gulp.task('js', (done) => {
  const b = browserify({
    entries: 'src/scripts/index.js',
    debug: env === 'production',
  })

  b.transform(
    babelify.configure({
      presets: ['@babel/preset-env'],
      sourceMaps: env === 'production',
    })
  )
    .bundle()
    .pipe(source('js/scripts.js'))
    .pipe(buffer())
    .pipe(gulpif(env === 'production', sourcemaps.init({ loadMaps: true })))
    .pipe(gulpif(env === 'production', uglify()))
    .pipe(gulpif(env === 'production', sourcemaps.write('./')))
    .pipe(gulp.dest(output[env]))
  done()
})

// HTML
gulp.task('html', (done) => {
  gulp.src('./src/**/*.html').pipe(gulp.dest(output[env]))
  done()
})

// Build
gulp.task('build', gulp.parallel('css', 'js', 'html'))

// Reload browser
gulp.task('reload', (done) => {
  browserSync.reload()
  done()
})

// Browser sync
gulp.task('browserSync', () => {
  browserSync.init({
    port: 3003,
    server: output[env],
    ui: false,
  })
  gulp.watch(
    ['src/styles/**/*.css', 'src/scripts/**/*.js', 'src/**/*.html'],
    gulp.series('build', 'reload')
  )
})

// Dev server
gulp.task('serve', gulp.series('build', 'browserSync'))
