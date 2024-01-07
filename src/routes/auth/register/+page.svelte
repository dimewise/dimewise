<script lang="ts">
	import { writable } from 'svelte/store';
	import AuthRegisterBase from '$lib/components/AuthRegisterBase.svelte';
	import type { PageData } from './$types';
	import AuthRegisterByEmail from '$lib/components/AuthRegisterByEmail.svelte';

	export let data: PageData;

	const continueWithEmail = writable(false);

	function toggleContinueWithEmail(): void {
		continueWithEmail.update((value) => !value);
	}
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>

<section class="prose min-h-full m-auto">
	{#if !$continueWithEmail}
		<AuthRegisterBase {data} {toggleContinueWithEmail} />
	{:else}
		<AuthRegisterByEmail {data} {toggleContinueWithEmail} />
	{/if}
</section>
