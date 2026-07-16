import got from 'got';
import vm from 'vm';
import {JSDOM} from 'jsdom';
import fetch from 'cross-fetch';
import * as path from 'path';

Object.assign(process.env, require('dotenv').config());

if (!process.env.APIKEY) {
    throw new Error('Define APIKEY env');
}

const REFERRER = process.env.REFERRER || 'http://ymaps3.localhost/';
const API_HOST = process.env.APIHOST || 'https://api-maps.yandex.ru/v3/';
const API_URL = `${API_HOST}?apikey=${process.env.APIKEY}&lang=en_US`;
const NS = process.env.NAMESPACE || 'ymaps3';

const computeClientDimension = (element: HTMLElement, dimension: 'width' | 'height') => {
    const path = [];

    do {
        const style = getComputedStyle(element);
        const styleStr = `width: ${style.width}; height: ${style.height}`;
        path.push(`<${element.tagName.toLowerCase()} class="${element.className}" style="${styleStr}">`);

        if (!style[dimension]) break;
        if (style[dimension] === '100%') {
            element = element.parentElement;
            continue;
        }
        if (style[dimension].endsWith('px')) {
            return parseFloat(style[dimension]);
        }

        break;

        // eslint-disable-next-line no-constant-condition
    } while (true);

    const pathFormatted = path
        .reverse()
        .map((x, i) => '  '.repeat(i) + x)
        .join('\n');

    throw new Error(`Cannot compute ${dimension}:\n${pathFormatted}`);
};

module.exports = async function () {
    const dom = await JSDOM.fromFile(path.resolve(__dirname, 'index.html'), {
        url: REFERRER
    });

    const appendChild = dom.window.document.head.appendChild.bind(dom.window.document.head);
    dom.window.document.head.appendChild = <T extends Node>(node: T): T => {
        if (isScript(node)) {
            loadAndExecuteScript(node.src)
                .then(() => node.dispatchEvent(new dom.window.Event('load')))
                .catch((e) => console.log('Error', e));
        } else if (isLink(node)) {
            // The JS API loads its stylesheet via <link href> (e.g. main.css). JSDOM neither
            // fetches it nor fires `load`, so the loader promise — and thus `ymaps3.ready` —
            // would hang. Fetch the CSS and inject it as a <style> so that `getComputedStyle`
            // sees the rules (needed by layout-dependent code such as the map container size),
            // then emit `load` so the loader promise settles.
            got(node.href, {headers: {Referer: REFERRER}})
                .then(({body}) => {
                    const style = dom.window.document.createElement('style');
                    style.textContent = body;
                    appendChild(style);
                })
                .catch((e) => console.log('Error', e))
                .finally(() => node.dispatchEvent(new dom.window.Event('load')));
        }

        return appendChild(node);
    };

    const context: any = {
        ...dom.window,
        Node: dom.window.Node,
        DOMException: class extends Error {
            constructor(message: string, name: string) {
                super(message);
                this.name = name;
            }
        },
        MouseEvent: dom.window.MouseEvent,
        Image: dom.window.Image,
        HTMLElement: dom.window.HTMLElement,
        Element: dom.window.Element,
        XMLHttpRequest: dom.window.XMLHttpRequest,
        window: dom.window,
        global: dom.window,

        self: new Proxy(
            {},
            {
                get(_, p) {
                    return Reflect.get(context, p);
                },
                set(_, p, newValue) {
                    Reflect.set(context, p, newValue);
                    return true;
                }
            }
        ),

        domToJson,
        console,
        AbortController,
        clearTimeout,
        setTimeout,
        performance,
        URL,
        URLSearchParams,
        queueMicrotask: (cb: Function) => cb(),
        requestAnimationFrame: (cb: Function) => cb(),
        fetch: (url: string, query: object) =>
            fetch(url, {
                ...query,
                // agent: agent,
                headers: {
                    referer: REFERRER
                }
            }),
        ResizeObserver: function () {
            return {
                disconnect() {},
                observe() {}
            };
        },
        NodeFilter: dom.window.NodeFilter
    };

    Object.defineProperties(dom.window.Element.prototype, {
        clientWidth: {
            get() {
                return computeClientDimension(this, 'width');
            }
        },
        clientHeight: {
            get() {
                return computeClientDimension(this, 'height');
            }
        }
    });

    async function loadAndExecuteScript(url: string) {
        const data = await got(url, {
            headers: {
                Referer: REFERRER
            }
        });

        await vm.runInNewContext(data.body, context);
    }

    await loadAndExecuteScript(API_URL);
    await context[NS].ready;

    Object.assign(global, context);
};

function isScript(node: Node): node is HTMLScriptElement {
    return node.nodeName === 'SCRIPT';
}

function isLink(node: Node): node is HTMLLinkElement {
    return node.nodeName === 'LINK';
}

function isElement(node: Node): node is Element {
    return node.nodeType === Node.ELEMENT_NODE;
}

function domToJson(e: Node | ChildNode | null): TreeNode {
    const result: TreeNode = {
        nodeName: e.nodeName.toLowerCase(),
        attributes: isElement(e)
            ? Array.from(e.attributes).reduce((acc, {name, value}) => {
                  acc[name] = value;
                  return acc;
              }, {} as TreeNode['attributes'])
            : {}
    };

    if (e.childNodes.length) {
        result.children = Array.from(e.childNodes, (e) =>
            e.nodeType === Node.TEXT_NODE ? e.textContent : domToJson(e)
        );
    }

    return result;
}
