<script lang="ts">
	import { HttpStatusCode } from '$lib/utils/HttpStatusCodes';
	import type { PageData } from '../../routes/auth/register/$types';
	import Icon from '@iconify/svelte';
	import { superForm } from 'sveltekit-superforms/client';
	import { fly } from 'svelte/transition';

	export let data: PageData;
	export let toggleContinueWithEmail: () => void;
	const { form, errors, enhance, message } = superForm(data.validateEmailForm, {
		resetForm: true,
		autoFocusOnError: 'detect',
		onUpdated: ({ form }) => {
			const message = form.message;
			if (message?.success && message?.status === HttpStatusCode.OK) {
				toggleContinueWithEmail();
			} else if (!message?.success && message?.status === HttpStatusCode.InternalServerError) {
				// TODO: Handle error with custom toast or third party library with daisy
				console.error(message);
			}
		},
	});

	let socialButtons = [
		{ icon: 'bxl:facebook-circle', text: 'Facebook', variant: '' },
		{ icon: 'bxl:google', text: 'Google', variant: '' },
		{ icon: 'bxl:apple', text: 'Apple', variant: '' },
	];

	if ($errors) {
		console.error($errors.email);
	}

	// TODO: add toast for message?
	console.log($message);
</script>

<div in:fly={{ duration: 300 }} class="flex flex-col items-center justify-center gap-5">
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
			<button type="submit" class="btn btn-block">Continue</button>
		</form>
	</div>
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
</div>
