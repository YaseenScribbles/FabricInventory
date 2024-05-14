import axios from "axios";
import { useState } from "react";
import {
    Button,
    Col,
    FloatingLabel,
    Form,
    Modal,
    Row,
    Spinner,
} from "react-bootstrap";
import { LOCAL_URL } from "../../assets/common";
import { useNotificationContext } from "../../contexts/NotificationsContext";
import '../../assets/modal.css'

type AddUserProps = {
    show: boolean;
    onClose: () => void;
    onAdded: () => void;
};

interface User {
    name: string;
    email: string;
    role: string;
    password: string;
    password_confirmation: string;
}

const AddUser: React.FC<AddUserProps> = ({ show, onClose, onAdded }) => {
    const [user, setUser] = useState<User>({
        name: "",
        email: "",
        role: "user",
        password: "",
        password_confirmation: "",
    });
    const [loading, setLoading] = useState(false);
    const { setNotifications } = useNotificationContext();

    const addUser = async () => {
        setLoading(true);
        try {
            const response = await axios.post(`${LOCAL_URL}/users`, user, {
                headers: {
                    Accept: "application/json",
                },
            });
            const { data } = response;
            setNotifications({
                message: data.message,
                result: "success",
            });
            onClose();
            onAdded();
            setUser({
                name: "",
                email: "",
                role: "user",
                password: "",
                password_confirmation: "",
            });
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
        <Modal
            show={show}
            onHide={onClose}
            backdrop="static"
            keyboard={false}
            size="lg"
            aria-labelledby="contained-modal-title-vcenter"
            centered
        >
            <Modal.Header closeButton>
                <Modal.Title id="contained-modal-title-vcenter">
                    Add User
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Row>
                    <Col xs={4}>
                        <FloatingLabel
                            controlId="name"
                            label="Name"
                            className="mb-3 text-secondary"
                        >
                            <Form.Control
                                type="name"
                                placeholder="name"
                                value={user.name}
                                onChange={(e) =>
                                    setUser((prev) => ({
                                        ...prev,
                                        name: e.target.value,
                                    }))
                                }
                                autoFocus
                            />
                        </FloatingLabel>
                    </Col>
                    <Col xs={4}>
                        <FloatingLabel
                            controlId="email"
                            label="Email"
                            className="mb-3 text-secondary"
                        >
                            <Form.Control
                                type="email"
                                placeholder="name@example.com"
                                value={user.email}
                                onChange={(e) =>
                                    setUser((prev) => ({
                                        ...prev,
                                        email: e.target.value,
                                    }))
                                }
                            />
                        </FloatingLabel>
                    </Col>
                    <Col xs={4}>
                        <FloatingLabel
                            controlId="role"
                            label="Role"
                            className="text-secondary"
                        >
                            <Form.Select
                                aria-label="Role selection"
                                onChange={(e) =>
                                    setUser((prev) => ({
                                        ...prev,
                                        role: e.target.value,
                                    }))
                                }
                            >
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                            </Form.Select>
                        </FloatingLabel>
                    </Col>
                </Row>
                <Row>
                    <Col xs={4}>
                        <FloatingLabel
                            controlId="password"
                            label="Password"
                            className="text-secondary"
                        >
                            <Form.Control
                                type="password"
                                placeholder="Password"
                                value={user.password}
                                onChange={(e) =>
                                    setUser((prev) => ({
                                        ...prev,
                                        password: e.target.value,
                                    }))
                                }
                            />
                        </FloatingLabel>
                    </Col>
                    <Col xs={4}>
                        <FloatingLabel
                            controlId="repassword"
                            label="Repeat Password"
                            className="text-secondary"
                        >
                            <Form.Control
                                type="password"
                                placeholder="Password"
                                value={user.password_confirmation}
                                onChange={(e) =>
                                    setUser((prev) => ({
                                        ...prev,
                                        password_confirmation: e.target.value,
                                    }))
                                }
                            />
                        </FloatingLabel>
                    </Col>
                </Row>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="success" size="lg" onClick={addUser}>
                    {loading && (
                        <Spinner
                            as="span"
                            animation="grow"
                            size="sm"
                            role="status"
                            aria-hidden="true"
                        />
                    )}
                    {loading ? " Loading" : " ADD"}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default AddUser;
