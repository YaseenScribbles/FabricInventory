import { createBrowserRouter } from "react-router-dom";
import { LogIn } from "./pages/Login";
import { Layout } from "./components/Layout";
import { Stores } from "./pages/Stores";
import { Fabrics } from "./pages/Fabrics";
import { Colors } from "./pages/Colors";
import { Users } from "./pages/Users/Users";

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
                path:"/users",
                element: <Users />
            }
        ],
    },
]);

export default router;
