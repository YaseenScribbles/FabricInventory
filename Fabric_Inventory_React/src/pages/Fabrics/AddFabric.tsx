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
import { useUserContext } from "../../contexts/UserContext";
import '../../assets/modal.css'

type AddFabricProps = {
    show: boolean;
    onClose: () => void;
    onAdded: () => void;
};

interface Fabric {
    name: string;
    user_id: number;
}

const AddFabric: React.FC<AddFabricProps> = ({ show, onClose, onAdded }) => {
    const { user } = useUserContext();
    const [fabric, setFabric] = useState<Fabric>({
        name: "",
        user_id: user!.id,
    });
    const [loading, setLoading] = useState(false);
    const { setNotifications } = useNotificationContext();

    const addFabric = async () => {
        setLoading(true);
        try {
            const response = await axios.post(`${LOCAL_URL}/fabrics`, fabric, {
                headers: { Accept: "application/json" },
            });

            const { data } = response;
            setNotifications({
                message: data.message,
                result: "success",
            });
            onClose();
            onAdded();
            setFabric({
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
                    Add Cloth Type
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Row>
                    <Col xs={12}>
                            <Form.Label>Name</Form.Label>
                            <Form.Control
                                type="text"
                                value={fabric.name}
                                onChange={(e) => {
                                    setFabric((prev) => ({
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
                <Button variant="success" size="sm" onClick={addFabric}>
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

export default AddFabric;

