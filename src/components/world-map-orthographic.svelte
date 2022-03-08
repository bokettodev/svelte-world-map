<script lang="ts">
	import { beforeUpdate, onMount } from 'svelte';
	import { debounce } from '../functions/debounce';
	import { Orthographic } from '../classes/orthographic.class';
	import type { WorldDataset } from '../classes/world-data.class';

	export let worldDataset: WorldDataset;
	let isOrthographicInited = false;
	let lowResolutionLoaded = false;
	let middleResolutionLoaded = false;

	const orthographic = new Orthographic();
	let canvas: HTMLCanvasElement;
	let windowHeight: number;
	let windowWidth: number;

	beforeUpdate((): void => {
		if (!worldDataset || !canvas) {
			return;
		}
		orthographic.data = worldDataset;

		if (!middleResolutionLoaded && worldDataset.middleResolution) {
			middleResolutionLoaded = true;
			drawMap();
			return;
		}

		if (!lowResolutionLoaded && worldDataset.lowResolution) {
			lowResolutionLoaded = true;
			drawMap();
		}
	});

	function drawMap(): void {
		if (!isOrthographicInited) {
			isOrthographicInited = true;
			orthographic.init(canvas);
		}
		orthographic.drawMap();
		console.log(orthographic);
	}

	function onResize(): void {
		debounce(() => {
			orthographic.container.height = windowHeight;
			orthographic.container.width = windowWidth;
			orthographic.drawMap();
		}, orthographic.container.resizeDebounceMs);
	}
</script>

<svelte:window
	bind:innerHeight={windowHeight}
	bind:innerWidth={windowWidth}
	on:resize={() => onResize()}
/>

<canvas bind:this={canvas} height={windowHeight} width={windowWidth} />
