import { ChangeEvent, useEffect, useState } from "react";
import {
    Button,
    Col,
    FloatingLabel,
    Form,
    Modal,
    Row,
    Spinner,
} from "react-bootstrap";
import { useUserContext } from "../../contexts/UserContext";
import axios from "axios";
import { LOCAL_URL } from "../../assets/common";
import { useNotificationContext } from "../../contexts/NotificationsContext";

type AddEditCompanyProps = {
    show: boolean;
    edit: boolean;
    editCompany?: EditCompany;
    onAdd: () => void;
    onClose: () => void;
};

interface Company {
    name: string;
    address: string;
    user_id: number;
}

interface EditCompany {
    id: number;
    name: string;
    address: string;
    user_id: number;
}

const AddEditCompany: React.FC<AddEditCompanyProps> = ({
    show,
    edit,
    onAdd,
    onClose,
    editCompany,
}) => {
    const { user } = useUserContext();
    const [company, setCompany] = useState<Company>({
        name: "",
        address: "",
        user_id: user!.id,
    });
    const [loading, setLoading] = useState(false);
    const { setNotifications } = useNotificationContext();

    const handleChange = (
        event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = event.target;
        setCompany((prev) => {
            return { ...prev, [name]: value };
        });
    };

    const saveCompany = async () => {
        try {
            setLoading(true);
            const response = await axios.post(
                `${LOCAL_URL}/companies`,
                company,
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
            onAdd();
            onClose();
        } catch (error: any) {
            const {
                response: { data },
            } = error;
            setNotifications({
                message: data.message,
                result: "failure",
            });
        } finally {
            setLoading(false);
        }
    };

    const updateCompany = async () => {
        try {
            setLoading(true);
            const response = await axios.post(
                `${LOCAL_URL}/companies/${editCompany!.id}?_method=PUT`,
                company,
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
            onAdd();
            onClose();
        } catch (error: any) {
            const {
                response: { data },
            } = error;
            setNotifications({
                message: data.message,
                result: "failure",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (edit) {
            setCompany({
                name: editCompany!.name,
                address: editCompany!.address,
                user_id: user!.id,
            });
        }
    }, [edit]);

    return (
        <Modal
            show={show}
            onHide={() => {
                onClose();
                if (edit) {
                    setCompany({ name: "", address: "", user_id: user!.id });
                }
            }}
            backdrop="static"
            keyboard={false}
            size="sm"
            centered
        >
            <Modal.Header closeButton>
                <Modal.Title>{`${
                    edit ? "Edit Company" : "Add Company"
                }`}</Modal.Title>
            </Modal.Header>
            <Form>
                <Modal.Body>
                    <Row>
                        <Col>
                            <FloatingLabel
                                controlId="name"
                                label="Name"
                                className="mb-3 text-secondary"
                            >
                                <Form.Control
                                    name="name"
                                    type="text"
                                    placeholder="***"
                                    value={company.name}
                                    onChange={handleChange}
                                    autoFocus
                                />
                            </FloatingLabel>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <FloatingLabel
                                controlId="address"
                                label="Address"
                                className="mb-3 text-secondary"
                            >
                                <Form.Control
                                    name="address"
                                    as="textarea"
                                    placeholder="***"
                                    style={{ height: "100px" }}
                                    value={company.address}
                                    onChange={handleChange}
                                />
                            </FloatingLabel>
                        </Col>
                    </Row>
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        onClick={edit ? updateCompany : saveCompany}
                        variant="success"
                        className="text-light"
                    >
                        {loading && (
                            <Spinner
                                as="span"
                                animation="border"
                                size="sm"
                                role="status"
                                aria-hidden="true"
                            />
                        )}
                        {`${loading ? "Loading" : edit ? "Update" : "Save"}`}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default AddEditCompany;
