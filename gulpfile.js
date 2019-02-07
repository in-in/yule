'use strict';

const { devBuild, path } = require('./config.js');

const { src, dest, series, parallel, watch } = require('gulp');
const bs = require('browser-sync').create();
const csso = require('postcss-csso');
const del = require('del');
const imagemin = require('gulp-imagemin');
const mjml = require('gulp-mjml');
const mjmlEngine = require('mjml');
const mqExtract = require('postcss-mq-extract');
const mqPacker = require('css-mqpacker');
const notify = require('gulp-notify');
const plumber = require('gulp-plumber');
const postcss = require('gulp-postcss');
const pug = require('gulp-pug');
const sass = require('gulp-sass');

const onError = notify.onError(function(err) {
  return {
    title: err.plugin.toUpperCase(),
    message: err.message
  };
});

const clean = () => del([path.build, path.tmp]);

const serve = done => {
  bs.init({
    https: true,
    notify: false,
    open: false,
    reloadOnRestart: true,
    server: path.build,
    ui: false
  });
  done();
};

const reload = done => {
  bs.reload();
  done();
};

const template = () =>
  src(path.templates.src)
    .pipe(plumber({ errorHandler: onError }))
    .pipe(
      pug({
        basedir: path.components,
        pretty: devBuild,
        data: {
          devBuild: devBuild
        }
      })
    )
    .pipe(
      mjml(mjmlEngine, {
        minify: !devBuild,
        beautify: devBuild,
        validationLevel: 'strict'
      })
    )
    .pipe(dest(path.build));

const plugins = [
  ...(devBuild
    ? []
    : [
        csso({
          forceMediaMerge: true
        })
      ]),
  mqPacker({
    sort: true
  }),
  mqExtract({
    dest: path.styles.build,
    match: '(min-width:)',
    postfix: '_mq'
  })
];

const styles = () =>
  src(path.styles.src)
    .pipe(plumber({ errorHandler: onError }))
    .pipe(
      sass({
        outputStyle: 'expanded',
        includePaths: path.components
      })
    )
    .pipe(postcss(plugins))
    .pipe(dest(path.styles.build));

const images = () =>
  src(path.images.src)
    .pipe(imagemin())
    .pipe(dest(path.images.build));

const watcher = () => {
  watch(
    path.src,
    { ignored: path.images.src },
    series(styles, template, reload)
  );
  watch(path.images.src, series(images, reload));
};

if (devBuild) {
  exports.default = series(
    clean,
    styles,
    parallel(template, images),
    parallel(serve, watcher)
  );
} else {
  exports.default = series(clean, styles, parallel(template, images));
}
