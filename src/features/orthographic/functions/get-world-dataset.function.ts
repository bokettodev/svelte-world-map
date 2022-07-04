import { json } from 'd3';
import * as topojson from 'topojson-client';
import { WorldDataset } from '../classes/world-data.class';
import type { TopoJson } from '../types/topo-json.type';

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
