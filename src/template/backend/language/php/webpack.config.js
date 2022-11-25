{{PROJECT.CONFIGMODE}}const CopyWebpackPlugin = require('copy-webpack-plugin');

{{PROJECT.INDENTATION}}const invertedMode = process.env.NODE_ENV === 'prod' ? 'dev' : 'prod';
{{PROJECT.INDENTATION}}module.exports = {
{{PROJECT.INDENTATION}}  plugins: [
{{PROJECT.INDENTATION}}    new CopyWebpackPlugin({
{{PROJECT.INDENTATION}}      patterns: [{
{{PROJECT.INDENTATION}}        from: '../{{PROJECT.BACKENDFOLDER}}',
{{PROJECT.INDENTATION}}        to: './{{PROJECT.BACKENDFOLDER}}',
{{PROJECT.INDENTATION}}        globOptions: {
{{PROJECT.INDENTATION}}          ignore: ['**/config.default.php', `**/config.${invertedMode}.php`, '**/README.md'],
{{PROJECT.INDENTATION}}        },
{{PROJECT.INDENTATION}}      }],
{{PROJECT.INDENTATION}}    }),
{{PROJECT.INDENTATION}}  ],
{{PROJECT.INDENTATION}}}{{PROJECT.CONFIGMODEEND}}
