import axios from "axios";
import { useEffect, useState } from "react";
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
import "../../assets/modal.css";

type EditStoreProps = {
    show: boolean;
    onClose: () => void;
    onUpdated: () => void;
    oldStore: Store;
};

interface Store {
    id: number;
    code: string;
    name: string;
    supervisor: string;
    phone: string;
    user_id: number;
}

const EditStore: React.FC<EditStoreProps> = ({
    show,
    onClose,
    onUpdated,
    oldStore,
}) => {
    const { user } = useUserContext();
    const [store, setStore] = useState<Store>({
        id: 0,
        code: "",
        name: "",
        supervisor: "",
        phone: "",
        user_id: user!.id,
    });
    const [loading, setLoading] = useState(false);
    const { setNotifications } = useNotificationContext();

    useEffect(() => {
        setStore(oldStore);
    }, [oldStore]);

    const updateStore = async () => {
        setLoading(true);
        try {
            const response = await axios.post(
                `${LOCAL_URL}/stores/${oldStore.id}?_method=PUT`,
                store,
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
            setStore({
                id: 0,
                code: "",
                name: "",
                supervisor: "",
                phone: "",
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
            size="lg"
            aria-labelledby="contained-modal-title-vcenter"
            centered
        >
            <Modal.Header closeButton>
                <Modal.Title id="contained-modal-title-vcenter">
                    Edit Store
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Row>
                    <Col xs={4}>
                        <FloatingLabel
                            controlId="code"
                            label="Code"
                            className="mb-3 text-secondary"
                        >
                            <Form.Control
                                type="code"
                                placeholder="code"
                                value={store.code}
                                onChange={(e) => {
                                    setStore((prev) => ({
                                        ...prev,
                                        code: e.target.value,
                                    }));
                                }}
                                autoFocus
                            />
                        </FloatingLabel>
                    </Col>
                    <Col xs={8}>
                        <FloatingLabel
                            controlId="name"
                            label="Name"
                            className="mb-3 text-secondary"
                        >
                            <Form.Control
                                type="name"
                                placeholder="name"
                                value={store.name}
                                onChange={(e) => {
                                    setStore((prev) => ({
                                        ...prev,
                                        name: e.target.value,
                                    }));
                                }}
                            />
                        </FloatingLabel>
                    </Col>
                </Row>
                <Row>
                    <Col xs={6}>
                        <FloatingLabel
                            controlId="supervisor"
                            label="Supervisor"
                            className="mb-3 text-secondary"
                        >
                            <Form.Control
                                type="supervisor"
                                placeholder="supervisor"
                                value={store.supervisor || ""}
                                onChange={(e) => {
                                    setStore((prev) => ({
                                        ...prev,
                                        supervisor: e.target.value,
                                    }));
                                }}
                            />
                        </FloatingLabel>
                    </Col>
                    <Col xs={6}>
                        <FloatingLabel
                            controlId="phone"
                            label="Phone"
                            className="mb-3 text-secondary"
                        >
                            <Form.Control
                                type="phone"
                                placeholder="phone"
                                value={store.phone || ""}
                                onChange={(e) => {
                                    setStore((prev) => ({
                                        ...prev,
                                        phone: e.target.value,
                                    }));
                                }}
                            />
                        </FloatingLabel>
                    </Col>
                </Row>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="success" size="lg" onClick={updateStore}>
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

export default EditStore;
