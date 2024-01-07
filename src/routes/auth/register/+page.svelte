<script lang="ts">
	import { writable } from 'svelte/store';
	import { enhance } from '$app/forms';
	import Icon from '@iconify/svelte';

	export let form;

	let socialButtons = [
		{ icon: 'bxl:facebook-circle', text: 'Facebook', variant: '' },
		{ icon: 'bxl:google', text: 'Google', variant: '' },
		{ icon: 'bxl:apple', text: 'Apple', variant: '' },
	];

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
	<div class="flex flex-col items-center justify-center gap-5">
		<div class="flex flex-col items-center justify-center">
			<h2 class="my-0">Create an account</h2>
			<p>Enter your email below to create your account</p>
			<form method="post" use:enhance class="flex flex-col w-full">
				<input
					type="email"
					placeholder="name@example.com"
					name="email"
					value={form?.email ?? ''}
					class="input input-bordered w-full mb-5"
				/>
				{#if $continueWithEmail}
					<input type="password" placeholder="Password" name="password" class="input input-bordered w-full mb-5" />
					<input
						type="password"
						placeholder="Confirm Password"
						name="confirm-password"
						class="input input-bordered w-full mb-5"
					/>
				{/if}
			</form>
			{#if !$continueWithEmail}
				<button class="btn btn-block" on:click={toggleContinueWithEmail}>Continue</button>
			{:else}
				<button class="btn btn-block btn-primary mb-5">Register</button>
				<button class="btn btn-block" on:click={toggleContinueWithEmail}>Cancel</button>
			{/if}
		</div>

		{#if !$continueWithEmail}
			<div class="divider uppercase text-xs">or continue with</div>

			<div class="w-full flex flex-col items-center justify-center gap-4">
				{#each socialButtons as { icon, text, variant }}
					<button class={`btn btn-block btn-outline max-w-xs ${variant}`}>
						<span><Icon {icon} class="text-xl" /></span>
						{text}
					</button>
				{/each}
			</div>

			<p class="text-center text-sm w-full max-w-xs">
				By clicking continue, you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>
			</p>
		{/if}
	</div>
</section>
