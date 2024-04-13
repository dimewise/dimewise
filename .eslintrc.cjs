module.exports = {
	root: true,
	env: { browser: true, es2020: true },
	extends: [
		'eslint:recommended',
		'plugin:@typescript-eslint/strict-type-checked',
		'plugin:@typescript-eslint/stylistic-type-checked',
		'plugin:react/recommended',
		'plugin:react/jsx-runtime',
		'plugin:react-hooks/recommended',
		'prettier',
	],
	ignorePatterns: ['dist', '.eslintrc.cjs'],
	parser: '@typescript-eslint/parser',
	parserOptions: {
		ecmaVersion: 'latest',
		sourceType: 'module',
		project: ['./tsconfig.json', './tsconfig.node.json'],
		tsconfigRootDir: __dirname,
	},
	plugins: ['react-refresh', '@stylistic/js'],
	rules: {
		'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
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
		'@stylistic/js/block-spacing': ['warn', 'always'],
		'@stylistic/js/no-multiple-empty-lines': ['warn', { max: 1, maxEOF: 1 }],
		'@stylistic/js/max-statements-per-line': ['warn', { max: 1 }],
		'@stylistic/js/one-var-declaration-per-line': ['warn', 'always'],

		// Typescript
		'arrow-body-style': ['error', 'as-needed'],
		'no-nested-ternary': 'warn',
		'no-unneeded-ternary': 'warn',
		'operator-assignment': ['warn', 'always'],
		'max-depth': ['warn', 2],
		'max-lines-per-function': [
			'warn',
			{
				max: 100,
				skipBlankLines: true,
				skipComments: true,
			},
		],
		'max-nested-callbacks': ['warn', 10],
		'@typescript-eslint/no-magic-numbers': [
			'warn',
			{
				detectObjects: false,
				enforceConst: true,
				ignoreArrayIndexes: true,
				ignoreEnums: true,
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
	},
};
