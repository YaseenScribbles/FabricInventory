import { Button, Form, Spinner } from "react-bootstrap";
import "./Login.css";
import { useState } from "react";
import axios from "axios";
import { LOCAL_URL } from "../assets/common";
import { useUserContext } from "../contexts/UserContext";
import { Navigate } from "react-router";
import { useNotificationContext } from "../contexts/NotificationsContext";

interface Credential {
    email: string;
    password: string;
}

export const LogIn: React.FC = () => {
    const { user, setUser } = useUserContext();
    const { notifications, setNotifications } = useNotificationContext();

    if (user) {
        return <Navigate to="/" />;
    }

    const [credential, setCredential] = useState<Credential>({
        email: "",
        password: "",
    });

    const [loading, setLoading] = useState<boolean>(false);

    const logIn = async () => {
        setLoading(true);
        try {
            const response = await axios.post(
                `${LOCAL_URL}/login`,
                credential,
                {
                    headers: {
                        Accept: "application/json",
                    },
                }
            );

            const { data } = response;
            setNotifications({
                message: data.message,
                result: "success",
            });

            setUser(data.user);
            return <Navigate to={"/"} />;
        } catch (error: any) {
            const { response } = error;
            setNotifications({
                message: response.data.message,
                result: "failure",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div id="login-page">
            <div id="login-form">
                <h1 className="logo line-1">FABRIC</h1>
                <h1 className="logo line-2">INVENTORY</h1>
                <h5 className="mt-3">Sign in</h5>
                <Form>
                    <Form.Group className="my-3">
                        <Form.Control
                            type="email"
                            placeholder="Email"
                            onChange={(e) =>
                                setCredential((prev) => ({
                                    ...prev,
                                    email: e.target.value,
                                }))
                            }
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Control
                            type="password"
                            placeholder="Password"
                            onChange={(e) => {
                                setCredential((prev) => ({
                                    ...prev,
                                    password: e.target.value,
                                }));
                            }}
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Button
                            type="button"
                            variant="success"
                            className="w-100"
                            onClick={logIn}
                        >
                            {loading && (
                                <Spinner
                                    as="span"
                                    animation="grow"
                                    size="sm"
                                    role="status"
                                    aria-hidden="true"
                                />
                            )}
                            {loading ? " Loading" : " Sign in"}
                        </Button>
                    </Form.Group>
                </Form>
                {notifications.length > 0 && (
                    <div className="text-center mt-0">
                        {notifications.map((n, i) => (
                            <p
                                key={i}
                                className={`d-block text-${
                                    n.result === "success"
                                        ? "success"
                                        : "danger"
                                }`}
                            >
                                {n.message.toUpperCase()}
                            </p>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
