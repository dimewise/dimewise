<script>
	import Header from '$lib/components/Header.svelte';
	import './styles.css';
</script>

<div class="flex flex-col min-h-screen">
	<Header />
	<main class="flex-1 flex flex-col p-4 w-full max-w-5xl mx-auto box-border">
		<slot />
	</main>
	<footer class="flex flex-col justify-center items-center p-3 md:p-0"></footer>
</div>
