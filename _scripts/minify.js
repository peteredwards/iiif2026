/**
 * Minifies javascript using UglifyJS and compiles CSS from SCSS
 */
const fs = require('fs');
const path = require('path');
const UglifyJS = require("uglify-js");
const sass = require('sass');

const minified_js = path.resolve( __dirname, '../assets/js/script.min.js' );
const minified_css = path.resolve( __dirname, '../assets/css/style.min.css' );
const jsdir = '../_includes/scripts/';

result = sass.compile( path.resolve( __dirname, '../_scss/maps.scss' ), {style: "compressed"} );
fs.writeFileSync( minified_css, result.css );

fs.writeFileSync( minified_js, UglifyJS.minify({
    "leaflet.fullscreen.js": fs.readFileSync( path.resolve( __dirname, jsdir, 'leaflet.fullscreen.js' ), "utf8" ),
    "utilities.js": fs.readFileSync( path.resolve( __dirname, jsdir, 'utilities.js' ), "utf8" ),
    "maps.js": fs.readFileSync( path.resolve( __dirname, jsdir, 'maps.js' ), "utf8" ),
    "features.js": fs.readFileSync( path.resolve( __dirname, jsdir, 'features.js' ), "utf8" ),
}, { toplevel: false }).code, "utf8" );
