import axios from "axios";
import { useState } from "react";
import {
    Button,
    Col,
    Form,
    Modal,
    Row,
    Spinner,
} from "react-bootstrap";
import { LOCAL_URL } from "../../assets/common";
import { useNotificationContext } from "../../contexts/NotificationsContext";
import "../../assets/modal.css";

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
                <Row className="mb-3">
                    <Col xs={4}>
                        <Form.Label>Name</Form.Label>
                        <Form.Control
                            type="name"
                            value={user.name}
                            onChange={(e) =>
                                setUser((prev) => ({
                                    ...prev,
                                    name: e.target.value,
                                }))
                            }
                            autoFocus
                        />
                    </Col>
                    <Col xs={4}>
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                            type="email"
                            value={user.email}
                            onChange={(e) =>
                                setUser((prev) => ({
                                    ...prev,
                                    email: e.target.value,
                                }))
                            }
                        />
                    </Col>
                    <Col xs={4}>
                        <Form.Label>Role</Form.Label>
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
                    </Col>
                </Row>
                <Row>
                    <Col xs={4}>
                        <Form.Label>Password</Form.Label>
                        <Form.Control
                            type="password"
                            value={user.password}
                            onChange={(e) =>
                                setUser((prev) => ({
                                    ...prev,
                                    password: e.target.value,
                                }))
                            }
                        />
                    </Col>
                    <Col xs={4}>
                        <Form.Label>Repeat Password</Form.Label>
                        <Form.Control
                            type="password"
                            value={user.password_confirmation}
                            onChange={(e) =>
                                setUser((prev) => ({
                                    ...prev,
                                    password_confirmation: e.target.value,
                                }))
                            }
                        />
                    </Col>
                </Row>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="success" onClick={addUser}>
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
