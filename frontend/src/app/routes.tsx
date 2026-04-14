import { createBrowserRouter } from "react-router-dom";
import Layout from "./components/Layout";
import { InputScreen } from "./screens/InputScreen";
import { ResultsScreen } from "./screens/ResultsScreen";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <InputScreen />,
      },
      {
        path: "results",
        element: <ResultsScreen />,
      },
    ],
  },
]);
