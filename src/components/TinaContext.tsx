import { useTina } from 'tinacms/dist/react';

interface Props {
  query: string;
  variables: Record<string, unknown>;
  data: Record<string, unknown>;
}

// Invisible island — registers the current document with TinaCMS visual
// editor so the left-panel form fields load when viewing a page in preview.
export function TinaContext({ query, variables, data }: Props) {
  useTina({ query, variables, data });
  return null;
}
