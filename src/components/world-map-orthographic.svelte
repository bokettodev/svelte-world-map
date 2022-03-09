<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import { debounce } from '../functions/debounce';
	import { Orthographic } from '../classes/orthographic.class';
	import type { WorldDataset } from '../classes/world-data.class';

	export let worldDataset: WorldDataset;
	export let height: number;
	export let width: number;

	let isOrthographicInited = false;
	let lowResolutionLoaded = false;
	let middleResolutionLoaded = false;

	const orthographic = new Orthographic();
	const resizeDebounceMs = 100;
	let canvas: HTMLCanvasElement;

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
	}

	function onResize(): void {
		debounce(() => {
			orthographic.drawMap();
		}, resizeDebounceMs);
	}
</script>

<svelte:window on:resize={() => onResize()} />

<canvas bind:this={canvas} {height} {width} />
