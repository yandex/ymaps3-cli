import React from 'react';
import ReactDOM from 'react-dom';
import {render} from '@testing-library/react';
import type {LngLat, YMap} from '@yandex/ymaps3-types';

describe('React YMap test', () => {
    const LOCATION = {center: [37.62, 55.75] as LngLat, zoom: 12};
    let container: HTMLElement;
    let map: YMap;

    beforeEach(() => {
        container = document.createElement('div');
        Object.assign(container.style, {width: '640px', height: '480px'});

        document.body.appendChild(container);
    });

    afterEach(() => {
        map?.destroy();
        container?.remove();
    });

    it('should make react map', async () => {
        expect(ymaps3).toBeDefined();

        const [ymapsReact] = await Promise.all([ymaps3.import('@yandex/ymaps3-reactify'), ymaps3.ready]);
        const reactify = ymapsReact.reactify.bindTo(React, ReactDOM);
        expect(reactify).toBeDefined();

        const {YMap, YMapDefaultSchemeLayer, YMapDefaultFeaturesLayer, YMapControls, YMapControl} =
            reactify.module(ymaps3);
        expect(YMap).toBeDefined();

        render(
            <YMap location={LOCATION} ref={(x) => (map = x)}>
                <YMapDefaultSchemeLayer />
                <YMapDefaultFeaturesLayer />

                <YMapControls position="left">
                    <YMapControl>
                        <div>test control</div>
                    </YMapControl>
                </YMapControls>
            </YMap>,
            {
                container
            }
        );

        const tree = domToJson(map.container);
        expect(tree).toMatchSnapshot();
    });
});
