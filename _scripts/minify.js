/**
 * Minifies javascript using UglifyJS and compiles CSS from SCSS
 */
const fs = require('fs');
const path = require('path');
const UglifyJS = require("uglify-js");
const sass = require('sass');

const compiled_js = path.resolve( __dirname, '../assets/js/maps.js' );
const minified_js = path.resolve( __dirname, '../assets/js/maps.min.js' );
const compiled_css = path.resolve( __dirname, '../assets/css/maps.css' );
const minified_css = path.resolve( __dirname, '../assets/css/maps.min.css' );
const jsdir = '../_includes/scripts/';

var result = sass.compile( path.resolve( __dirname, '../_scss/maps.scss' ) );
fs.writeFileSync( compiled_css, result.css );
result = sass.compile( path.resolve( __dirname, '../_scss/maps.scss' ), {style: "compressed"} );
fs.writeFileSync( minified_css, result.css );

fs.writeFileSync( compiled_js, '');
for ( const file of [ 'leaflet.fullscreen.js', 'utilities.js', 'maps.js', 'features.js' ] ) {
    fs.appendFileSync( compiled_js, fs.readFileSync( path.resolve( __dirname, jsdir, file ), "utf8" ) );
}
fs.writeFileSync( minified_js, UglifyJS.minify({
    "leaflet.fullscreen.js": fs.readFileSync( path.resolve( __dirname, jsdir, 'leaflet.fullscreen.js' ), "utf8" ),
    "utilities.js": fs.readFileSync( path.resolve( __dirname, jsdir, 'utilities.js' ), "utf8" ),
    "maps.js": fs.readFileSync( path.resolve( __dirname, jsdir, 'maps.js' ), "utf8" ),
    "features.js": fs.readFileSync( path.resolve( __dirname, jsdir, 'features.js' ), "utf8" ),
}, { toplevel: false }).code, "utf8" );
