import {
    Container,
    Nav,
    NavDropdown,
    Navbar,
    Spinner,
    Toast,
    ToastContainer,
} from "react-bootstrap";
import { Navigate, Outlet, useLocation } from "react-router";
import { useUserContext } from "../contexts/UserContext";
import { useNotificationContext } from "../contexts/NotificationsContext";
import axios from "axios";
import { LOCAL_URL } from "../assets/common";
import { useState } from "react";

export const Layout = () => {
    const { user, removeUser } = useUserContext();
    const { notifications, setNotifications } = useNotificationContext();
    const [loading, setLoading] = useState(false);
    const location = useLocation();

    if (!user) {
        return <Navigate to={"/login"} />;
    }

    const logOut = async () => {
        setLoading(true);
        try {
            const response = await axios.post(`${LOCAL_URL}/logout`, null, {
                headers: { Accept: "application/json" },
            });
            const { data } = response;
            setNotifications({
                message: data.message,
                result: "success",
            });
            removeUser();
        } catch (error: any) {
            const { response } = error;
            console.log(response);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div id="layout">
            <Navbar bg="light" data-bs-theme="light">
                <Container>
                    <Navbar.Brand href="/">Fabric Inventory</Navbar.Brand>
                    <Nav className="me-auto">
                        <Nav.Link
                            href="/users"
                            active={location.pathname === "/users"}
                        >
                            Users
                        </Nav.Link>
                        <Nav.Link
                            href="/stores"
                            active={location.pathname === "/stores"}
                        >
                            Stores
                        </Nav.Link>
                        <Nav.Link
                            href="/fabrics"
                            active={location.pathname === "/fabrics"}
                        >
                            Fabrics
                        </Nav.Link>
                        <Nav.Link
                            href="/colors"
                            active={location.pathname === "/colors"}
                        >
                            Colors
                        </Nav.Link>
                    </Nav>
                    <Nav>
                        <NavDropdown title={`${user.name.toUpperCase()}`}>
                            <NavDropdown.Item onClick={logOut}>
                                Logout
                            </NavDropdown.Item>
                        </NavDropdown>
                    </Nav>
                </Container>
            </Navbar>
            {loading && (
                <div className="text-center">
                    <Spinner animation="grow" variant="secondary" />
                </div>
            )}
            <ToastContainer
                position="top-end"
                className="p-3"
                style={{ zIndex: 1 }}
            >
                {notifications.map((n, i) => {
                    return (
                        <Toast
                            key={i}
                            bg={`${
                                n.result === "success" ? "success" : "warning"
                            }`}
                        >
                            <Toast.Header>
                                <strong className="me-auto">
                                    Fabric Inventory
                                </strong>
                            </Toast.Header>
                            <Toast.Body>
                                <b className={`${n.result === 'success' && 'text-light'}`}>{`${n.message.toUpperCase()}`}</b>
                            </Toast.Body>
                        </Toast>
                    );
                })}
            </ToastContainer>
            <Outlet />
        </div>
    );
};
