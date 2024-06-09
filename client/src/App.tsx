import { Provider } from "react-redux";
import { RouterProvider } from "react-router-dom";
import { PersistGate } from "redux-persist/integration/react";
import { Router } from "./app/Router";
import { persistor, store } from "./store/store";

export const App = () => {
	return (
		<Provider store={store}>
			<PersistGate
				loading={null}
				persistor={persistor}
			>
				<RouterProvider router={Router} />
			</PersistGate>
		</Provider>
	);
};
