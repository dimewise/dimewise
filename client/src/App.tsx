import { Provider } from "react-redux";
import { RouterProvider } from "react-router-dom";
import { Router } from "./app/Router";
import { store } from "./store/store";

export const App = () => {
  return (
    <Provider store={store}>
      <RouterProvider router={Router} />
    </Provider>
  );
};
