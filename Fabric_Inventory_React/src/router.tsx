import { createBrowserRouter } from "react-router-dom";
import { LogIn } from "./pages/Login";
import { Layout } from "./components/Layout";
import Stores from "./pages/Stores/Stores";
import Fabrics from "./pages/Fabrics/Fabrics";
import Colors from "./pages/Colors/Colors";
import { Users } from "./pages/Users/Users";
import Receipts from "./pages/Receipts/Receipts";

const router = createBrowserRouter([
    {
        path: "/login",
        element: <LogIn />,
    },
    {
        path: "/",
        element: <Layout />,
        children: [
            {
                path: "/stores",
                element: <Stores />,
            },
            {
                path: "/fabrics",
                element: <Fabrics />,
            },
            {
                path: "/colors",
                element: <Colors />,
            },
            {
                path: "/users",
                element: <Users />,
            },
            {
                path:"/receipts",
                element: <Receipts />
            }
        ],
    },
]);

export default router;
