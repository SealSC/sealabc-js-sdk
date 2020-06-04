module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    browserify: {
      sdk: {
        files: {
          'dist/sealabc-js-sdk.js': [ 'src/sdk.js' ]
        },

        options: {
          transform: [["babelify"]],
          browserifyOptions: {
            standalone: 'seal-abc-sdk'
          }
        }
      },
    },
    uglify: {
      options: {
        sourceMap: true
      },
      sdk: {
        files:{
          'dist/sealabc-js-sdk.min.js': [ 'dist/sealabc-js-sdk.js' ],
        }
      },
    }
  });

  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-uglify-es');

  grunt.registerTask('build-no-min', ['browserify']);
  grunt.registerTask('build', ['browserify', 'uglify']);
};
