<script lang="ts">
	import Icon from '@iconify/svelte';
	import { writable } from 'svelte/store';
	import { _ } from 'svelte-i18n';

	const drawerOpen = writable(false);

	function toggleDrawer(): void {
		drawerOpen.update((value) => !value);
	}
</script>

<header>
	<nav>
		<!--Desktop Navbar-->
		<div class="navbar hidden bg-base-100 px-4 lg:flex">
			<div class="flex-1">
				<a class="text-xl font-bold" href="/">Dimewise</a>
			</div>
			<div class="flex-none">
				<ul class="menu menu-horizontal px-1">
					<li><a href="/auth/login">Login</a></li>
				</ul>
			</div>
		</div>
		<!--Mobile/Tablet Navbar-->
		<div class="drawer drawer-end lg:hidden">
			<input id="dw-drawer" bind:checked={$drawerOpen} type="checkbox" class="drawer-toggle" />
			<!-- Navbar -->
			<div class="drawer-content flex flex-col">
				<div class="navbar w-full bg-base-100 px-4">
					<div class=" flex-1"><a class="text-xl font-bold" href="/">{$_('app.name')}</a></div>
					<div class="flex-none">
						<label for="dw-drawer" aria-label="open sidebar" class="btn btn-square btn-ghost">
							<Icon icon="jam:menu" class="text-4xl" />
						</label>
					</div>
				</div>
			</div>
			<!-- Sidebar Content -->
			<div class="drawer-side">
				<label for="dw-drawer" aria-label="close sidebar" class="drawer-overlay"></label>
				<div class="flex min-h-full w-80 flex-col bg-base-100 p-4">
					<ul class="menu flex-1">
						<li class="flex-none"><a href="/" on:click={toggleDrawer}>{$_('page.home')}</a></li>
						<li class="flex-none">
							<a href="/terms-of-service" on:click={toggleDrawer}>{$_('page.terms-of-service')}</a>
						</li>
						<li class="flex-none"><a href="/privacy-policy" on:click={toggleDrawer}>{$_('page.privacy-policy')}</a></li>
					</ul>
					<div class="flex w-full flex-none flex-col items-center justify-center gap-3">
						<a class="btn btn-primary btn-wide" href="/auth/login" on:click={toggleDrawer}>{$_('button.login')}</a>
						<a class="btn btn-secondary btn-wide" href="/auth/register" on:click={toggleDrawer}>
							{$_('button.register')}
						</a>
					</div>
				</div>
			</div>
		</div>
	</nav>
</header>
