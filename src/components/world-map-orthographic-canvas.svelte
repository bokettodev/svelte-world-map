<script lang="ts">
	import { onMount } from 'svelte';
	import { json, geoPath, type GeoProjection, type GeoPath, select, geoOrthographic } from 'd3';
	import * as topojson from 'topojson-client';
	import { debounce } from '../functions/debounce';
	import type { TopoJson } from '../types/topo-json.type';

	const windowResizeDebounceMs = 100;
	let windowHeight: number;
	let windowWidth: number;

	let isMouseDragging = false;
	let previousMouseEvent: MouseEvent;

	let worldData: GeoJSON.FeatureCollection<GeoJSON.Geometry, {}>;
	let projection: GeoProjection;
	let canvasContext: CanvasRenderingContext2D;
	let pathGenerator: GeoPath;

	onMount((): void => {
		loadWorldGeoJson();
	});

	function loadWorldGeoJson(): void {
		json('countries-110m.topo.json').then((geoJson: TopoJson): void => {
			worldData = topojson.feature(geoJson, geoJson.objects.countries);
			initMap();
		});
	}

	function initMap(): void {
		projection = geoOrthographic();
		canvasContext = (select('canvas').node() as HTMLCanvasElement).getContext('2d');
		pathGenerator = geoPath(projection, canvasContext);

		fitProjectionSize();
		renderCanvas();
	}

	function renderCanvas(): void {
		canvasContext.clearRect(0, 0, windowWidth, windowHeight);

		canvasContext.beginPath();
		pathGenerator({ type: 'Sphere' });
		canvasContext.fillStyle = 'lightblue';
		canvasContext.fill();

		canvasContext.beginPath();
		pathGenerator(worldData);
		canvasContext.fillStyle = '#000';
		canvasContext.fill();

		canvasContext.beginPath();
		pathGenerator({ type: 'Sphere' });
		canvasContext.stroke();
	}

	function updateMapSize(): void {
		fitProjectionSize();
		renderCanvas();
	}

	function fitProjectionSize(): void {
		projection.fitSize([windowWidth, windowHeight], worldData);
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
		let [yawAngle] = projection.rotate();
		yawAngle += horizontalShiftPx / pixelsToRotateRatio;

		projection.rotate([yawAngle, 0]);
		renderCanvas();
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

<div>
	<canvas height={windowHeight} width={windowWidth} />
</div>

<style lang="scss">
	div {
		height: 100%;
		width: 100%;
	}
</style>
