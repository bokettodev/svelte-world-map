<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import { debounce } from '../functions/debounce';
	import { Orthographic } from '../classes/orthographic.class';
	import type { WorldDataset } from '../classes/world-data.class';

	export let worldDataset: WorldDataset;
	export let width: number;
	export let height: number;

	let isOrthographicInited = false;
	let lowResolutionLoaded = false;
	let middleResolutionLoaded = false;

	const orthographic = new Orthographic();
	const resizeDebounceMs = 300;
	let canvas: HTMLCanvasElement;

	const onResize = debounce(() => {
		orthographic.drawMap();
	}, resizeDebounceMs);

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
</script>

<svelte:window on:resize={onResize} />

<canvas bind:this={canvas} {width} {height} />
