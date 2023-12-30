<script>
	import { enhance } from '$app/forms';
	export let form;
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>

<section>
	<h1>Register</h1>
	<form method="post" use:enhance class="flex flex-col items-center justify-center">
		<input name="email" value={form?.email ?? ''} class="border-black border-2" />
		<input name="password" type="password" class="border-black border-2" />
		<button>Sign up</button>
	</form>
</section>
