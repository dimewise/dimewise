<script lang="ts">
	import { writable } from 'svelte/store';

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
					<div class=" flex-1"><a class="text-xl font-bold" href="/">Dimewise</a></div>
					<div class="flex-none">
						<label for="dw-drawer" aria-label="open sidebar" class="btn btn-square btn-ghost">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								class="inline-block h-6 w-6 stroke-current"
								><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"
								></path></svg
							>
						</label>
					</div>
				</div>
			</div>
			<!-- Sidebar Content -->
			<div class="drawer-side">
				<label for="dw-drawer" aria-label="close sidebar" class="drawer-overlay"></label>
				<div class="flex min-h-full w-80 flex-col bg-base-100 p-4">
					<ul class="menu flex-1">
						<li class="flex-none"><a href="/" on:click={toggleDrawer}>Home</a></li>
						<li class="flex-none"><a href="/terms-of-service" on:click={toggleDrawer}>Terms of Service</a></li>
						<li class="flex-none"><a href="/privacy-policy" on:click={toggleDrawer}>Privacy Policy</a></li>
					</ul>
					<div class="flex w-full flex-none flex-col items-center justify-center gap-3">
						<a class="btn btn-primary btn-wide" href="/auth/login" on:click={toggleDrawer}>Login</a>
						<a class="btn btn-secondary btn-wide" href="/auth/register" on:click={toggleDrawer}>Register</a>
					</div>
				</div>
			</div>
		</div>
	</nav>
</header>
