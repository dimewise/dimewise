<script lang="ts">
	import { HttpStatusCode } from '$lib/utils/HttpStatusCodes';
	import Icon from '@iconify/svelte';
	import { superForm } from 'sveltekit-superforms/client';
	import { fly } from 'svelte/transition';
	import { _ } from 'svelte-i18n';
	import type { PageData } from './$types';

	// form submission
	export let data: PageData;
	export let validatedEmail: string;
	export let continueWithEmail: boolean;
	const { form, errors, enhance } = superForm(data.validateEmailForm, {
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

	// modal handling
	const handleCloseModal = (): void => {
		const errorModal = document.getElementById('auth_register_500_error_modal') as HTMLDialogElement;
		errorModal.close();
	};

	// social login
	let socialButtons = [
		{ icon: 'bxl:facebook-circle', text: 'Facebook', variant: '' },
		{ icon: 'bxl:google', text: 'Google', variant: '' },
		{ icon: 'bxl:apple', text: 'Apple', variant: '' },
	];
</script>

<div in:fly class="flex flex-col items-center justify-center gap-5">
	<div class="flex flex-col items-center justify-center">
		<h2 class="my-0">Create an account</h2>
		<p>Enter your email below to create your account</p>
		<form method="POST" action="?/validateEmail" use:enhance class="flex flex-col w-full">
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
			<button type="submit" class="btn btn-block">{$_('button.continue')}</button>
		</form>
	</div>
	<div class="divider uppercase text-xs">or continue with</div>
	<div class="w-full flex flex-col items-center justify-center gap-4">
		{#each socialButtons as { icon, text, variant }, index (index)}
			<button type="button" class={`btn btn-block btn-outline max-w-xs ${variant}`}>
				<span><Icon {icon} class="text-xl" /></span>
				{text}
			</button>
		{/each}
	</div>
	<p class="text-center text-sm w-full max-w-xs">
		By clicking continue, you agree to our <a href="/terms-of-service">Terms of Service</a> and
		<a href="/privacy-policy">Privacy Policy</a>
	</p>
	<dialog id="auth_register_500_error_modal" class="modal">
		<div class="modal-box">
			<p class="text-lg font-bold">Error</p>
			<p class="text-sm">An error occurred while trying to register your account. Please try again later.</p>
			<div class="modal-action">
				<button class="btn btn-primary" on:click={handleCloseModal} type="button">{$_('button.ok')}</button>
			</div>
		</div>
	</dialog>
</div>
