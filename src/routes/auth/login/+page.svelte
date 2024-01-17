<script>
	import Icon from '@iconify/svelte';
	import { _ } from 'svelte-i18n';

	let socialButtons = [
		{ icon: 'bxl:facebook-circle', text: 'Facebook', variant: '' },
		{ icon: 'bxl:google', text: 'Google', variant: '' },
		{ icon: 'bxl:apple', text: 'Apple', variant: '' },
	];
</script>

<svelte:head>
	<title>Login</title>
	<meta name="login" content="Login page for Dimewise" />
</svelte:head>

<section class="prose m-auto min-h-full">
	<div class="flex flex-col items-center justify-center gap-5">
		<div class="flex flex-col items-center justify-center">
			<h2 class="my-0">Create an account</h2>
			<p>Enter your email below to create your account</p>
			<input type="text" placeholder="name@example.com" class="input input-bordered mb-5 w-full" />
			<button type="button" class="btn btn-block">{$_('button.continue')}</button>
		</div>

		<div class="divider text-xs uppercase">or continue with</div>

		<div class="flex w-full flex-col items-center justify-center gap-4">
			{#each socialButtons as { icon, text, variant }, index (index)}
				<button type="button" class={`btn btn-outline btn-block max-w-xs ${variant}`}>
					<span><Icon {icon} class="text-xl" /></span>
					{text}
				</button>
			{/each}
		</div>

		<p class="w-full max-w-xs text-center text-sm">
			By clicking continue, you agree to our <a href="/terms-of-services">Terms of Service</a> and
			<a href="/privacy-policy">Privacy Policy</a>
		</p>
	</div>
</section>
