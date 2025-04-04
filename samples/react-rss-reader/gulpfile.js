'use strict';

const gulp = require('gulp');
const path = require('path');
const build = require('@microsoft/sp-build-web');
const bundleAnalyzer = require('webpack-bundle-analyzer');

build.addSuppression(`Warning - [sass] The local CSS class 'ms-Grid' is not camelCase and will not be type-safe.`);


/********************************************************************************************
 * Adds an alias for handlebars in order to avoid errors while gulping the project
 * https://github.com/wycats/handlebars.js/issues/1174
 * Adds a loader and a node setting for webpacking the handlebars-helpers correctly
 * https://github.com/helpers/handlebars-helpers/issues/263
 ********************************************************************************************/
build.configureWebpack.mergeConfig({
  additionalConfiguration: (generatedConfiguration) => {
    generatedConfiguration.resolve.fallback = {
      fs: false, // Use "false" as fs cannot be polyfilled for browser environments
      stream: require.resolve('stream-browserify'),
      timers: require.resolve('timers-browserify'),
      readline: false 
    };

    generatedConfiguration.resolve.alias = {
      handlebars: 'handlebars/dist/handlebars.min.js'
    };

    generatedConfiguration.module.rules.push({
      test: /utils\.js$/,
      loader: 'unlazy-loader',
      include: [/node_modules/]
    });

    const lastDirName = path.basename(__dirname);
    const dropPath = path.join(__dirname, 'temp', 'stats');
    generatedConfiguration.plugins.push(new bundleAnalyzer.BundleAnalyzerPlugin({
      openAnalyzer: false,
      analyzerMode: 'static',
      reportFilename: path.join(dropPath, `${lastDirName}.stats.html`),
      generateStatsFile: true,
      statsFilename: path.join(dropPath, `${lastDirName}.stats.json`),
      logLevel: 'error'
    }));

    return generatedConfiguration;
  }
});



var getTasks = build.rig.getTasks;
build.rig.getTasks = function () {
  var result = getTasks.call(build.rig);

  result.set('serve', result.get('serve-deprecated'));

  return result;
};

// build.tslintCmd.enabled = false;

build.initialize(gulp);
