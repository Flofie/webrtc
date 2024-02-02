import 'babel-polyfill';

(window as any).global = window;
(window as any).process = {
  ...(window as any).process,
  env: { DEBUG: undefined },
};

// disable patching requestAnimationFrame
(window as any).__Zone_disable_requestAnimationFrame = true;

// disable patching specified eventNames
(window as any).__zone_symbol__UNPATCHED_EVENTS = ['message'];
