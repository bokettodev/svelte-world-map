<script lang="ts">
	import { onMount } from 'svelte';
	import { json } from 'd3';
	import * as topojson from 'topojson-client';
	import WorldMapOrthographic from './world-map-orthographic.svelte';
	import { WorldDataset } from '../classes/world-data.class';
	import type { TopoJson } from '../types/topo-json.type';

	let width: number;
	let height: number;
	let worldDataset: WorldDataset;

	onMount((): void => {
		Promise.all([json('countries-110m.topo.json'), json('countries-50m.topo.json')]).then(
			([topoJson110, topoJson50]: [TopoJson, TopoJson]) => {
				const lowResolution = topojson.feature(topoJson110, topoJson110.objects.countries);
				const highResolution = topojson.feature(topoJson50, topoJson50.objects.countries);
				worldDataset = new WorldDataset(lowResolution, highResolution);
			}
		);
	});
</script>

<div bind:clientWidth={width} bind:clientHeight={height}>
	<WorldMapOrthographic {worldDataset} {width} {height} />
</div>

<style lang="scss">
	div {
		position: relative;
		height: 100%;
		width: 100%;
	}
</style>
