import type {LngLatBounds} from '@yandex/ymaps3-types/common/types';
import type {YMap} from "@yandex/ymaps3-types";

describe('YMap smoke test', () => {
    const BOUNDS: LngLatBounds = [
        [54.58311, 25.99850],
        [56.30248, 24.47889]
    ];

    const LOCATION = {bounds: BOUNDS};

    let container: HTMLElement, map: YMap;
    beforeEach(() => {
        container = document.createElement('div');
        Object.assign(container.style, {width: `643px`, height: `856px`});
        document.body.appendChild(container);
        map = new ymaps3.YMap(container, {location: LOCATION}, [
            new ymaps3.YMapDefaultSchemeLayer({})
        ]);
    })

    afterEach(() => {
        map.destroy();
        container.remove();
    })

    it('should make map', () => {
        const tree = domToJson(map.container);
        expect(tree).toMatchSnapshot();
    });
});
