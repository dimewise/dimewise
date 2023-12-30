/** @type { import("eslint").Linter.Config } */
module.exports = {
	root: true,
	extends: [
		'eslint:recommended',
		'plugin:@typescript-eslint/recommended',
		'plugin:svelte/recommended',
		'prettier'
	],
	rules: {
		'svelte/no-target-blank': 'error',
		'svelte/button-has-type': [
			'error',
			{
				button: true,
				submit: true,
				reset: true
			}
		],
		'svelte/no-ignored-unsubscribe': 'error',
		'svelte/no-inline-styles': 'error',
		'svelte/require-each-key': 'error',
		'svelte/require-event-dispatcher-types': 'error',
		'svelte/require-stores-init': 'error',
		'svelte/valid-each-key': 'error',
		'svelte/prefer-class-directive': 'error',
		'svelte/shorthand-attribute': 'error',
		'svelte/shorthand-directive': 'error'
	},
	parser: '@typescript-eslint/parser',
	plugins: ['@typescript-eslint'],
	parserOptions: {
		sourceType: 'module',
		ecmaVersion: 2020,
		extraFileExtensions: ['.svelte']
	},
	env: {
		browser: true,
		es2017: true,
		node: true
	},
	overrides: [
		{
			files: ['*.svelte'],
			parser: 'svelte-eslint-parser',
			parserOptions: {
				parser: '@typescript-eslint/parser'
			}
		}
	]
};
