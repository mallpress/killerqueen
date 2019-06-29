var gulp = require('gulp');
var browserify = require('browserify');
var tsify = require('tsify');
var babelify = require('babelify');
var source = require('vinyl-source-stream');
var fs = require('fs');
var path = require('path');
const { promisify } = require('util');


gulp.task('default', function () {
    var extensions = ['.js', '.ts', '.json'];
    let b = browserify({
            extensions: extensions,
            standalone: 'Reindeer',
            debug: false
        })
        .plugin('tsify', {
            target: 'es6'
        })
        .transform(babelify.configure({
            extensions: extensions
        }));

    b = b.transform('uglifyify', {
        global: true
    });

    b = b.add(path.join('src', 'index.ts'))
        .bundle();
    return b.on('error', (e) => {
            console.log('Gulp Err => ' + e);
        })
        .pipe(source('index.js'))
        .pipe(gulp.dest(path.join('build')));
});
