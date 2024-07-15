import axios from "axios";
import { useEffect, useState } from "react";
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
import { useUserContext } from "../../contexts/UserContext";
import "../../assets/modal.css";

type EditColorProps = {
    show: boolean;
    onClose: () => void;
    onUpdated: () => void;
    oldColor: Color;
};

interface Color {
    id: number;
    name: string;
    user_id?: number;
}

const EditColor: React.FC<EditColorProps> = ({
    show,
    onClose,
    onUpdated,
    oldColor,
}) => {
    const { user } = useUserContext();
    const [color, setColor] = useState<Color>({
        id: 0,
        name: "",
        user_id: user!.id,
    });
    const [loading, setLoading] = useState(false);
    const { setNotifications } = useNotificationContext();

    useEffect(() => {
        setColor(oldColor);
    }, [oldColor]);

    const updateColor = async () => {
        setLoading(true);
        try {
            const response = await axios.post(
                `${LOCAL_URL}/colors/${oldColor.id}?_method=PUT`,
                color,
                {
                    headers: { Accept: "application/json" },
                }
            );

            const { data } = response;
            setNotifications({
                message: data.message,
                result: "success",
            });
            onClose();
            onUpdated();
            setColor({
                id: 0,
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
            onHide={() => {
                onClose();
            }}
            backdrop="static"
            keyboard={false}
            size="sm"
            aria-labelledby="contained-modal-title-vcenter"
            centered
        >
            <Modal.Header closeButton>
                <Modal.Title id="contained-modal-title-vcenter">
                    Edit Color
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Row>
                    <Col xs={12}>
                        <Form.Label>Name</Form.Label>
                        <Form.Control
                            type="name"
                            value={color.name}
                            onChange={(e) => {
                                setColor((prev) => ({
                                    ...prev,
                                    name: e.target.value,
                                }));
                            }}
                            autoFocus
                        />
                    </Col>
                </Row>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="success" size="sm" onClick={updateColor}>
                    {loading && (
                        <Spinner
                            as="span"
                            animation="grow"
                            size="sm"
                            role="status"
                            aria-hidden="true"
                        />
                    )}
                    {loading ? " Loading" : " UPDATE"}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default EditColor;
