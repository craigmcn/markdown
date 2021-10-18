const {
    readFileSync
} = require("fs");
const gulp = require('gulp')
const gulpif = require('gulp-if')
const hash = require("gulp-hash");
const rewrite = require("gulp-rev-rewrite");
const hashOptions = {
    template: "<%= name %>.<%= hash %><%= ext %>"
};
const hashFilename = "hash-manifest.json";
const argv = require('minimist')(process.argv.slice(2))
const env = argv.env ? argv.env : 'development'
const output = {
    development: './tmp',
    production: './dist',
    netlify: './netlify',
}
const outputNetlify = `${output[env]}/markdown`
const browserSync = require('browser-sync').create()

// CSS
gulp.task('css', function () {
    const autoprefixer = require('gulp-autoprefixer');
    const cleancss = require('gulp-clean-css')
    const rename = require('gulp-rename')

    return gulp.src("./src/styles/index.css")
        .pipe(autoprefixer())
        .pipe(gulpif(env !== "development", cleancss()))
        .pipe(rename("./css/styles.css"))
        .pipe(hash(hashOptions))
        .pipe(gulp.dest(output[env]))
        .pipe(gulpif(env === 'netlify', gulp.dest(outputNetlify)))
        .pipe(
            hash.manifest(hashFilename, {
                deleteOld: true,
                sourceDir: __dirname + output[env].substring(1),
            })
        )
        .pipe(gulp.dest(output[env]))
        .pipe(gulpif(env === 'netlify', gulp.dest(outputNetlify)))
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
        debug: env !== "development",
    })

    return b.transform(
            babelify.configure({
                presets: ["@babel/preset-env"],
                sourceMaps: env !== "development",
            })
        )
        .bundle()
        .pipe(source("js/scripts.js"))
        .pipe(buffer())
        .pipe(gulpif(env !== "development", sourcemaps.init({
            loadMaps: true
        })))
        .pipe(gulpif(env !== "development", uglify()))
        .pipe(gulpif(env !== "development", sourcemaps.write("./")))
        .pipe(hash(hashOptions))
        .pipe(gulp.dest(output[env]))
        .pipe(gulpif(env === 'netlify', gulp.dest(outputNetlify)))
        .pipe(
            hash.manifest(hashFilename, {
                deleteOld: true,
                sourceDir: __dirname + output[env].substring(1),
                append: true,
            })
        )
        .pipe(gulp.dest(output[env]))
        .pipe(gulpif(env === 'netlify', gulp.dest(outputNetlify)))
})

gulp.task('mm-js', function () {
    const b = browserify({
        entries: 'src/scripts/music-monday.js',
        debug: env !== "development",
    })

    return b.transform(
            babelify.configure({
                presets: ["@babel/preset-env"],
                sourceMaps: env !== "development",
            })
        )
        .bundle()
        .pipe(source("js/mm.js"))
        .pipe(buffer())
        .pipe(gulpif(env !== "development", sourcemaps.init({
            loadMaps: true
        })))
        .pipe(gulpif(env !== "development", uglify()))
        .pipe(gulpif(env !== "development", sourcemaps.write("./")))
        .pipe(hash(hashOptions))
        .pipe(gulp.dest(output[env]))
        .pipe(gulpif(env === 'netlify', gulp.dest(outputNetlify)))
        .pipe(
            hash.manifest(hashFilename, {
                deleteOld: true,
                sourceDir: __dirname + output[env].substring(1),
                append: true,
            })
        )
        .pipe(gulp.dest(output[env]))
        .pipe(gulpif(env === 'netlify', gulp.dest(outputNetlify)))
})


// HTML
gulp.task('html', function () {
    const manifest = readFileSync(`${output[env]}/${hashFilename}`);

    return gulp.src("./src/**/*.html")
        .pipe(rewrite({
            manifest
        }))
        .pipe(gulp.dest(output[env]))
        .pipe(gulpif(env === 'netlify', gulp.dest(outputNetlify)))
})

// Build
gulp.task('build', gulp.series('css', 'js', 'mm-js', 'html'))

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
        ui: false,
    })
    gulp.watch(
        ['src/styles/**/*.css', 'src/scripts/**/*.js', 'src/**/*.html'],
        gulp.series('build', 'reload')
    )
})

// Dev server
gulp.task('serve', gulp.series('build', 'browserSync'))
