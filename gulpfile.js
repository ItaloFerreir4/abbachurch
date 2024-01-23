let browsersync = require('browser-sync');
let cached = require('gulp-cached');
let cssnano = require('gulp-cssnano');
let del = require('del');
let fileinclude = require('gulp-file-include');
let gulp = require('gulp');
let gulpif = require('gulp-if');
let npmdist = require('gulp-npm-dist');
let replace = require('gulp-replace');
let uglify = require('gulp-uglify');
let useref = require('gulp-useref-plus');
let rename = require('gulp-rename');
let gulpsass = require('gulp-sass');
let sass = require('sass');
let autoprefixer = require("gulp-autoprefixer");
let sourcemaps = require("gulp-sourcemaps");
let cleanCSS = require('gulp-clean-css');
let nodemon = require('nodemon');

let sass$ = gulpsass(sass)
let browsersync$ = browsersync.create();

const isSourceMap = true;

const sourceMapWrite = (isSourceMap) ? "./" : false;

function startServer(callback) {
    nodemon({
        script: './dist/backend/server.js',
        watch: ['./dist/backend'], // Observa mudanças nos arquivos na pasta backend
        env: {
            'NODE_ENV': 'development'
        },
        ext: 'js,json' // Reinicia apenas quando os arquivos JS ou JSON são alterados
    });

    callback();
};

function browsersyncFn(callback) {
    browsersync$.init({
        proxy: 'http://localhost:3000',
        port: 1111,
        https: {
            key: "../../../etc/letsencrypt/live/abbachurch.app/privkey.pem",
            cert: "../../../etc/letsencrypt/live/abbachurch.app/fullchain.pem"
        }
    });
    callback();
};

function browsersyncReload(callback) {
    browsersync$.reload();
    callback();
};

function watch() {
    gulp.watch(['./src/assets/scss/**/*', '!./src/assets/switcher/*.scss'], gulp.series('scss', browsersyncReload));
    gulp.watch(['./src/assets/js/*', './src/assets/js/*.js'], gulp.series('js', browsersyncReload));
    gulp.watch(['./src/assets/plugins/*', './src/assets/plugins/**/*.js'], gulp.series('plugins', browsersyncReload));
    gulp.watch(['./src/html/**/*.html', './src/html/partials/*'], gulp.series('html', browsersyncReload));
    gulp.watch(['./src/backend/**/*'], gulp.series('backend', browsersyncReload)); // Adicionado para observar mudanças na pasta backend
};

function html(callback) {
    var htmlFiles = './src/html/**/*.html';

    gulp
        .src(htmlFiles)
        .pipe(fileinclude({
            prefix: '@SPK@',
            basepath: '@file',
            indent: true,
        }))
        .pipe(useref())
        .pipe(cached())
        .pipe(gulpif('*.js', uglify()))
        .pipe(gulpif('*.css', cssnano({
            svgo: false
        })))
        .pipe(gulp.dest('./dist/html'));

    del.sync('./dist/html/partials')
    callback();
};

function scss(callback) {
    var scssFiles = './src/assets/scss/**/*.scss';
    var cssFiles = './src/assets/css/';
    var cssDest = './dist/assets/css';

    gulp
        .src(scssFiles)
        .pipe(sourcemaps.init())
        .pipe(sass$.sync().on('error', sass$.logError))
        .pipe(autoprefixer())
        .pipe(gulp.dest(cssDest))
        .pipe(gulp.dest(cssFiles))

    gulp
        .src(scssFiles)
        .pipe(sourcemaps.init())
        .pipe(sass$.sync().on('error', sass$.logError))
        .pipe(autoprefixer())
        .pipe(gulp.dest(cssDest))
        .pipe(gulp.dest(cssFiles))
        .pipe(cleanCSS({ debug: true }, (details) => {}))
        .pipe(
            rename({
                suffix: ".min"
            })
        )
        .pipe(sourcemaps.write(sourceMapWrite))
        .pipe(gulp.dest(cssDest))
        .pipe(gulp.dest(cssFiles))

    return callback();
};

function js(callback) {
    var jsFilePath = './dist/assets/js';

    gulp.src('./src/assets/js/*.js')
        .pipe(sourcemaps.init())
        .pipe(gulp.dest(jsFilePath));

    return callback()
};

function plugins(callback) {
    var pluginsFilePath = './dist/assets/plugins/';

    gulp.src('./src/assets/plugins/**/*.js')
        .pipe(sourcemaps.init())
        .pipe(gulp.dest(pluginsFilePath));

    gulp.src('./src/assets/plugins/**/*.js')
        .pipe(sourcemaps.init())
        .pipe(uglify())
        .pipe(
            rename({
                suffix: ".min"
            })
        )
        .pipe(sourcemaps.write(sourceMapWrite))
        .pipe(gulp.dest(pluginsFilePath));

    return callback();
};

function backend(callback) {
    // Copy the backend files to dist
    gulp.src('./src/backend/**/*')
        .pipe(gulp.dest('./dist/backend'));
    return callback();
};

function copyLibs() {
    var destPath = 'dist/assets/libs';

    return gulp
        .src(npmdist(), {
            base: './node_modules'
        })
        .pipe(rename(function (path) {
            path.dirname = path.dirname.replace(/\/dist/, '').replace(/\\dist/, '');
        }))
        .pipe(gulp.dest(destPath));
};


function cleanDist(callback) {
    del.sync('./dist');
    callback();
};

function copyAll() {
    var assetsPath = './dist/assets';

    return gulp
        .src([
            './src/assets/**/*',
        ])
        .pipe(gulp.dest(assetsPath));
};

const build = gulp.series(
    gulp.parallel(cleanDist, copyAll, html, scss, js, plugins, backend), // Adicionado 'backend' aqui
    gulp.parallel(scss, html, js, plugins)
);

const defaults = gulp.series(
    gulp.parallel(cleanDist, copyAll, html, scss, js, plugins, backend, copyLibs), // Adicionado 'backend' aqui
    gulp.parallel(startServer, browsersyncFn, watch, html, js, scss, plugins)
);

exports.startServer = startServer;
exports.browsersyncReload = browsersyncReload;
exports.browsersyncFn = browsersyncFn;
exports.plugins = plugins;
exports.js = js;
exports.scss = scss;
exports.html = html;
exports.cleanDist = cleanDist;
exports.copyAll = copyAll;
exports.backend = backend; // Adicionado 'backend' aqui

exports.watch = watch;

exports.build = build;
exports.default = defaults;
