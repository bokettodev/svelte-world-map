<script lang="ts">
	import { draw } from 'svelte/transition';
	import { quadInOut } from 'svelte/easing';
	import { json, geoPath, geoMercator, type GeoProjection, type GeoPath } from 'd3';
	import { onMount } from 'svelte';

	let geoJsonFeatures: GeoJSON.Feature[] = [];
	let mercatorProjection: GeoProjection;
	let pathGenerator: GeoPath;

	let windowHeight: number;
	let windowWidth: number;

	function loadWorldGeoJson(): void {
		json('./static/world.geojson').then((worldGeoJson: GeoJSON.FeatureCollection): void => {
			setProjectionAndPath(worldGeoJson);
			geoJsonFeatures = worldGeoJson.features;
		});
	}

	function setProjectionAndPath(geoJson: GeoJSON.FeatureCollection): void {
		mercatorProjection = geoMercator()
			.fitSize([windowWidth, windowHeight], geoJson)
			.rotate([-11, 0]);
		pathGenerator = geoPath(mercatorProjection);
	}

	onMount((): void => {
		loadWorldGeoJson();
	});
</script>

<svelte:window bind:innerHeight={windowHeight} bind:innerWidth={windowWidth} />

<svg height="100%" width="100%">
	{#each geoJsonFeatures as geoJsonFeature}
		<path
			transition:draw={{ duration: 3000, delay: 0, easing: quadInOut }}
			data-iso={geoJsonFeature.id}
			data-name={geoJsonFeature.properties.name}
			d={pathGenerator(geoJsonFeature)}
		/>
	{/each}
</svg>

<style>
	path {
		fill: darkslategray;
		stroke: white;
	}
</style>
