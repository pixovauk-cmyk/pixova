import { c as createComponent } from './astro-component_zUpURNEs.mjs';
import 'piccolore';
import { n as renderComponent, r as renderTemplate } from './entrypoint_BouUMvZa.mjs';

const prerender = false;
const $$KeystaticAstroPage = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Keystatic", null, { "client:only": "react", "client:component-hydration": "only", "client:component-path": "/Users/aniljosy/Desktop/Pixova/pixova-site/node_modules/@keystatic/astro/internal/keystatic-page.js", "client:component-export": "Keystatic" })}`;
}, "/Users/aniljosy/Desktop/Pixova/pixova-site/node_modules/@keystatic/astro/internal/keystatic-astro-page.astro", void 0);

const $$file = "/Users/aniljosy/Desktop/Pixova/pixova-site/node_modules/@keystatic/astro/internal/keystatic-astro-page.astro";
const $$url = undefined;

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	default: $$KeystaticAstroPage,
	file: $$file,
	prerender,
	url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
