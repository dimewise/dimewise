<script>
	import Counter from './Counter.svelte';
	import welcome from '$lib/images/svelte-welcome.webp';
	import welcome_fallback from '$lib/images/svelte-welcome.png';
	import { AppBar } from '@skeletonlabs/skeleton';
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>

<section>
	<AppBar>
		<svelte:fragment slot="lead">(icon)</svelte:fragment>
		<svelte:fragment slot="trail">(actions)</svelte:fragment>
		<svelte:fragment slot="headline">Title goes here</svelte:fragment>
	</AppBar>
	<h1>
		<span class="welcome">
			<picture>
				<source srcset={welcome} type="image/webp" />
				<img src={welcome_fallback} alt="Welcome" />
			</picture>
		</span>

		to your new<br />SvelteKit app
	</h1>

	<h2>
		try editing <strong>src/routes/+page.svelte</strong>
	</h2>

	<Counter />
	<h1>Welcome</h1>
	<a href="/auth/login">Login</a>
	<a href="/auth/register">Register</a>
</section>
