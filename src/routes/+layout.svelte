<script lang="ts">
	import { onMount } from 'svelte';
	import './styles.css';
	import { invalidate } from '$app/navigation';
	import AuthNav from '$lib/nav/AuthNav.svelte';
	import BaseNav from '$lib/nav/BaseNav.svelte';
	import type { PageData } from './$types';

	export let data: PageData;

	let { supabase, session } = data;
	$: ({ supabase, session } = data);

	onMount(() => {
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_, _session) => {
			if (_session?.expires_at !== session?.expires_at) {
				invalidate('supabase:auth');
			}
		});

		return subscription.unsubscribe();
	});
</script>

<div class="flex min-h-screen flex-col">
	{#if session}
		<AuthNav bind:data />
	{:else}
		<BaseNav />
	{/if}
	<main class="container mx-auto box-border flex w-full max-w-5xl flex-1 flex-col p-4">
		<slot />
	</main>
	<footer class="flex flex-col items-center justify-center p-3 md:p-0"></footer>
</div>
