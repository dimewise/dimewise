<script lang="ts">
	import type { PageData } from './$types';
	import AuthRegisterBase from './AuthRegisterBase.svelte';
	import AuthRegisterByEmail from './AuthRegisterByEmail.svelte';

	export let data: PageData;
	let validatedEmail = '';
	let continueWithEmail = false;
</script>

<svelte:head>
	<title>Register</title>
	<meta name="description" content="Dimewise account registration" />
</svelte:head>

<section class="prose min-h-full m-auto">
	{#if !continueWithEmail}
		<AuthRegisterBase bind:validatedEmail bind:continueWithEmail bind:data />
	{:else}
		<AuthRegisterByEmail {validatedEmail} bind:continueWithEmail bind:data />
	{/if}
</section>
