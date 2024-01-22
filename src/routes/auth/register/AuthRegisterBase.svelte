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
		resetForm: false,
		autoFocusOnError: 'detect',
		onUpdated: ({ form }) => {
			const message = form.message;
			if (message?.success && message?.status === HttpStatusCode.OK) {
				validatedEmail = form.data.email;
				continueWithEmail = true;
			} else if (!message?.success && message?.status === HttpStatusCode.InternalServerError) {
				// TODO: message is available for use
				const errorModal = document.getElementById('auth_register_error_modal') as HTMLDialogElement;
				errorModal.showModal();
			}
		},
		// TODO: consider setting onError as a catch all
	});

	// social login
	let socialButtons = [
		{ icon: 'bxl:facebook-circle', text: 'Facebook', variant: '' },
		{ icon: 'bxl:google', text: 'Google', variant: '' },
		{ icon: 'bxl:apple', text: 'Apple', variant: '' },
	];
</script>

<div in:fly class="flex flex-col items-center justify-center gap-5">
	<div class="flex flex-col items-center justify-center">
		<h2 class="my-0">{$_('page.register.title')}</h2>
		<p>{$_('page.register.email-field-indicator')}</p>
		<form method="POST" action="?/validateEmail" use:enhance class="flex w-full flex-col">
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
	<div class="divider text-xs uppercase">{$_('page.register.continue-with')}</div>
	<div class="flex w-full flex-col items-center justify-center gap-4">
		{#each socialButtons as { icon, text, variant }, index (index)}
			<button type="button" class={`btn btn-outline btn-block max-w-xs ${variant}`}>
				<span><Icon {icon} class="text-xl" /></span>
				{text}
			</button>
		{/each}
	</div>
	<p class="w-full max-w-xs text-center text-sm">
		<!-- TODO: search for a better way to localize text with links-->
		{$_('page.register.tos-pp-compliance-1')}
		<a href="/terms-of-service">{$_('page.terms-of-service')}</a>
		{$_('page.register.tos-pp-compliance-2')}
		<a href="/privacy-policy">{$_('page.privacy-policy')}</a>
	</p>
</div>
