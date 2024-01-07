<script lang="ts">
	import type { PageData } from '../../routes/auth/register/$types';
	import { superForm } from 'sveltekit-superforms/client';
	import { fly } from 'svelte/transition';

	export let data: PageData;
	export let toggleContinueWithEmail: () => void;
	const { form, errors, enhance, message } = superForm(data.validateMainForm, { resetForm: true });

	// TODO: set up login page
	console.log($errors, $message);
</script>

<div in:fly={{ duration: 300 }} class="flex flex-col items-center justify-center gap-5">
	<div class="flex flex-col items-center justify-center">
		<h2 class="my-0">Create an account</h2>
		<p>Enter your email below to create your account</p>
		<form method="post" use:enhance class="flex flex-col w-full">
			<input
				type="email"
				placeholder="name@example.com"
				name="email"
				class="input input-bordered w-full mb-5"
				bind:value={$form.email}
			/>
			<input type="password" placeholder="Password" name="password" class="input input-bordered w-full mb-5" />
			<input
				type="password"
				placeholder="Confirm Password"
				name="confirmPassword"
				class="input input-bordered w-full mb-5"
			/>
		</form>
		<button class="btn btn-block btn-primary mb-5">Register</button>
		<button class="btn btn-block" on:click={toggleContinueWithEmail}>Cancel</button>
	</div>
</div>
