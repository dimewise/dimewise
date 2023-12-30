/** @type { import("eslint").Linter.Config } */
module.exports = {
	root: true,
	extends: [
		'eslint:recommended',
		'plugin:@typescript-eslint/recommended',
		'plugin:svelte/recommended',
		'prettier',
	],
	rules: {
		'arrow-body-style': ['error', 'as-needed'],
		'max-statements-per-line': ['warn', { max: 1 }],
		'no-nested-ternary': 'warn',
		'no-unneeded-ternary': 'warn',
		'one-var-declaration-per-line': ['warn', 'always'],
		'operator-assignment': ['warn', 'always'],
		'operator-linebreak': ['warn', 'none'],
		'max-depth': ['warn', 1],
		'max-lines-per-function': ['warn', { max: 10, skipBlankLines: true, skipComments: true }],
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
		'arrow-parens': ['warn', 'as-needed'],
		'block-spacing': ['warn', 'always'],
		curly: ['warn', 'all'],
		'no-multiple-empty-lines': ['warn', { max: 1, maxEOF: 1 }],
		'no-unused-vars': 'off',
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
	parser: '@typescript-eslint/parser',
	plugins: ['@typescript-eslint'],
	parserOptions: {
		sourceType: 'module',
		ecmaVersion: 2020,
		extraFileExtensions: ['.svelte'],
	},
	env: {
		browser: true,
		es2017: true,
		node: true,
	},
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
};
