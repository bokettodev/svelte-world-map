<script lang="ts">
	import type { WorldDataset } from '@features/orthographic/classes';
	import WorldMapOrthographic from '@features/orthographic/components/world-map-orthographic.svelte';
	import { getWorldDataset } from '@features/orthographic/functions';
	import { onMount } from 'svelte';

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
