const promisify = require('util').promisify;
const fs = require('fs');
const path = require('path');
const Handlebars = require('handlebars');
const stat = promisify(fs.stat);
const readdir = promisify(fs.readdir);
const mime = require('./mime');
const compress = require('./compress');
const range = require('./range');
const isFresh = require('./cache');

const tplPath = path.join(__dirname, '../template/dir.tpl');
const source = fs.readFileSync(tplPath);
const template = Handlebars.compile(source.toString());

module.exports = async (req, res, filePath, config) => {
  try {
    const stats = await stat(filePath);
    if (stats.isFile()) {
      const contentType = mime(filePath);
      res.setHeader('Content-Type', contentType);

      if (isFresh(stats, req, res)) {
        res.statusCode = 304;
        res.end();
        return;    
      }

      let rs;
      const {code, start, end} = range(stats.size, req, res);
      if (code === 200) {
        res.statusCode = 200;
        rs = fs.createReadStream(filePath);
      } else {
        res.statusCode = 206;
        rs = fs.createReadStream(filePath, {start, end});
      }
      if (filePath.match(config.compress)) {
        rs = compress(rs, req, res);
      };
      rs.pipe(res);
    } else if (stats.isDirectory()) {
      const files = await readdir(filePath);
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/html');
      // path.relative 一个路径相对另一个路径的地址
      const dir = path.relative(config.root, filePath);
      const data = {
        files: files.map((file) => {
          return {
            file,
            icon: mime(file)
          }
        }),
        dir: dir ? `/${dir}` : '',
        title: path.basename(filePath)
      }
      res.end(template(data));
    }
  } catch(e) {
      res.statusCode = 404,
      res.setHeader('Content-Type', 'text/plain;charset=utf-8');
      res.end(`${filePath} is not a directory or file\n ${e.toString()}`);
  }
}