import { useTina } from 'tinacms/dist/react';
import { useEffect, useRef, useState } from 'react';

interface Props {
  query: string;
  variables: Record<string, unknown>;
  data: Record<string, unknown>;
}

type Format = { prefix: string; suffix: string };

export function TinaContext(props: Props) {
  const [inIframe, setInIframe] = useState(false);
  useEffect(() => { setInIframe(window !== window.parent); }, []);
  if (!inIframe) return null;
  return <TinaContextActive {...props} />;
}

// Navigate nested object/array using dot-separated path parts
function getByPath(obj: unknown, parts: string[]): unknown {
  let cur = obj;
  for (const part of parts) {
    if (cur == null) return undefined;
    const idx = Number(part);
    cur = Number.isFinite(idx) && part !== ''
      ? (cur as unknown[])[idx]
      : (cur as Record<string, unknown>)[part];
  }
  return cur;
}

// Text from direct text nodes only (ignores child elements like SVG icons)
function getDirectText(el: HTMLElement): string {
  return Array.from(el.childNodes)
    .filter(n => n.nodeType === Node.TEXT_NODE)
    .map(n => n.textContent ?? '')
    .join('')
    .trim();
}

// True if any descendant has data-tina-field (this element is a container, not a leaf)
function isContainer(el: HTMLElement): boolean {
  return el.querySelector('[data-tina-field]') !== null;
}

function toISO(str: string): string | null {
  return /^\d{4}-\d{2}-\d{2}T/.test(str) ? str : null;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-GB', {
      day: 'numeric', month: 'long', year: 'numeric',
    });
  } catch { return iso; }
}

// Build a per-element format cache (prefix/suffix) by diffing rendered text against raw value
function buildCache(
  cache: Map<string, Format>,
  collection: unknown,
) {
  document.querySelectorAll<HTMLElement>('[data-tina-field]').forEach(el => {
    const attr = el.getAttribute('data-tina-field');
    if (!attr || cache.has(attr) || isContainer(el)) return;

    const sep = attr.indexOf('---');
    if (sep === -1) return;
    const value = getByPath(collection, attr.slice(sep + 3).split('.'));
    if (value == null || (typeof value !== 'string' && typeof value !== 'number')) return;

    let str = String(value);
    if (toISO(str)) str = formatDate(str);

    const text = el.tagName === 'IMG'
      ? (el as HTMLImageElement).src
      : getDirectText(el);

    const idx = text.indexOf(str);
    cache.set(attr, idx !== -1
      ? { prefix: text.slice(0, idx), suffix: text.slice(idx + str.length) }
      : { prefix: '', suffix: '' },
    );
  });
}

function applyToDOM(
  tinaData: Record<string, unknown>,
  cache: Map<string, Format>,
  cacheReady: { current: boolean },
) {
  const collectionKey = Object.keys(tinaData).find(k => !k.startsWith('_'));
  if (!collectionKey) return;
  const collection = tinaData[collectionKey];

  if (!cacheReady.current) {
    buildCache(cache, collection);
    cacheReady.current = true;
  }

  document.querySelectorAll<HTMLElement>('[data-tina-field]').forEach(el => {
    const attr = el.getAttribute('data-tina-field');
    if (!attr || isContainer(el)) return;

    const sep = attr.indexOf('---');
    if (sep === -1) return;
    const value = getByPath(collection, attr.slice(sep + 3).split('.'));
    if (value == null || (typeof value !== 'string' && typeof value !== 'number')) return;

    let str = String(value);
    const iso = toISO(str);
    if (iso) str = formatDate(iso);

    const { prefix, suffix } = cache.get(attr) ?? { prefix: '', suffix: '' };
    const newText = prefix + str + suffix;

    if (el.tagName === 'IMG') {
      (el as HTMLImageElement).src = str;
      return;
    }

    // Update first substantive text node (preserves SVG/icon child elements)
    let patched = false;
    for (const node of Array.from(el.childNodes)) {
      if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim()) {
        node.textContent = newText;
        patched = true;
        break;
      }
    }
    // Leaf with no text nodes yet
    if (!patched && el.children.length === 0) {
      el.textContent = newText;
    }
  });
}

function TinaContextActive({ query, variables, data }: Props) {
  const { data: tinaData } = useTina({ query, variables, data });
  const cache = useRef<Map<string, Format>>(new Map());
  const cacheReady = useRef(false);

  useEffect(() => {
    if (tinaData) applyToDOM(tinaData as Record<string, unknown>, cache.current, cacheReady);
  }, [tinaData]);

  return null;
}
