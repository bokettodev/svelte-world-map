<script lang="ts">
	import { onMount } from 'svelte';
	import { draw } from 'svelte/transition';
	import { quadInOut } from 'svelte/easing';
	import { json, geoPath, geoMercator, type GeoProjection, type GeoPath } from 'd3';
	import * as topojson from 'topojson-client';
	import { debounce } from '../functions/debounce';
	import type { TopoJson } from '../types/topo-json.type';

	const windowResizeDebounceMs = 100;
	let windowHeight: number;
	let windowWidth: number;

	let isMouseDragging = false;
	let previousMouseEvent: MouseEvent;

	let worldData: GeoJSON.FeatureCollection<GeoJSON.Geometry, {}>;
	let mercatorProjection: GeoProjection;
	let pathGenerator: GeoPath;

	onMount((): void => {
		loadWorldGeoJson();
	});

	function loadWorldGeoJson(): void {
		json('countries-110m.topo.json').then((geoJson: TopoJson): void => {
			worldData = topojson.feature(geoJson, geoJson.objects.countries);
			drawMap();
		});
	}

	function drawMap(): void {
		mercatorProjection = geoMercator();
		setMercatorProjectionYawAngle(-11);
		setMercatorProjectionSize();
		setPathGenerator();
	}

	function updateMapSize(): void {
		setMercatorProjectionSize();
		reassignPathGenerator();
	}

	function setMercatorProjectionYawAngle(yawAngle: number): void {
		mercatorProjection.rotate([yawAngle, 0]);
	}

	function setMercatorProjectionSize(): void {
		mercatorProjection.fitSize([windowWidth, windowHeight], worldData);
	}

	function setPathGenerator(): void {
		pathGenerator = geoPath(mercatorProjection);
	}

	function reassignPathGenerator(): void {
		pathGenerator = pathGenerator;
	}

	function onMouseDown(event: MouseEvent): void {
		const isPrimaryButtonPressed = event.button === 0;
		if (!isPrimaryButtonPressed) {
			return;
		}

		previousMouseEvent = event;
		isMouseDragging = true;
	}

	function onMouseMove(event: MouseEvent): void {
		if (!isMouseDragging) {
			return;
		}

		const horizontalShiftPx = event.x - previousMouseEvent.x;
		if (!horizontalShiftPx) {
			return;
		}
		previousMouseEvent = event;

		const pixelsToRotateRatio = windowWidth / 360;
		let [yawAngle] = mercatorProjection.rotate();
		yawAngle += horizontalShiftPx / pixelsToRotateRatio;

		setMercatorProjectionYawAngle(yawAngle);
		reassignPathGenerator();
	}

	function onMouseUp(): void {
		isMouseDragging = false;
	}
</script>

<svelte:window
	bind:innerHeight={windowHeight}
	bind:innerWidth={windowWidth}
	on:mousedown={onMouseDown}
	on:mousemove={onMouseMove}
	on:mouseup={onMouseUp}
	on:resize={debounce(updateMapSize, windowResizeDebounceMs)}
/>

{#if worldData?.features?.length}
	<svg height="100%" width="100%">
		{#each worldData.features as geoJsonFeature}
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
