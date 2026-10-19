// Prefixo do site. No GitHub Pages o app mora em /animabooksf/ (definido no build).
// Link, router.push e router.replace do Next já põem o prefixo sozinhos;
// <img>, <Image src="..."> com texto, fetch e window.open precisam deste helper.
export const BASE = process.env.NEXT_PUBLIC_BASE_PATH || '';

export function withBase(path: string): string {
  if (!path.startsWith('/')) return path;
  if (BASE && path.startsWith(BASE + '/')) return path;
  return BASE + path;
}
