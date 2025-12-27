import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
	/**
	 * Specify your server-side environment variables schema here. This way you can ensure the app
	 * isn't built with invalid env vars.
	 */
	server: {
		DATABASE_URL: z.string().url(),
		CONFIG_DATABASE_URL: z.string().url(),
		NODE_ENV: z
			.enum(["development", "test", "production"])
			.default("development"),
		SUPABASE_SERVICE_ROLE_KEY: z.string(),
		// Stripe
		STRIPE_SECRET_KEY: z.string().min(1),
		STRIPE_WEBHOOK_SECRET: z.string().min(1),
		// Shippo
		SHIPPO_API_KEY: z.string().min(1),
		SHIPPO_WEBHOOK_SECRET: z.string().min(1),
		// Platform settings
		PLATFORM_FEE_PERCENTAGE: z.string().default("10"),
	},

	/**
	 * Specify your client-side environment variables schema here. This way you can ensure the app
	 * isn't built with invalid env vars. To expose them to the client, prefix them with
	 * `NEXT_PUBLIC_`.
	 */
	client: {
		// NEXT_PUBLIC_CLIENTVAR: z.string(),
		NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
		NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string(),
		NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().min(1),
	},

	/**
	 * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
	 * middlewares) or client-side so we need to destruct manually.
	 */
	runtimeEnv: {
		DATABASE_URL: process.env.DATABASE_URL,
		CONFIG_DATABASE_URL: process.env.CONFIG_DATABASE_URL,
		NODE_ENV: process.env.NODE_ENV,
		NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
		NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
		SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
		// Stripe
		STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
		STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
		NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:
			process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
		// Shippo
		SHIPPO_API_KEY: process.env.SHIPPO_API_KEY,
		SHIPPO_WEBHOOK_SECRET: process.env.SHIPPO_WEBHOOK_SECRET,
		// Platform settings
		PLATFORM_FEE_PERCENTAGE: process.env.PLATFORM_FEE_PERCENTAGE,
		// NEXT_PUBLIC_CLIENTVAR: process.env.NEXT_PUBLIC_CLIENTVAR,
	},
	/**
	 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
	 * useful for Docker builds.
	 */
	skipValidation: !!process.env.SKIP_ENV_VALIDATION,
	/**
	 * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
	 * `SOME_VAR=''` will throw an error.
	 */
	emptyStringAsUndefined: true,
});
