import { useTina } from 'tinacms/dist/react';
import { useEffect, useState } from 'react';

interface Props {
  query: string;
  variables: Record<string, unknown>;
  data: Record<string, unknown>;
}

export function TinaContext(props: Props) {
  const [inIframe, setInIframe] = useState(false);

  useEffect(() => {
    setInIframe(window !== window.parent);
  }, []);

  if (!inIframe) return null;
  return <TinaContextActive {...props} />;
}

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

function applyToDOM(tinaData: Record<string, unknown>) {
  const collectionKey = Object.keys(tinaData).find(k => !k.startsWith('_'));
  if (!collectionKey) return;
  const collection = tinaData[collectionKey];

  document.querySelectorAll<HTMLElement>('[data-tina-field]').forEach(el => {
    const attr = el.getAttribute('data-tina-field');
    if (!attr) return;
    const sep = attr.indexOf('---');
    if (sep === -1) return;
    const pathStr = attr.slice(sep + 3);
    if (!pathStr) return;

    const value = getByPath(collection, pathStr.split('.'));
    if (value == null || (typeof value !== 'string' && typeof value !== 'number')) return;

    const str = String(value);

    if (el.tagName === 'IMG') {
      (el as HTMLImageElement).src = str;
      return;
    }

    // Only patch leaf text elements — skip containers with child elements
    if (el.children.length > 0) return;

    // Format ISO datetime strings to human-readable dates
    if (/^\d{4}-\d{2}-\d{2}T/.test(str)) {
      try {
        el.textContent = new Date(str).toLocaleDateString('en-GB', {
          day: 'numeric', month: 'long', year: 'numeric',
        });
      } catch { el.textContent = str; }
      return;
    }

    // Preserve currency prefix (£ $ € ¥)
    const currency = (el.textContent?.trim() ?? '').match(/^[£$€¥]/)?.[0] ?? '';
    el.textContent = currency + str;
  });
}

function TinaContextActive({ query, variables, data }: Props) {
  const { data: tinaData } = useTina({ query, variables, data });

  useEffect(() => {
    if (tinaData) applyToDOM(tinaData as Record<string, unknown>);
  }, [tinaData]);

  return null;
}
