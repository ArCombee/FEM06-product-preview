// CORE
import gulp from "gulp";
import { deleteSync } from "del";
import replace from "gulp-replace";
import concat from "gulp-concat";
import sourcemaps from "gulp-sourcemaps";
import modes from "gulp-mode";
const mode = modes({
  modes: ["production", "development"],
  default: "development",
  verbose: false,
});
// SERVER
import browserSync from "browser-sync";
const server = browserSync.create();
// HTML
import htmlmin from "gulp-htmlmin";
// IMAGES
import imagemin from "gulp-imagemin";
import newer from "gulp-newer";
// SVG
import svgo from "gulp-svgo";
// SASS CSS
import gulpsass from "gulp-sass";
import dartsass from "sass";
const sass = gulpsass(dartsass);
import autoprefixer from "autoprefixer";
import postcss from "gulp-postcss";
import cssnano from "cssnano";
import csscmq from "postcss-combine-media-query";
import csssort from "css-declaration-sorter";
import csspurge from "gulp-purgecss";
// JAVASCRIPT
import babel from "gulp-babel";
import terser from "gulp-terser";

// FUNCTIONS
function processSVG() {
  return gulp
    .src("src/images/*.svg")
    .pipe(
      svgo({
        plugins: [
          {
            cleanupAttrs: true,
          },
          {
            removeDoctype: true,
          },
          {
            removeXMLProcInst: true,
          },
          {
            removeComments: true,
          },
          {
            removeMetadata: true,
          },
          {
            removeTitle: true,
          },
          {
            removeDesc: true,
          },
          {
            removeUselessDefs: true,
          },
          {
            removeEditorsNSData: true,
          },
          {
            removeEmptyAttrs: true,
          },
          {
            removeHiddenElems: true,
          },
          {
            removeEmptyText: true,
          },
          {
            removeEmptyContainers: true,
          },
          {
            removeViewBox: false,
          },
          {
            cleanUpEnableBackground: true,
          },
          {
            convertStyleToAttrs: true,
          },
          {
            convertColors: true,
          },
          {
            convertPathData: true,
          },
          {
            convertTransform: true,
          },
          {
            removeUnknownsAndDefaults: true,
          },
          {
            removeNonInheritableGroupAttrs: true,
          },
          {
            removeUselessStrokeAndFill: true,
          },
          {
            removeUnusedNS: true,
          },
          {
            cleanupIDs: true,
          },
          {
            cleanupNumericValues: true,
          },
          {
            moveElemsAttrsToGroup: true,
          },
          {
            moveGroupAttrsToElems: true,
          },
          {
            collapseGroups: true,
          },
          {
            removeRasterImages: false,
          },
          {
            mergePaths: true,
          },
          {
            convertShapeToPath: true,
          },
          {
            sortAttrs: true,
          },
          {
            transformsWithOnePath: false,
          },
          {
            removeDimensions: true,
          },
          {
            removeAttrs: { attrs: "(stroke|fill)" },
          },
        ],
      })
    )
    .pipe(gulp.dest("public/assets/images"));
}
function processIMG() {
  return gulp
    .src("src/images/**/*")
    .pipe(newer("public/assets/images"))
    .pipe(mode.production(imagemin()))
    .pipe(gulp.dest("public/assets/images"));
}
function clearPublic(cb) {
  // del.sync("public");
  deleteSync("public");
  cb();
}
function processSASS(cb) {
  gulp
    .src("src/sass/main.scss")
    .pipe(mode.development(sourcemaps.init()))
    .pipe(sass({ outputStyle: "expanded" }).on("error", sass.logError))
    .pipe(
      mode.production(
        csspurge({
          content: ["src/pages/**/*"],
        })
      )
    )
    .pipe(postcss([autoprefixer(), csssort()]))
    .pipe(
      mode.production(
        postcss([
          csscmq,
          cssnano({
            preset: ["default"],
          }),
        ])
      )
    )
    .pipe(mode.development(sourcemaps.write()))
    .pipe(gulp.dest("public/assets/styles"));
  cb();
}
function processJS(cb) {
  gulp
    .src("src/javascript/app.js")
    .pipe(mode.development(sourcemaps.init()))
    .pipe(concat("app.js"))
    .pipe(
      babel({
        presets: ["@babel/env"],
      })
    )
    .pipe(
      mode.production(
        terser({
          mangle: {
            toplevel: true,
          },
          compress: {
            dead_code: true,
          },
        })
      )
    )
    .pipe(mode.development(sourcemaps.write()))
    .pipe(gulp.dest("public/assets/scripts"));
  cb();
}
function processHTML(cb) {
  const min = 1000000000;
  const max = 100000000000000;
  const buster = Math.floor(Math.random() * (max - min + 1)) + min;
  gulp
    .src("src/pages/**/*.html")
    .pipe(replace(/cachebust=\d+/g, `cb=${buster}`))
    .pipe(
      mode.production(
        htmlmin({
          collapseWhitespace: true,
        })
      )
    )
    .pipe(gulp.dest("public"));
  cb();
}
function serve(cb) {
  server.init({
    server: {
      baseDir: "public",
    },
    port: 5500,
    open: true,
    notify: true,
  });
  cb();
}
function serveReload(cb) {
  server.reload();
  cb();
}
function watcher(cb) {
  gulp.watch("src/pages/**/*.html", gulp.series(processHTML, serveReload));
  gulp.watch("src/sass/**/*.scss", gulp.series(processSASS, serveReload));
  gulp.watch("src/javascript/**/*.js", gulp.series(processJS, serveReload));
  gulp.watch("src/images/**/*.*", gulp.series(processIMG, serveReload));
  cb();
}
// EXPORT FUNCIONS
export const build = gulp.series(
  clearPublic,
  gulp.parallel(processHTML, processIMG, processJS, processSASS, processSVG)
);
export const dev = gulp.series(
  clearPublic,
  gulp.parallel(processHTML, processIMG, processJS, processSASS, processSVG),
  serve,
  watcher
);
export const scss = gulp.series(processSASS, watcher);
export const srv = serve;
export const svg = processSVG;
export default dev;
