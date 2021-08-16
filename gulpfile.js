const { readFileSync } = require("fs");
const gulp = require('gulp')
const gulpif = require('gulp-if')
const hash = require("gulp-hash");
const rewrite = require("gulp-rev-rewrite");
const hashOptions = { template: "<%= name %>.<%= hash %><%= ext %>" };
const hashFilename = "hash-manifest.json";
const argv = require('minimist')(process.argv.slice(2))
const env = argv.env ? argv.env : 'development'
const output = {
  development: './tmp/markdown',
  production: './dist/markdown',
}
const browserSync = require('browser-sync').create()

// CSS
gulp.task('css', function () {
  const autoprefixer = require('gulp-autoprefixer');
  const cleancss = require('gulp-clean-css')
  const rename = require('gulp-rename')

  return gulp.src("./src/styles/index.css")
    .pipe(autoprefixer())
    .pipe(gulpif(env === "production", cleancss()))
    .pipe(rename("./css/styles.css"))
    .pipe(hash(hashOptions))
    .pipe(gulp.dest(output[env]))
    .pipe(
      hash.manifest(hashFilename, {
        deleteOld: true,
        sourceDir: __dirname + output[env].substring(1),
      })
    )
    .pipe(gulp.dest(output[env]));
})

// JS
const browserify = require('browserify')
const babelify = require('babelify')
const source = require('vinyl-source-stream')
const buffer = require('vinyl-buffer')
const sourcemaps = require('gulp-sourcemaps')
const uglify = require('gulp-uglify')

gulp.task('js', function () {
  const b = browserify({
    entries: 'src/scripts/index.js',
    debug: env === 'production',
  })

  return b.transform(
    babelify.configure({
      presets: ["@babel/preset-env"],
      sourceMaps: env === "production",
    })
  )
    .bundle()
    .pipe(source("js/scripts.js"))
    .pipe(buffer())
    .pipe(gulpif(env === "production", sourcemaps.init({ loadMaps: true })))
    .pipe(gulpif(env === "production", uglify()))
    .pipe(gulpif(env === "production", sourcemaps.write("./")))
    .pipe(hash(hashOptions))
    .pipe(gulp.dest(output[env]))
    .pipe(
      hash.manifest(hashFilename, {
        deleteOld: true,
        sourceDir: __dirname + output[env].substring(1),
        append: true,
      })
    )
    .pipe(gulp.dest(output[env]));
})

// HTML
gulp.task('html', function () {
  const manifest = readFileSync(`${output[env]}/${hashFilename}`);

  return gulp.src("./src/**/*.html")
    .pipe(rewrite({ manifest }))
    .pipe(gulp.dest(output[env]));
})

// Build
gulp.task('build', gulp.series('css', 'js', 'html'))

// Reload browser
gulp.task('reload', (done) => {
  browserSync.reload()
  done()
})

// Browser sync
gulp.task('browserSync', () => {
  browserSync.init({
    port: 3003,
    server: './tmp',
    startPath: `/markdown/index.html`,
    ui: false,
  })
  gulp.watch(
    ['src/styles/**/*.css', 'src/scripts/**/*.js', 'src/**/*.html'],
    gulp.series('build', 'reload')
  )
})

// Dev server
gulp.task('serve', gulp.series('build', 'browserSync'))
