const gulp = require('gulp')
del = require('del')
webpack = require('webpack-stream')
pug = require('gulp-pug')
plumber = require('gulp-plumber')
cached = require('gulp-cached')
cache = require('gulp-cache')
imagemin = require('gulp-imagemin')
imgCompress = require('imagemin-jpeg-recompress')
sourcemaps = require('gulp-sourcemaps')
scss = require('gulp-sass')
autoprefixer = require('gulp-autoprefixer')
rename = require('gulp-rename')
csso = require('gulp-csso')
browserSync = require('browser-sync').create();

const
    path = {
        scripts: {
            'input': './dev/js/',
            'output': './build/js/'
        },
        pug: {
            'input': './dev/pug/*.pug',
            'output': './build/'
        },
        img: {
            'input': './dev/img/**/*.{png,jpg,gif,svg,ico.webp}',
            'output': './build/img/'
        },
        scss: {
            'input': './dev/scss/',
            'output': './build/css/'
        },
        fonts: {
            'input': './dev/fonts/**/*.*',
            'output': './build/fonts/'
        }
    };

// Gulp Clean Task
gulp.task('clean', () => {
    return del('./build')
});

// Gulp Scripts Task
gulp.task('js', () => {
    return gulp.src(path.scripts.input + 'all.js')
        .pipe(webpack({
            output: {
                filename: 'all.min.js'
            },
            module: {
                rules: [{
                    test: /\.js$/,
                    loader: 'babel-loader',
                    exclude: '/node_modules/',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }]
            },
            mode: 'development',
            devtool: 'eval-source-map'
        }))
        .pipe(gulp.dest(path.scripts.output))
        .pipe(browserSync.reload({
            stream: true
        }));
});
gulp.task('js:min', () => {
    return gulp.src(path.scripts.input + 'all.js')
        .pipe(webpack({
            output: {
                filename: 'all.min.js'
            },
            module: {
                rules: [{
                    test: /\.js$/,
                    loader: 'babel-loader',
                    exclude: '/node_modules/',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }]
            },
            mode: 'production',
            devtool: 'none'
        }))
        .pipe(gulp.dest(path.scripts.output));
});

// Gulp PUG Task
gulp.task('pug', () => {
    return gulp.src(path.pug.input)
        .pipe(plumber())
        .pipe(pug({
            pretty: true
        }))
        .pipe(plumber.stop())
        .pipe(cached('pug'))
        .pipe(gulp.dest(path.pug.output))
        .on('end', browserSync.reload)
});

// Gulp Imagemin Task
gulp.task('img:dev', () => {
    return gulp.src(path.img.input)
        .pipe(gulp.dest(path.img.output));
});

gulp.task('img:build', () => {
    return gulp.src(path.img.input)
        .pipe(cache(imagemin([
            imgCompress({
                loops: 4,
                min: 70,
                max: 80,
                quality: 'high'
            }),
            imagemin.gifsicle(),
            imagemin.optipng(),
            imagemin.svgo()
        ])))
        .pipe(gulp.dest(path.img.output))
});

// Gulp Styles Task
gulp.task('styles:dev', () => {
    return gulp.src(path.scss.input + 'main.scss')
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(scss())
        .pipe(autoprefixer({
            overrideBrowserlist: ['last 3 versions']
        }))
        .pipe(sourcemaps.write())
        .pipe(rename('main.min.css'))
        .pipe(gulp.dest(path.scss.output))
        .on('end', browserSync.reload);
});

gulp.task('styles:build', () => {
    return gulp.src(path.scss.input + 'main.scss')
        .pipe(scss())
        .pipe(autoprefixer({
            overrideBrowserlist: ['last 3 versions']
        }))
        .pipe(rename('main.min.css'))
        .pipe(gulp.dest(path.scss.output))
});

gulp.task('styles:build-min', () => {
    return gulp.src(path.scss.input + 'main.scss')
        .pipe(scss())
        .pipe(autoprefixer({
            overrideBrowserlist: ['last 3 versions']
        }))
        .pipe(csso())
        .pipe(rename('main.min.css'))
        .pipe(gulp.dest(path.scss.output))
});

// Gulp Fonts Task
gulp.task('fonts', () => {
    return gulp.src(path.fonts.input)
        .pipe(gulp.dest(path.fonts.output));
});

// Gulp Local Server Task 
gulp.task('serve', () => {
    browserSync.init({
        server: {
            baseDir: './build/'
        },
        notify: false
    });
});

// Gulp Watch Task
gulp.task('watch', () => {
    gulp.watch('./dev/pug/**/*.pug', gulp.series('pug'));
    gulp.watch('./dev/scss/**/*.scss', gulp.series('styles:dev'));
    gulp.watch('./dev/img/**/*.{png,jpg,gif,svg,ico,webp}', gulp.series('img:dev'));
    gulp.watch('./dev/js/**/*.js', gulp.series('js'));
});

// Gulp Dev Task
gulp.task('dev', gulp.series(
    'clean',
    gulp.parallel(
        'pug',
        'fonts',
        'styles:dev',
        'img:dev',
        'js'
    )
));

// Gulp Build Task
gulp.task('build', gulp.series(
    'clean',
    gulp.parallel(
        'pug',
        'fonts',
        'styles:build',
        'img:build',
        'js'
    )
));

// Gulp Build-Min Task
gulp.task('build-min', gulp.series(
    'clean',
    gulp.parallel(
        'pug',
        'fonts',
        'styles:build-min',
        'img:build',
        'js:min'
    )
));

// Gulp Default Task
gulp.task('default', gulp.series(
    'dev',
    gulp.parallel(
        'watch',
        'serve'
    )
));