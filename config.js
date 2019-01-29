'use strict';

const devBuild =
  (process.env.NODE_ENV || 'development').trim().toLowerCase() ===
  'development';

const path = {
  build: 'build/',
  src: 'src/',
  tmp: 'tmp/',
  templates: {
    get src() {
      return `${path.src}templates/*.pug`;
    },
    get includes() {
      return `${path.src}templates/includes`;
    }
  },
  styles: {
    get src() {
      return `${path.src}styles/*.scss`;
    },
    get build() {
      return `${path.tmp}styles/`;
    }
  },
  images: {
    get src() {
      return `${path.src}assets/images/**/*.*`;
    },
    get build() {
      return `${path.build}assets/images/`;
    }
  }
};

module.exports = { devBuild, path };
