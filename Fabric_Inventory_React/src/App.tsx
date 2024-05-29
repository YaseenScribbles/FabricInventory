import "bootstrap/dist/css/bootstrap.min.css";
import { RouterProvider } from "react-router-dom";
import { UserContextProvider } from "./contexts/UserContext";
import router from "./router";
import { NotificationContextProvider } from "./contexts/NotificationsContext";
import { Provider } from "react-redux";
import { Store } from "./store/Store";

function App() {
    return (
        <>
            <UserContextProvider>
                <NotificationContextProvider>
                    <Provider store={Store}>
                        <RouterProvider router={router} />
                    </Provider>
                </NotificationContextProvider>
            </UserContextProvider>
        </>
    );
}

export default App;
