<script lang="ts">
	import { superForm } from 'sveltekit-superforms/client';
	import { fly } from 'svelte/transition';
	import type { PageData } from './$types';

	export let data: PageData;
	export let validatedEmail: string;
	export let continueWithEmail: boolean;
	const {
		form: form,
		errors: errors,
		enhance: enhance,
	} = superForm(data.validateMainForm, {
		resetForm: true,
		autoFocusOnError: 'detect',
		onSubmit: ({ action, formData }) => {
			console.log(action, formData);
		},
	});

	$form.email = validatedEmail;

	const handleOnClickCancel = (): void => {
		continueWithEmail = false;
	};
</script>

<div in:fly class="flex flex-col items-center justify-center gap-5">
	<div class="flex flex-col items-center justify-center">
		<h2 class="my-0">Create an account</h2>
		<p>Enter your email below to create your account</p>
		<form method="POST" action="?/register" use:enhance class="flex w-full flex-col">
			<input
				type="email"
				placeholder="name@example.com"
				name="email"
				class="input input-bordered input-disabled mb-5 w-full"
				bind:value={$form.email}
			/>
			<input
				type="password"
				placeholder="Password"
				name="password"
				class={`input input-bordered mb-5 w-full ${$errors.password && 'input-error'}`}
				bind:value={$form.password}
				aria-invalid={$errors.password ? 'true' : undefined}
			/>
			{#if $errors.password}
				<div class="label">
					<span class="label-text-alt text-error">{$form.password}</span>
				</div>
			{/if}
			<input
				type="password"
				placeholder="Confirm Password"
				name="confirmPassword"
				class={`input input-bordered mb-5 w-full ${$errors.confirmPassword && 'input-error'}`}
				bind:value={$form.confirmPassword}
				aria-invalid={$errors.confirmPassword ? 'true' : undefined}
			/>
			{#if $errors.confirmPassword}
				<div class="label">
					<span class="label-text-alt text-error">{$errors.confirmPassword}</span>
				</div>
			{/if}
			<button type="submit" class="btn btn-primary btn-block mb-5">Register</button>
			<button type="button" class="btn btn-block" on:click={handleOnClickCancel}>Cancel</button>
		</form>
	</div>
</div>
