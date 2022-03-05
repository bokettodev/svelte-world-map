<script lang="ts">
	import { onMount } from 'svelte';
	import { draw } from 'svelte/transition';
	import { quadInOut } from 'svelte/easing';
	import { json, geoPath, geoMercator, type GeoProjection, type GeoPath } from 'd3';
	import { debounce } from '../functions/debounce';

	const windowResizeDebounceMs = 100;
	let windowHeight: number;
	let windowWidth: number;

	let isMouseDragging = false;
	let previousMouseEvent: MouseEvent;

	let worldGeoJson: GeoJSON.FeatureCollection;
	let mercatorProjection: GeoProjection;
	let pathGenerator: GeoPath;

	onMount((): void => {
		loadWorldGeoJson();
	});

	function loadWorldGeoJson(): void {
		json('./static/world-110m.geojson').then((geoJson: GeoJSON.FeatureCollection): void => {
			worldGeoJson = geoJson;
			drawMap();
		});
	}

	function drawMap(): void {
		initMercatorProjectionAndPathGeo(worldGeoJson);
	}

	function initMercatorProjectionAndPathGeo(geoJson: GeoJSON.FeatureCollection): void {
		mercatorProjection = geoMercator()
			.fitSize([windowWidth, windowHeight], geoJson)
			.rotate([-11, 0]);
		pathGenerator = geoPath(mercatorProjection);
	}

	function onMouseDown(event: MouseEvent): void {
		previousMouseEvent = event;
		isMouseDragging = true;
	}

	function onMouseMove(event: MouseEvent): void {
		if (isMouseDragging) {
			const diff = event.x - previousMouseEvent.x;
			if (!diff) {
				return;
			}

			const ratio = windowWidth / 360;
			let [yawAngle] = mercatorProjection.rotate();
			yawAngle += diff / ratio;

			mercatorProjection.rotate([yawAngle, 0]);
			pathGenerator = pathGenerator;
			previousMouseEvent = event;
		}
	}

	function onMouseUp(): void {
		isMouseDragging = false;
	}
</script>

<svelte:window
	bind:innerHeight={windowHeight}
	bind:innerWidth={windowWidth}
	on:resize={debounce(drawMap, windowResizeDebounceMs)}
/>

{#if worldGeoJson?.features?.length}
	<svg
		height="100%"
		width="100%"
		on:mousedown={onMouseDown}
		on:mousemove={onMouseMove}
		on:mouseup={onMouseUp}
	>
		{#each worldGeoJson.features as geoJsonFeature}
			<path
				transition:draw={{ duration: 3000, delay: 0, easing: quadInOut }}
				d={pathGenerator(geoJsonFeature)}
			/>
		{/each}
	</svg>
{/if}

<style lang="scss">
	path {
		fill: darkslategray;
		stroke: white;
	}
</style>
