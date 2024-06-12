import { createBrowserRouter } from "react-router-dom";
import { LogIn } from "./pages/Login";
import { Layout } from "./components/Layout";
import Stores from "./pages/Stores/Stores";
import Fabrics from "./pages/Fabrics/Fabrics";
import Colors from "./pages/Colors/Colors";
import { Users } from "./pages/Users/Users";
import Receipts from "./pages/Receipts/Receipts";
import ReceiptDocument from "./assets/ReceiptDocument";
import Companies from "./pages/Companies/Companies";

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
                path: "/companies",
                element: <Companies />,
            },
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
                path: "/receipts",
                element: <Receipts />,
            },
        ],
    },
    {
        path: "/receipt-report/:id",
        element: <ReceiptDocument />,
    },
]);

export default router;
