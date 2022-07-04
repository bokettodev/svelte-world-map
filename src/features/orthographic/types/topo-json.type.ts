import type { GeometryCollection, Topology } from 'topojson-specification';

export type TopoJson = Topology<{
	land: GeometryCollection;
	countries: GeometryCollection;
}>;
