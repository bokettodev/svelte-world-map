import type { Topology, GeometryCollection } from 'topojson-specification';

export type TopoJson = Topology<{
	land: GeometryCollection;
	countries: GeometryCollection;
}>;
