// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces

import type { HttpStatusCode } from '$lib/utils/HttpStatusCodes';
import { SupabaseClient, Session } from '@supabase/supabase-js';

declare global {
	namespace App {
		interface Locals {
			supabase: SupabaseClient;
			getSession(): Promise<Session | null>;
		}
		interface PageData {
			session: Session | null;
		}
		namespace Superforms {
			type Message = {
				success: boolean;
				status: HttpStatusCode;
				message?: string;
			};
		}
	}
}

export {};
