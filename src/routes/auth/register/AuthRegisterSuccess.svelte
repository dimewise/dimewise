<script>
	import { _ } from 'svelte-i18n';
	import { fly } from 'svelte/transition';
</script>

<div in:fly class="flex flex-col items-center justify-center gap-5">
	<div class="flex flex-col items-center justify-center">
		<h2 class="my-0">{$_('page.register.success-message')}</h2>
	</div>
	<a class="btn btn-primary" href="/auth/login">{$_('page.login')}</a>
</div>
