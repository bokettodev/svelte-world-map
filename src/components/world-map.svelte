<script lang="ts">
	import { draw } from 'svelte/transition';
	import { quadInOut } from 'svelte/easing';
	import {
		json,
		geoPath,
		geoMercator,
		type GeoProjection,
		type GeoPath,
		type GeoPermissibleObjects
	} from 'd3';
	import { onMount } from 'svelte';

	let geoJsonFeatures: GeoJSON.Feature[] = [];
	let mercatorProjection: GeoProjection;
	let pathGenerator: GeoPath<any, GeoPermissibleObjects>;

	let windowHeight: number;
	let windowWidth: number;

	const width = '100%';
	const height = '100%';
	const url = './static/world.geojson';

	function loadJson(): void {
		json(url).then((worldGeoJson: GeoJSON.FeatureCollection): void => {
			setProjectionAndPath(worldGeoJson);
			geoJsonFeatures = worldGeoJson.features;
		});
	}

	function setProjectionAndPath(geoJson: GeoJSON.FeatureCollection): void {
		mercatorProjection = geoMercator().fitSize([windowWidth, windowHeight], geoJson);
		pathGenerator = geoPath(mercatorProjection);
	}

	onMount((): void => {
		loadJson();
	});
</script>

<svelte:window bind:innerHeight={windowHeight} bind:innerWidth={windowWidth} />

<svg {width} {height}>
	{#each geoJsonFeatures as geoJsonFeature}
		<path
			transition:draw={{ duration: 3000, delay: 0, easing: quadInOut }}
			d={pathGenerator(geoJsonFeature)}
		/>
	{/each}
</svg>

<style>
	path {
		fill: none;
		stroke: darkgreen;
	}
</style>
