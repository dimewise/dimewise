import { MotionConfig } from "framer-motion";
import { Provider } from "react-redux";
import { RouterProvider } from "react-router";
import { ThemeProvider } from "./lib/theme";
import { router } from "./routes/Router";
import { store } from "./store/store";

function App() {
	return (
		<MotionConfig reducedMotion="user">
			<ThemeProvider>
				<Provider store={store}>
					<RouterProvider router={router} />
				</Provider>
			</ThemeProvider>
		</MotionConfig>
	);
}

export default App;
