import { WorldDataset } from '@features/orthographic/classes';
import type { TopoJson } from '@features/orthographic/types';
import { json } from 'd3';
import * as topojson from 'topojson-client';

export const getWorldDataset = async (): Promise<WorldDataset | null> => {
	try {
		const [topoJson110, topoJson50] = (await Promise.all([
			json('countries-110m.topo.json'),
			json('countries-50m.topo.json')
		])) as [TopoJson, TopoJson];

		const lowResolution = topojson.feature(topoJson110, topoJson110.objects.countries);
		const highResolution = topojson.feature(topoJson50, topoJson50.objects.countries);

		return new WorldDataset(lowResolution, highResolution);
	} catch (error) {
		console.error(error);
		return null;
	}
};
