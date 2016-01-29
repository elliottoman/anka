module.exports = function (grunt) {
    'use strict';
    require('time-grunt')(grunt);
    require('load-grunt-tasks')(grunt);
    grunt.loadNpmTasks('thmaa');
    grunt.initConfig({
        mozuconfig: grunt.file.exists('./mozu.config.json') ? grunt.file.readJSON('./mozu.config.json') : {},
        pkg: grunt.file.readJSON('./package.json'),
        jsonlint: {
            'theme_json': {
                'src': [
                    '**/*.json',
                    '*.json',
                    '!node_modules/**',
                    '!references/**'
                ]
            }
        },
        jshint: {
            'theme_js': [
                'Gruntfile.js',
                'scripts/**/*.js'
            ],
            'options': {
                'ignores': ['scripts/vendor/**/*.js'],
                'undef': true,
                'laxcomma': true,
                'unused': false,
                'globals': {
                    'console': true,
                    'window': true,
                    'document': true,
                    'setTimeout': true,
                    'clearTimeout': true,
                    'module': true,
                    'define': true,
                    'require': true,
                    'Modernizr': true,
                    'process': true
                }
            }
        },
        compress: {
            'build': {
                'options': {
                    'archive': '<%= pkg.name %>-<%= pkg.version %>.zip',
                    'pretty': true
                },
                'files': [{
                        'src': [
                            '**',
                            '!node_modules/**',
                            '!references/**',
                            '!tasks/**',
                            '!configure.js',
                            '!Gruntfile.js',
                            '!mozu.config.json',
                            '!*.zip'
                        ],
                        'dest': '/'
                    }]
            }
        },
        mozusync: {
            'options': {
                'applicationKey': '<%= mozuconfig.workingApplicationKey %>',
                'context': '<%= mozuconfig %>',
                'watchAdapters': [
                    {
                        'src': 'mozusync.upload.src',
                        'action': 'upload'
                    },
                    {
                        'src': 'mozusync.del.remove',
                        'action': 'delete'
                    }
                ]
            },
            'upload': {
                'options': {
                    'action': 'upload',
                    'noclobber': true
                },
                'src': [
                    'admin/**/*',
                    'compiled/**/*',
                    'labels/**/*',
                    'resources/**/*',
                    'scripts/**/*',
                    'stylesheets/**/*',
                    'templates/**/*',
                    'theme.json',
                    '*thumb.png',
                    '*thumb.jpg',
                    'theme-ui.json',
                    '!*.orig',
                    '!.inherited'
                ],
                'filter': 'isFile'
            },
            'del': {
                'options': { 'action': 'delete' },
                'src': '<%= mozusync.upload.src %>',
                'filter': 'isFile',
                'remove': []
            },
            'wipe': {
                'options': { 'action': 'deleteAll' },
                'src': '<%= mozusync.upload.src %>'
            }
        },
        mozutheme: {
            'check': {},
            'update': { 'versionRange': '<%= pkg.config.baseThemeVersion %>' },
            'compile': {},
            'quickcompile': {
                'command': 'compile',
                'opts': { 'skipminification': true }
            }
        },
        watch: {
            'options': { 'spawn': false },
            'json': {
                'files': '<%= jsonlint.theme_json.src %>',
                'tasks': ['jsonlint']
            },
            'javascript': {
                'files': '<%= jshint.theme_js %>',
                'tasks': [
                    'jshint',
                    'mozutheme:quickcompile'
                ]
            },
            'sync': {
                'files': '<%= mozusync.upload.src %>',
                'tasks': ['mozusync:upload']
            }
        }
    });
    grunt.registerTask('default', [
        'jsonlint',
        'jshint',
        'mozutheme:check',
        'mozutheme:quickcompile',
        'mozusync:upload'
    ]);
    grunt.registerTask('reset', [
        'mozusync:wipe',
        'mozusync:upload'
    ]);
    grunt.registerTask('release', [
        'jsonlint',
        'jshint',
        'mozutheme:check',
        'mozutheme:compile',
        'compress'
    ]);
};