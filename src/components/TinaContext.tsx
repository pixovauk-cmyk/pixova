import { useTina } from 'tinacms/dist/react';
import { useEffect, useState } from 'react';

interface Props {
  query: string;
  variables: Record<string, unknown>;
  data: Record<string, unknown>;
}

// Only activates when the page is loaded inside the TinaCMS admin iframe.
// On direct page visits, does nothing — prevents useTina() from redirecting
// the user to the admin when the TinaCMS dev server is running locally.
export function TinaContext(props: Props) {
  const [inIframe, setInIframe] = useState(false);

  useEffect(() => {
    setInIframe(window !== window.parent);
  }, []);

  if (!inIframe) return null;
  return <TinaContextActive {...props} />;
}

function TinaContextActive({ query, variables, data }: Props) {
  useTina({ query, variables, data });
  return null;
}
