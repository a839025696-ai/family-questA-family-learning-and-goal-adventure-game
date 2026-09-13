import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const portArg = process.argv.indexOf('--port');
const port = portArg >= 0 ? Number(process.argv[portArg + 1]) : 4173;
const root = process.cwd();
const types = {'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.png':'image/png','.svg':'image/svg+xml'};

http.createServer(async (request, response) => {
  try {
    const pathname = new URL(request.url, 'http://local').pathname;
    let path = normalize(join(root, pathname === '/' ? 'index.html' : pathname));
    if (!path.startsWith(root)) throw new Error('Invalid path');
    if ((await stat(path)).isDirectory()) path = join(path, 'index.html');
    response.setHeader('Content-Type', types[extname(path)] || 'application/octet-stream');
    response.end(await readFile(path));
  } catch {
    response.statusCode = 404;
    response.end('Not found');
  }
}).listen(port, '0.0.0.0');
