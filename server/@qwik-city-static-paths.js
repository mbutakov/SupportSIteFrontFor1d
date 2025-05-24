const staticPaths = new Set(["/favicon.svg","/icons/icon-192x192.svg","/icons/icon-512x512.svg","/manifest.json","/q-manifest.json","/q-manifest.json.br","/q-manifest.json.gz","/qwik-prefetch-service-worker.js","/qwik-prefetch-service-worker.js.br","/qwik-prefetch-service-worker.js.gz","/robots.txt","/screenshots/screenshot1.png","/service-worker.js","/service-worker.js.br","/service-worker.js.gz"]);
function isStaticPath(method, url) {
  if (method.toUpperCase() !== 'GET') {
    return false;
  }
  const p = url.pathname;
  if (p.startsWith("/build/")) {
    return true;
  }
  if (p.startsWith("/assets/")) {
    return true;
  }
  if (staticPaths.has(p)) {
    return true;
  }
  if (p.endsWith('/q-data.json')) {
    const pWithoutQdata = p.replace(/\/q-data.json$/, '');
    if (staticPaths.has(pWithoutQdata + '/')) {
      return true;
    }
    if (staticPaths.has(pWithoutQdata)) {
      return true;
    }
  }
  return false;
}
export { isStaticPath };