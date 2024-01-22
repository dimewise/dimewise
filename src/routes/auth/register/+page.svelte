<script lang="ts">
	import type { PageData } from './$types';
	import AuthRegisterBase from './AuthRegisterBase.svelte';
	import AuthRegisterByEmail from './AuthRegisterByEmail.svelte';
	import { _ } from 'svelte-i18n';
	import AuthRegisterSuccess from './AuthRegisterSuccess.svelte';

	export let data: PageData;
	let validatedEmail = '';
	let continueWithEmail = false;
	let registrationSuccess = false;

	// modal handling
	const handleCloseModal = (): void => {
		console.log('clicked');
		const errorModal = document.getElementById('auth_register_error_modal') as HTMLDialogElement;
		errorModal.close();
	};
</script>

<svelte:head>
	<title>{$_('page.register.header')}</title>
	<meta name="description" content="Dimewise account registration" />
</svelte:head>

<section class="prose m-auto min-h-full">
	{#if !continueWithEmail && !registrationSuccess}
		<AuthRegisterBase bind:validatedEmail bind:continueWithEmail bind:data />
	{:else if continueWithEmail && !registrationSuccess}
		<AuthRegisterByEmail {validatedEmail} bind:continueWithEmail bind:data bind:registrationSuccess />
	{:else}
		<AuthRegisterSuccess />
	{/if}
	<!-- TODO: better error handling is needed here -->
	<dialog id="auth_register_error_modal" class="modal">
		<div class="modal-box">
			<p class="text-lg font-bold">{$_('error.error')}</p>
			<p class="text-sm">{$_('error.something-went-wrong')}</p>
			<div class="modal-action">
				<button class="btn btn-primary" on:click={handleCloseModal} type="button">{$_('button.ok')}</button>
			</div>
		</div>
	</dialog>
</section>
