<script lang="ts">
	import { onMount } from 'svelte';
	import type { WorldDataset } from '../classes/world-data.class';
	import { getWorldDataset } from '../functions/get-world-dataset.function';
	import WorldMapOrthographic from './world-map-orthographic.svelte';

	let width: number;
	let height: number;
	let worldDataset: WorldDataset | null;

	onMount(async (): Promise<void> => {
		worldDataset = await getWorldDataset();
	});
</script>

<div bind:clientWidth={width} bind:clientHeight={height}>
	<WorldMapOrthographic {worldDataset} {width} {height} />
</div>

<style lang="scss">
	div {
		position: relative;
		height: 100%;
		width: 100%;
	}
</style>
