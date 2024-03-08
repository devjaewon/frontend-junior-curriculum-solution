import { join } from 'path'
import Webpack from 'webpack';
import WebpackDevServer from 'webpack-dev-server';
import HtmlWebpackPlugin from 'html-webpack-plugin';

runServer();

async function runServer() {
  const compiler = Webpack(createWebpackOption());
  const server = new WebpackDevServer(createWebpackDevServerOption(), compiler);

  await server.start();
}

function createWebpackOption() {
  const __dirname = process.cwd();
  
  return {
    mode: 'development',
    entry: join(__dirname, 'src', 'bootstrap.ts'),
    output: {
      path: join(__dirname, 'build'),
      filename: 'bootstrap.bundle.js',
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          exclude: /node_modules/,
          use: [
            {
              loader: 'ts-loader',
              options: {
                configFile: join(__dirname, 'tsconfig.json'),
              }
            }
          ]
        },
      ],
    },
    resolve: {
      extensions: ['.ts', '.js'],
    },
    plugins: [new HtmlWebpackPlugin({
      templateContent: createHtmlTemplate(),
    })],
  }
}

function createWebpackDevServerOption() {
  return {
    open: true,
  }
}

function createHtmlTemplate() {
  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Chapter2</title>
</head>
<body>
  <div id="app"></div>
</body>
</html>`;
}