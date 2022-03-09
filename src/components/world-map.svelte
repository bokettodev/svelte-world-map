<script lang="ts">
	import { onMount } from 'svelte';
	import { json } from 'd3';
	import * as topojson from 'topojson-client';
	import WorldMapMercatorSvg from './world-map-mercator-svg.svelte';
	import WorldMapOrthographic from './world-map-orthographic.svelte';
	import { WorldDataset } from '../classes/world-data.class';
	import type { TopoJson } from '../types/topo-json.type';

	let mercator = false;
	let width: number;
	let height: number;
	const worldDataset = new WorldDataset();

	onMount((): void => {
		loadWorldTopoJsonLowResolution();
	});

	function loadWorldTopoJsonLowResolution(): void {
		json('countries-110m.topo.json').then((topoJson: TopoJson): void => {
			worldDataset.lowResolution = topojson.feature(topoJson, topoJson.objects.countries);
			loadWorldTopoJsonMiddleResolution();
		});
	}

	function loadWorldTopoJsonMiddleResolution(): void {
		json('countries-50m.topo.json').then((topoJson: TopoJson): void => {
			worldDataset.middleResolution = topojson.feature(topoJson, topoJson.objects.countries);
		});
	}
</script>

<div bind:clientWidth={width} bind:clientHeight={height}>
	<input type="checkbox" bind:checked={mercator} />

	{#if mercator}
		<WorldMapMercatorSvg />
	{:else}
		<WorldMapOrthographic {worldDataset} {width} {height} />
	{/if}
</div>

<style lang="scss">
	div {
		position: relative;
		height: 100%;
		width: 100%;

		input {
			position: absolute;
			top: 20px;
			left: 20px;
		}
	}
</style>
