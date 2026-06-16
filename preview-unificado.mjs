import { createReadStream, existsSync, statSync } from "node:fs";
import { extname, join, normalize } from "node:path";
import { createServer } from "node:http";

const DIST_DIR = join(process.cwd(), "dist");
const PORT = Number(process.env.PORT || 4173);
const HOST = process.env.HOST || "0.0.0.0";

const MIME_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".gif": "image/gif",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".ttf": "font/ttf",
  ".txt": "text/plain; charset=utf-8",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

function enviarArquivo(res, caminhoArquivo) {
  const extensao = extname(caminhoArquivo).toLowerCase();
  const contentType =
    MIME_TYPES[extensao] ||
    "application/octet-stream";

  res.writeHead(200, { "Content-Type": contentType });
  createReadStream(caminhoArquivo).pipe(res);
}

function responder404(res) {
  res.writeHead(404, {
    "Content-Type": "text/plain; charset=utf-8",
  });
  res.end("Not Found");
}

function resolverFallback(pathname) {
  if (pathname.startsWith("/admin")) {
    return join(DIST_DIR, "admin", "index.html");
  }

  if (pathname.startsWith("/portaria")) {
    return join(DIST_DIR, "portaria", "index.html");
  }

  if (pathname.startsWith("/pesquisa")) {
    return join(DIST_DIR, "pesquisa", "index.html");
  }

  return join(DIST_DIR, "index.html");
}

const server = createServer((req, res) => {
  const url = new URL(req.url || "/", `http://${req.headers.host}`);
  const pathname = url.pathname;
  const caminhoNormalizado = normalize(
    decodeURIComponent(pathname).replace(/^\/+/, ""),
  );

  const caminhoArquivo = join(DIST_DIR, caminhoNormalizado);

  if (
    existsSync(caminhoArquivo) &&
    statSync(caminhoArquivo).isFile()
  ) {
    enviarArquivo(res, caminhoArquivo);
    return;
  }

  const fallback = resolverFallback(pathname);

  if (existsSync(fallback)) {
    enviarArquivo(res, fallback);
    return;
  }

  responder404(res);
});

server.listen(PORT, HOST, () => {
  console.log(
    `Preview unificado disponível em http://${HOST}:${PORT}`,
  );
});