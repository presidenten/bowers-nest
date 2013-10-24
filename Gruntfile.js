module.exports = function ( grunt ) {
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jshint: {
            all: [
                'Gruntfile.js',
                'bowers-nest.js',
                'server.js'
            ],
            options: {
                jshintrc: '.jshintrc'
            }
        },
        jasmine_node: {
            projectRoot: 'coverage',
            src: 'server.js',
            spec: 'server.spec.js',
            requirejs: false,
            forceExit: true
        }
    });

    grunt.registerTask('test', ['jshint', 'jasmine_node']);
    grunt.registerTask('default', ['test']);
};