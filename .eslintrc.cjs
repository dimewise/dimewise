/** @type { import("eslint").Linter.Config } */
module.exports = {
	root: true,
	env: {
		browser: true,
		es2017: true,
		node: true,
	},
	parser: '@typescript-eslint/parser',
	parserOptions: {
		sourceType: 'module',
		ecmaVersion: 2020,
		extraFileExtensions: ['.svelte'],
	},
	plugins: ['@typescript-eslint', '@stylistic/js'],
	overrides: [
		{
			files: ['*.svelte'],
			parser: 'svelte-eslint-parser',
			parserOptions: {
				parser: '@typescript-eslint/parser',
			},
		},
	],
	ignorePatterns: ['supabase'],
	extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'plugin:svelte/recommended', 'prettier'],
	rules: {
		// Stylistic
		'@stylistic/js/max-len': [
			'warn',
			{
				code: 120,
				tabWidth: 2,
				ignoreUrls: true,
				ignoreComments: true,
			},
		],
		'@stylistic/js/arrow-parens': ['warn', 'as-needed'],
		'@stylistic/js/block-spacing': ['warn', 'always'],
		'@stylistic/js/no-multiple-empty-lines': ['warn', { max: 1, maxEOF: 1 }],
		'@stylistic/js/max-statements-per-line': ['warn', { max: 1 }],
		'@stylistic/js/one-var-declaration-per-line': ['warn', 'always'],
		'@stylistic/js/operator-linebreak': ['warn', 'none'],

		// Typescript
		'arrow-body-style': ['error', 'as-needed'],
		'no-nested-ternary': 'warn',
		'no-unneeded-ternary': 'warn',
		'operator-assignment': ['warn', 'always'],
		'max-depth': ['warn', 1],
		'max-lines-per-function': [
			'warn',
			{
				max: 10,
				skipBlankLines: true,
				skipComments: true,
			},
		],
		'max-nested-callbacks': ['warn', 1],
		'max-params': ['warn', 2],
		'no-magic-numbers': [
			'warn',
			{
				detectObjects: false,
				enforceConst: true,
				ignore: [-1, 0, 1, 2, 10, 100],
				ignoreArrayIndexes: true,
			},
		],
		curly: ['warn', 'all'],
		'@typescript-eslint/explicit-member-accessibility': [
			'warn',
			{
				accessibility: 'no-public',
				overrides: {
					parameterProperties: 'explicit',
				},
			},
		],
		'@typescript-eslint/explicit-function-return-type': 'warn',
		'@typescript-eslint/no-unused-vars': 'warn',
		'@typescript-eslint/no-useless-constructor': 'warn',
		'@typescript-eslint/no-empty-function': 'warn',

		// Svelte
		'svelte/no-target-blank': 'error',
		'svelte/button-has-type': [
			'error',
			{
				button: true,
				submit: true,
				reset: true,
			},
		],
		'svelte/no-ignored-unsubscribe': 'error',
		'svelte/no-inline-styles': 'error',
		'svelte/require-each-key': 'error',
		'svelte/require-event-dispatcher-types': 'error',
		'svelte/require-stores-init': 'error',
		'svelte/valid-each-key': 'error',
		'svelte/prefer-class-directive': 'error',
		'svelte/shorthand-attribute': 'error',
		'svelte/shorthand-directive': 'error',
	},
};
