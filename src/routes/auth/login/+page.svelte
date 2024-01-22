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
	<div class="flex max-w-xs flex-col items-center justify-center gap-5">
		<div class="flex flex-col items-center justify-center">
			<h2 class="my-0">{$_('page.login.title')}</h2>
			<p>{$_('page.login.choose-preferred-login-method')}</p>
			<form>
				<div class="label">
					<span class="label-text">{$_('page.login.email')}</span>
				</div>
				<input type="text" placeholder="name@example.com" class="input input-bordered mb-5 w-full" />
				<div class="label">
					<span class="label-text">{$_('page.login.password')}</span>
				</div>
				<input type="password" placeholder="password" class="input input-bordered mb-5 w-full" />
				<button type="submit" class="btn btn-block">{$_('button.login')}</button>
			</form>
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

		<div class="flex w-full flex-col items-start justify-center gap-1">
			<p class="my-1">
				{$_('page.login.register-prompt')} <a href="/register">{$_('page.register')}</a>
			</p>
			<a href="/reset-password">{$_('page.login.reset-password')}</a>
			<p></p>
		</div>
	</div>
</section>
