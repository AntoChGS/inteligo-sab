"use strict";

// Initialize modules
const { src, dest, watch, series, parallel, task } = require('gulp');
const autoprefixer = require('autoprefixer');
const browserSync = require('browser-sync').create();
const cssmqpacker = require('css-mqpacker');
const changed = require('gulp-changed');
const cheerio = require('gulp-cheerio');
const cleanCSS = require('gulp-clean-css');
const include = require('gulp-include');
const notify = require('gulp-notify');
const plumber = require('gulp-plumber');
const postcss = require('gulp-postcss');
const pug = require('gulp-pug');
const reload = browserSync.reload;
const rename = require('gulp-rename');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const svgmin = require('gulp-svgmin');
const svgstore = require('gulp-svgstore');
const tinypng = require('gulp-tinypng-compress');
const uglify = require('gulp-uglify');
const wait = require('gulp-wait');

// Directory
var directory = {
    source: 'src',
    dest: 'html'
}

// File path variables
var files = {
    html: {
        views: [directory.source + '/pug/views/**/*.pug'],
        structure: [directory.source + '/pug/structure/**/*.pug'],
        includes: [directory.source + '/pug/includes/**/*.pug'],
        change: [directory.dest + '/*.html'],
        dest: directory.dest
    },
    cssPath: {
        scss: [directory.source + '/scss/*.scss'],
        allScss: [directory.source + '/scss/**/*.scss'],
        dest: directory.dest + '/css/'
    },
    jsPath: {
        js: [directory.source + '/js/*.js'],
        mainJS: [directory.source + '/js/main.js'],
        dest: directory.dest + '/js/'
    },
    fontsPath: {
        all: [directory.source + '/fonts/**/*.*'],
        dest: directory.dest + '/fonts/'
    },
    imgPath: {
        images: [directory.source + '/images/**/*.{jpg,png,webp}'],
        icons: [directory.source + '/images/icons/*.svg'],
        svgs: [directory.source + '/images/**/*.svg', '!' + directory.source + '/images/icons/*.svg'],
        dest: directory.dest + '/images/',
        destIcons: directory.dest + '/images/icons/',
        change: [directory.dest + '/images/**/*']
    }
}

// Server
function browser_sync(){
    browserSync.init({
        server: {
            baseDir: directory.dest
        }
    });
}

// Pug
function views(){
    return src(files.html.views)
        .pipe(plumber({
            errorHandler:
                notify.onError('Error: <%= error.message %>'),
            sound: false
        }))
        .pipe(changed(files.html.dest, { extension: '.html' }))
        .pipe(pug({ pretty: '    ' }))
        .pipe(dest(files.html.dest))
        .pipe(notify({
            message: '<%= file.relative %> completed.',
            sound: false,
            onLast: true
        }));
}

function allPug(){
    return src(files.html.views)
        .pipe(plumber({
            errorHandler:
                notify.onError('Error: <%= error.message %>'),
            sound: false
        }))
        .pipe(pug({ pretty: '    ' }))
        .pipe(dest(files.html.dest))
        .pipe(reload({ stream: true }))
        .pipe(notify({
            message: 'Site updated.',
            sound: false,
            onLast: true
        }));
}

// Scss task
function scssTask(){
    var plugins = [
        autoprefixer(),
        cssmqpacker({
            sort: true
        })
    ];
    return src(files.cssPath.scss)
        .pipe(wait(500))
        .pipe(plumber({
            errorHandler:
                notify.onError('Error: <%= error.message %>'),
            sound: false
        }))
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(postcss(plugins))
        .pipe(cleanCSS())
        .pipe(sourcemaps.write('.'))
        .pipe(dest(files.cssPath.dest))
        .pipe(reload({ stream: true }))
        .pipe(notify({
            message: 'CSS completed.',
            sound: false,
            onLast: true
        }));
}

// JS task
function jsTask(){
    return src(files.jsPath.js)
        .pipe(plumber({
            errorHandler:
                notify.onError('Error: <%= error.message %>'),
            sound: false
        }))
        .pipe(sourcemaps.init())
        .pipe(include({
            extensions: 'js',
            hardFail: true,
            includePaths: [
                __dirname + '/node_modules'
            ]
        }))
        .pipe(uglify())
        .pipe(sourcemaps.write('.'))
        .pipe(dest(files.jsPath.dest))
        .pipe(browserSync.reload({ stream: true }))
        .pipe(notify({
            message: 'JS completed.',
            sound: false,
            onLast: true
        }));
}

// Fonts task
function fontsTask(){
    return src(files.fontsPath.all)
        .pipe(dest(files.fontsPath.dest))
        .pipe(notify({
            message: 'Fonts ready.',
            sound: false,
            onLast: true
        }));
};

// Image task
function imgTask(){
    return src(files.imgPath.images)
        .pipe(tinypng({
            key: 'Z21qZlD7lr4MRVkieMTG4iptHj5Qahjr',
            sigFile: 'src/images/.tinypng-sigs',
            log: true,
            summarise: true
        }))
        .pipe(dest(files.imgPath.dest))
        .pipe(notify({
            message: 'Images completed.',
            sound: false,
            onLast: true
        }));
}

// SVGs
function svgsTask(){
    return src(files.imgPath.svgs)
        .pipe(svgmin(function (file) {
            return {
                plugins: [{
                    removeComments: true
                }]
            }
        }))
        .pipe(cheerio({
            run: function ($) {
                if ($('[viewBox]').length == 0) {
                    let width = $('svg').attr('width');
                    let height = $('svg').attr('height');
                    let viewBox = '0 0 ' + width + ' ' + height;
                    $('svg').attr('viewBox', viewBox);
                } else if ($('[viewBox]').length && $('[width]').length == 0 && $('[height]').length == 0) {
                    let viewBox = $('svg').attr('viewBox');
                    let splitViewBox = viewBox.split(' ');
                    $('svg').attr('width', splitViewBox[2]);
                    $('svg').attr('height', splitViewBox[3]);
                }
            },
            parserOptions: { xmlMode: true }
        }))
        .pipe(dest(files.imgPath.dest))
        .pipe(notify({
            message: 'Svgs completed.',
            sound: false,
            onLast: true
        }));
}

// Icons task
function iconsTask(){
    return src(files.imgPath.icons)
        .pipe(svgmin(function (file) {
            return {
                plugins: [{
                    removeDoctype: true
                }, {
                    removeComments: true
                }]
            }
        }))
        .pipe(cheerio({
            run: function ($) {
                $('[fill]').removeAttr('fill');
                if ($('[viewBox]').length == 0) {
                    let width = $('svg').attr('width');
                    let height = $('svg').attr('height');
                    let viewBox = '0 0 ' + width + ' ' + height;
                    $('svg').attr('viewBox', viewBox);
                } else if ($('[viewBox]').length && $(['width']).length == 0 && $(['height']).length == 0) {
                    let viewBox = $('svg').attr('viewBox');
                    let splitViewBox = viewBox.split(' ');
                    $('svg').attr('width', splitViewBox[2]);
                    $('svg').attr('height', splitViewBox[3]);
                }
            },
            parserOptions: { xmlMode: true }
        }))
        .pipe(svgstore())
        .pipe(rename('icons.svg'))
        .pipe(dest(files.imgPath.destIcons))
        .pipe(notify({
            message: 'Icons compiled.',
            sound: false,
            onLast: true
        }));
}

// Watch task
function watchTask(){
    watch(files.html.views, views);
    watch(files.html.structure, series(allPug));
    watch(files.html.includes, series(allPug));
    watch(files.cssPath.allScss, series(scssTask));
    watch(files.jsPath.js, series(jsTask));
    watch(files.html.change).on('change', reload);
    watch(files.imgPath.change).on('change', reload);
}

// Default task
task("fonts", parallel(fontsTask))
task("images", parallel(imgTask))
task("svgs", parallel(svgsTask))
task("icons", parallel(iconsTask))
task("default", parallel(watchTask, browser_sync))