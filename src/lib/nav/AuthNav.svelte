<script lang="ts">
	import { writable } from 'svelte/store';
	import { browser } from '$app/environment';
	import { _ } from 'svelte-i18n';
	import Icon from '@iconify/svelte';
	import type { PageData } from '../../routes/$types';
	import { invalidate } from '$app/navigation';

	export let data: PageData;
	$: ({ supabase } = data);
	const drawerOpen = writable(false);

	function toggleDrawer(): void {
		drawerOpen.update((value) => !value);
	}

	// this is needed in order to close details on click outside of the tag
	if (browser) {
		const details = document.querySelector('details');
		document.addEventListener('click', function (event) {
			if (details !== null && !details.contains(event.target as Node)) {
				details.removeAttribute('open');
			}
		});
	}

	const handleLogout = async (): Promise<void> => {
		await supabase.auth.signOut();
		invalidate('supabase:auth'); // needed to remove the session from the store
		if (browser) {
			const details = document.querySelector('details');
			details?.removeAttribute('open');
		}
		toggleDrawer();
	};
</script>

<header>
	<nav>
		<!--Desktop Navbar-->
		<div class="navbar hidden bg-base-100 px-4 lg:flex">
			<div class="flex-1">
				<a class="text-xl font-bold" href="/dashboard">Dimewise</a>
			</div>
			<div class="flex-none">
				<div class="dropdown dropdown-end cursor-pointer">
					<!--TODO: add conditional statement for avatar url checks-->
					<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
					<div class="avatar placeholder" tabindex="0">
						<div class="w-12 rounded-full bg-neutral text-neutral-content">
							<span class="text-xl">PL</span>
						</div>
					</div>
					<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
					<ul tabindex="0" class="menu dropdown-content z-[1] w-52 rounded-box bg-base-100 p-2 shadow">
						<li>
							<a href="/dashboard/profile">
								<Icon icon="iconamoon:profile-fill" class="text-xl" />{$_('page.profile')}
							</a>
						</li>
						<li>
							<a href="/dashboard/accounts/switch">
								<Icon icon="heroicons-outline:switch-horizontal" class="text-xl" />{$_('page.switch-accounts')}
							</a>
						</li>
						<div class="divider my-0"></div>
						<li>
							<a on:click={handleLogout} href="/">
								<Icon icon="material-symbols:logout" class="text-xl" />{$_('button.logout')}
							</a>
						</li>
					</ul>
				</div>
			</div>
		</div>
		<!--Mobile/Tablet Navbar-->
		<div class="drawer drawer-end lg:hidden">
			<input id="dw-drawer" bind:checked={$drawerOpen} type="checkbox" class="drawer-toggle" />
			<!-- Navbar -->
			<div class="drawer-content flex flex-col">
				<div class="navbar w-full bg-base-100 px-4">
					<div class=" flex-1"><a class="text-xl font-bold" href="/dashboard">{$_('app.name')}</a></div>
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
						<li class="flex-none"><a href="/dashboard" on:click={toggleDrawer}>{$_('page.dashboard')}</a></li>
						<li class="flex-none"><a href="/dashboard/profile" on:click={toggleDrawer}>{$_('page.profile')}</a></li>
						<li class="flex-none">
							<a href="/dashboard/accounts/switch" on:click={toggleDrawer}>{$_('page.switch-accounts')}</a>
						</li>
					</ul>
					<div class="flex w-full flex-none flex-col items-center justify-center gap-3">
						<a class="btn btn-primary btn-wide" href="/" on:click={handleLogout}>{$_('button.logout')}</a>
					</div>
				</div>
			</div>
		</div>
	</nav>
</header>
