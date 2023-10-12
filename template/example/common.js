ymaps3.import.loaders.unshift(async (pkg) => {
    if (!pkg.startsWith('%PACKAGE_NAME%')) {
        return;
    }

    if (location.href.includes('localhost')) {
        await ymaps3.import.script(`/dist/index.js`);
    } else {
        await ymaps3.import.script(`https://unpkg.com/${pkg}/dist/index.js`);
    }

    return window['%PACKAGE_NAME%'];
})


const BOUNDS = [
    [54.58311, 25.99850],
    [56.30248, 24.47889]
];

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const LOCATION = {bounds: BOUNDS};
