/** @type {import('tailwindcss').Config} */
export default {
	daisyui: {
		themes: [
			// {
			// 	dimewise: {
			// 		primary: "#20C997",
			// 		secondary: "#FFC107",
			// 		accent: "#9b59b6",
			// 		"base-100": "#1C1C1C",
			// 		info: "#3498db",
			// 		success: "#28A745",
			// 		warning: "#F39C12",
			// 		error: "#E74C3C",
			// 	},
			// },
			"emerald",
		],
	},
	content: [
		"./index.html",
		"./src/**/*.{js,ts,jsx,tsx}",
		"node_modules/daisyui/dist/**/*.js",
		"node_modules/react-daisyui/dist/**/*.js",
	],
	theme: {
		extend: {
			fontFamily: {
				sans: [
					'"Inter"',
					"system-ui",
					"-apple-system",
					"BlinkMacSystemFont",
					'"Segoe UI"',
					"Roboto",
					'"Helvetica Neue"',
					"Arial",
					'"Noto Sans"',
					"sans-serif",
					'"Apple Color Emoji"',
					'"Segoe UI Emoji"',
					'"Segoe UI Symbol"',
					'"Noto Color Emoji"',
				],
			},
			height: {
				navbar: "64px",
			},
		},
	},
	plugins: [require("@tailwindcss/typography"), require("daisyui")],
};
