import "bootstrap/dist/css/bootstrap.min.css";
import { RouterProvider } from "react-router-dom";
import { UserContextProvider } from "./contexts/UserContext";
import router from "./router";
import { NotificationContextProvider } from "./contexts/NotificationsContext";

function App() {
    return (
        <>
            <UserContextProvider>
                <NotificationContextProvider>
                    <RouterProvider router={router} />
                </NotificationContextProvider>
            </UserContextProvider>
        </>
    );
}

export default App;
