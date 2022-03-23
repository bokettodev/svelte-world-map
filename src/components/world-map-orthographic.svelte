<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import { debounce } from '../functions/debounce';
	import { Orthographic } from '../classes/orthographic.class';
	import type { WorldDataset } from '../classes/world-data.class';

	export let worldDataset: WorldDataset;
	export let width: number;
	export let height: number;

	const orthographic = new Orthographic();
	let canvas: HTMLCanvasElement;

	let orthographicInited = false;
	let mapInited = false;
	const resizeDebounceMs = 300;

	const onResize = debounce(() => {
		orthographic.drawMap();
	}, resizeDebounceMs);

	beforeUpdate((): void => {
		initMap();
	});

	function initOrthographic(): void {
		if (orthographicInited || !canvas) {
			return;
		}
		orthographicInited = true;
		orthographic.init(canvas);
	}

	function initMap(): void {
		initOrthographic();
		if (!orthographicInited || mapInited || !worldDataset) {
			return;
		}

		mapInited = true;
		orthographic.setWorldDataset(worldDataset);
		orthographic.drawMap();
	}
</script>

<svelte:window on:resize={onResize} />

<canvas bind:this={canvas} {width} {height} />
