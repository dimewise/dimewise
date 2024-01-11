<script lang="ts">
	import type { PageData } from './$types';
	import { HttpStatusCode } from '$lib/utils/HttpStatusCodes';
	import Icon from '@iconify/svelte';
	import { superForm } from 'sveltekit-superforms/client';
	import { fly } from 'svelte/transition';

	// form submission
	export let data: PageData;
	let validatedEmail = '';
	let continueWithEmail = false;
	const { form, errors, enhance } = superForm(data.validateMainForm, {
		resetForm: true,
		autoFocusOnError: 'detect',
		onUpdated: ({ form }) => {
			const message = form.message;
			if (message?.success && message?.status === HttpStatusCode.OK) {
				validatedEmail = form.data.email;
				continueWithEmail = true;
			} else if (!message?.success && message?.status === HttpStatusCode.InternalServerError) {
				// TODO: message is available for use
				const errorModal = document.getElementById('auth_register_500_error_modal') as HTMLDialogElement;
				errorModal.showModal();
			}
		},
		// TODO: consider setting onError as a catch all
	});

	// email uniqueness check
	function handleContinueWithEmail() {
		continueWithEmail = true;
	}

	// modal handling
	function handleCloseModal() {
		const errorModal = document.getElementById('auth_register_500_error_modal') as HTMLDialogElement;
		errorModal.close();
	}

	// social login
	let socialButtons = [
		{ icon: 'bxl:facebook-circle', text: 'Facebook', variant: '' },
		{ icon: 'bxl:google', text: 'Google', variant: '' },
		{ icon: 'bxl:apple', text: 'Apple', variant: '' },
	];
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>

<section class="prose min-h-full m-auto">
	<!-- {#if !continueWithEmail} -->
	<!-- 	<AuthRegisterBase bind:validatedEmail bind:continueWithEmail bind:data /> -->
	<!-- {:else} -->
	<!-- 	<AuthRegisterByEmail {validatedEmail} bind:continueWithEmail bind:data /> -->
	<!-- {/if} -->
	<div in:fly class="flex flex-col items-center justify-center gap-5">
		<div class="flex flex-col items-center justify-center">
			<h2 class="my-0">Create an account</h2>
			<p>Enter your email below to create your account</p>
			<form method="POST" action="?/register" use:enhance class="flex flex-col w-full">
				<div class="mb-5">
					<input
						type="email"
						placeholder="name@example.com"
						name="email"
						class={`input input-bordered w-full ${$errors.email && 'input-error'}`}
						bind:value={$form.email}
						aria-invalid={$errors.email ? 'true' : undefined}
					/>
					{#if $errors.email}
						<div class="label">
							<span class="label-text-alt text-error">{$errors.email}</span>
						</div>
					{/if}
				</div>
				{#if continueWithEmail}
					<div class="mb-5">
						<input
							type="password"
							placeholder="Password"
							name="password"
							class={`input input-bordered w-full ${$errors.password && 'input-error'}`}
							bind:value={$form.password}
							aria-invalid={$form.password ? 'true' : undefined}
						/>
						{#if $errors.password}
							<div class="label">
								<span class="label-text-alt text-error">{$errors.password}</span>
							</div>
						{/if}
					</div>
					<div class="mb-5">
						<input
							type="password"
							placeholder="Confirm Password"
							name="confirmPassword"
							class={`input input-bordered w-full ${$errors.confirmPassword && 'input-error'}`}
							bind:value={$form.confirmPassword}
							aria-invalid={$errors.confirmPassword ? 'true' : undefined}
						/>
						{#if $errors.confirmPassword}
							<div class="label">
								<span class="label-text-alt text-error">{$errors.confirmPassword}</span>
							</div>
						{/if}
					</div>
					<button type="submit" class="btn btn-block btn-primary mb-5">Register</button>
					<button type="button" class="btn btn-block" on:click={() => (continueWithEmail = false)}>Cancel</button>
				{/if}
				{#if !continueWithEmail}
					<button type="button" on:click={handleContinueWithEmail} class="btn btn-block">Continue</button>
				{/if}
			</form>
		</div>
		{#if !continueWithEmail}
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
				By clicking continue, you agree to our <a href="/terms-of-service">Terms of Service</a> and
				<a href="/privacy-policy">Privacy Policy</a>
			</p>
		{/if}
		<dialog id="auth_register_500_error_modal" class="modal">
			<div class="modal-box">
				<p class="text-lg font-bold">Error</p>
				<p class="text-sm">An error occurred while trying to register your account. Please try again later.</p>
				<div class="modal-action">
					<button class="btn btn-primary" on:click={handleCloseModal}>OK</button>
				</div>
			</div>
		</dialog>
	</div>
</section>
