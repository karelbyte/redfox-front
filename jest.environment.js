const JSDOMEnvironment = require('jest-environment-jsdom').default;

/**
 * jsdom crea un contexto global propio sin las APIs web que Node sí tiene
 * (fetch, Response, streams...). MSW v2 las necesita, así que se copian desde
 * el contexto de Node, que es donde se ejecuta este archivo.
 */
const NODE_GLOBALS = [
  'fetch',
  'Request',
  'Response',
  'Headers',
  'FormData',
  'Blob',
  'File',
  'TextEncoder',
  'TextDecoder',
  'ReadableStream',
  'WritableStream',
  'TransformStream',
  'BroadcastChannel',
  'MessageChannel',
  'MessagePort',
  'structuredClone',
  'performance',
];

module.exports = class NextJsdomEnvironment extends JSDOMEnvironment {
  constructor(...args) {
    super(...args);

    for (const name of NODE_GLOBALS) {
      if (typeof globalThis[name] !== 'undefined' && typeof this.global[name] === 'undefined') {
        this.global[name] = globalThis[name];
      }
    }
  }
};
