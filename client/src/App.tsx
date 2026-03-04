import { MotionConfig } from "framer-motion";
import { Provider } from "react-redux";
import { RouterProvider } from "react-router";
import { router } from "./routes/Router";
import { store } from "./store/store";

function App() {
	return (
		<MotionConfig reducedMotion="user">
			<Provider store={store}>
				<RouterProvider router={router} />
			</Provider>
		</MotionConfig>
	);
}

export default App;
