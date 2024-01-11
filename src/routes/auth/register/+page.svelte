<script lang="ts">
	import { writable } from 'svelte/store';
	import AuthRegisterBase from '$lib/components/AuthRegisterBase.svelte';
	import type { PageData } from './$types';
	import AuthRegisterByEmail from '$lib/components/AuthRegisterByEmail.svelte';

	export let data: PageData;
	let validatedEmail = '';
	let continueWithEmail = false;
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>

<section class="prose min-h-full m-auto">
	{#if !continueWithEmail}
		<AuthRegisterBase bind:validatedEmail bind:continueWithEmail bind:data />
	{:else}
		<AuthRegisterByEmail {validatedEmail} bind:continueWithEmail bind:data />
	{/if}
</section>
