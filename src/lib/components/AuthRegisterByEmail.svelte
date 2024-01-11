<script lang="ts">
	import type { PageData } from '../../routes/auth/register/$types';
	import { superForm } from 'sveltekit-superforms/client';
	import { fly } from 'svelte/transition';

	// export let email: string;
	export let data: PageData;
	export let validatedEmail: string;
	export let continueWithEmail: boolean;
	const {
		form: mainForm,
		errors: mainFormErrors,
		enhance: mainFormEnhance,
		message: mainFormMessage,
	} = superForm(data.validateMainForm, {
		resetForm: true,
		autoFocusOnError: 'detect',
		onSubmit: ({ action, formData }) => {
			console.log(action, formData);
		},
	});

	console.log($mainFormErrors, $mainFormMessage);
	console.log($mainForm);
	$mainForm.email = validatedEmail;
</script>

<div in:fly class="flex flex-col items-center justify-center gap-5">
	<div class="flex flex-col items-center justify-center">
		<h2 class="my-0">Create an account</h2>
		<p>Enter your email below to create your account</p>
		<form method="POST" action="?/register" use:mainFormEnhance class="flex flex-col w-full">
			<input
				type="email"
				placeholder="name@example.com"
				name="email"
				class="input input-bordered w-full mb-5 input-disabled"
				bind:value={$mainForm.email}
			/>
			<input
				type="password"
				placeholder="Password"
				name="password"
				class={`input input-bordered w-full mb-5 ${$mainFormErrors.password && 'input-error'}`}
				bind:value={$mainForm.password}
				aria-invalid={$mainFormErrors.password ? 'true' : undefined}
			/>
			{#if $mainFormErrors.password}
				<div class="label">
					<span class="label-text-alt text-error">{$mainForm.password}</span>
				</div>
			{/if}
			<input
				type="password"
				placeholder="Confirm Password"
				name="confirmPassword"
				class={`input input-bordered w-full mb-5 ${$mainFormErrors.confirmPassword && 'input-error'}`}
				bind:value={$mainForm.confirmPassword}
				aria-invalid={$mainFormErrors.confirmPassword ? 'true' : undefined}
			/>
			{#if $mainForm.confirmPassword}
				<div class="label">
					<span class="label-text-alt text-error">{$mainFormErrors.confirmPassword}</span>
				</div>
			{/if}
		</form>
		<button type="submit" class="btn btn-block btn-primary mb-5">Register</button>
		<button type="button" class="btn btn-block" on:click={() => (continueWithEmail = false)}>Cancel</button>
	</div>
</div>
