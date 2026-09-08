'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const ROOT = __dirname;
const PORT = Number(process.env.PORT || 3000);
const HOST = '0.0.0.0';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml; charset=utf-8',
  '.ico': 'image/x-icon',
  '.json': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
};

function securityHeaders(res) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'same-origin');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
}

function send(res, status, body, type = 'text/plain; charset=utf-8') {
  res.statusCode = status;
  res.setHeader('Content-Type', type);
  res.setHeader('Content-Length', Buffer.byteLength(body));
  securityHeaders(res);
  res.end(body);
}

function serveFile(req, res, filePath, cacheControl) {
  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) return send(res, 404, 'Not found');

    const ext = path.extname(filePath).toLowerCase();
    res.statusCode = 200;
    res.setHeader('Content-Type', MIME[ext] || 'application/octet-stream');
    res.setHeader('Cache-Control', cacheControl);
    res.setHeader('Last-Modified', stat.mtime.toUTCString());
    securityHeaders(res);

    if (req.method === 'HEAD') return res.end();

    // Only compress text-like payloads. WebP is already compressed.
    const canGzip = ext === '.html' || ext === '.json' || ext === '.txt' || ext === '.svg';
    const acceptsGzip = /\bgzip\b/.test(req.headers['accept-encoding'] || '');
    const stream = fs.createReadStream(filePath);

    stream.on('error', () => {
      if (!res.headersSent) send(res, 500, 'Server error');
      else res.destroy();
    });

    if (canGzip && acceptsGzip) {
      res.setHeader('Content-Encoding', 'gzip');
      res.setHeader('Vary', 'Accept-Encoding');
      stream.pipe(zlib.createGzip({ level: 6 })).pipe(res);
    } else {
      res.setHeader('Content-Length', stat.size);
      stream.pipe(res);
    }
  });
}

const server = http.createServer((req, res) => {
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  } catch {
    return send(res, 400, 'Bad request');
  }

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');
    return send(res, 405, 'Method not allowed');
  }

  if (pathname === '/healthz') {
    return send(res, 200, JSON.stringify({ status: 'ok', version: '14.6' }), 'application/json; charset=utf-8');
  }

  if (pathname === '/' || pathname === '/index.html') {
    return serveFile(req, res, path.join(ROOT, 'index.html'), 'no-cache');
  }

  if (pathname.startsWith('/assets/')) {
    const relative = pathname.slice(1);
    const target = path.resolve(ROOT, relative);
    const assetsRoot = path.resolve(ROOT, 'assets') + path.sep;
    if (!target.startsWith(assetsRoot)) return send(res, 403, 'Forbidden');
    return serveFile(req, res, target, 'public, max-age=3600');
  }

  return send(res, 404, 'Not found');
});

server.listen(PORT, HOST, () => {
  console.log(`KORRUPTSIYA v14.6 listening on http://${HOST}:${PORT}`);
});

function shutdown(signal) {
  console.log(`${signal} received, shutting down`);
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 10000).unref();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
