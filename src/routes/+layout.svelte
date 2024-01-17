<script>
	import Header from '$lib/components/Header.svelte';
	import './styles.css';
</script>

<div class="flex min-h-screen flex-col">
	<Header />
	<main class="mx-auto box-border flex w-full max-w-5xl flex-1 flex-col p-4">
		<slot />
	</main>
	<footer class="flex flex-col items-center justify-center p-3 md:p-0"></footer>
</div>
