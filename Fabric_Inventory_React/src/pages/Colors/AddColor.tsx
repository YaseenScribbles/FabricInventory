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
import { useUserContext } from "../../contexts/UserContext";
import '../../assets/modal.css'

type AddColorProps = {
    show: boolean;
    onClose: () => void;
    onAdded: () => void;
};

interface Color {
    name: string;
    user_id: number;
}

const AddColor: React.FC<AddColorProps> = ({ show, onClose, onAdded }) => {
    const { user } = useUserContext();
    const [color, setColor] = useState<Color>({
        name: "",
        user_id: user!.id,
    });
    const [loading, setLoading] = useState(false);
    const { setNotifications } = useNotificationContext();

    const addColor = async () => {
        setLoading(true);
        try {
            const response = await axios.post(`${LOCAL_URL}/colors`, color, {
                headers: { Accept: "application/json" },
            });

            const { data } = response;
            setNotifications({
                message: data.message,
                result: "success",
            });
            onClose();
            onAdded();
            setColor({
                name: "",
                user_id: user!.id,
            });
        } catch (error: any) {
            const {
                response: {
                    data: { message },
                },
            } = error;
            setNotifications({
                message: message,
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
            size="sm"
            aria-labelledby="contained-modal-title-vcenter"
            centered
        >
            <Modal.Header closeButton>
                <Modal.Title id="contained-modal-title-vcenter">
                    Add Color
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Row>
                    <Col xs={12}>
                        <FloatingLabel
                            controlId="name"
                            label="Name"
                            className="mb-3 text-secondary"
                        >
                            <Form.Control
                                type="name"
                                placeholder="name"
                                value={color.name}
                                onChange={(e) => {
                                    setColor((prev) => ({
                                        ...prev,
                                        name: e.target.value,
                                    }));
                                }}
                                autoFocus
                            />
                        </FloatingLabel>
                    </Col>
                </Row>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="success" size="lg" onClick={addColor}>
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

export default AddColor;
