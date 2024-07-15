import { useEffect, useState } from "react";
import { Modal, Row, Button, Spinner, Col } from "react-bootstrap";
import { useNotificationContext } from "../../contexts/NotificationsContext";
import axios from "axios";
import { LOCAL_URL } from "../../assets/common";
import Multiselect from "multiselect-react-dropdown";

type StoreAssignProps = {
    show: boolean;
    onClose: () => void;
    onUpdated: () => void;
    user: User;
};

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    count?: string;
    stores?: string;
    active?: string;
    storeIds?: string;
}

// interface UserStore {
//     user_id: number;
//     store_id: number[];
// }

interface Store {
    id: number;
    name: string;
}

const StoreAssign: React.FC<StoreAssignProps> = ({
    show,
    onClose,
    onUpdated,
    user,
}) => {
    const convertStringToArray = (userInfo: User) => {
        if (userInfo.storeIds) {
            const array = userInfo.storeIds
                .split(",")
                .map((num) => Number(num.trim()));
            return array;
        } else {
            return [];
        }
    };

    const [loading, setLoading] = useState(false);
    const { setNotifications } = useNotificationContext();
    const [stores, setStores] = useState<Store[]>([]);
    const [selectedStores, setSelectedStores] = useState<Store[]>([]);

    // const [userStores, setUserStores] = useState<UserStore>({
    //     user_id: 0,
    //     store_id: [],
    // });

    useEffect(() => {
        updateSelectedStores();
    }, [user]);

    const updateSelectedStores = () => {
        setSelectedStores([]);
        const prevStores = user.storeIds ? convertStringToArray(user) : [];

        if (prevStores) {
            prevStores.forEach((ps) => {
                let store = stores.find((s) => s.id === ps);
                if (store) {
                    setSelectedStores((prev) => [...prev, store]);
                }
            });
        }
    };

    useEffect(() => {
        const getStores = async () => {
            setLoading(true);
            try {
                const response = await axios.get(
                    `${LOCAL_URL}/stores?all=true`,
                    {
                        headers: {
                            Accept: "application/json",
                        },
                    }
                );

                const { data } = response;
                setStores(data.data);
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

        getStores();
    }, []);

    const assignStores = async () => {
        setLoading(true);
        try {
            const response = await axios.post(
                `${LOCAL_URL}/storeassign`,
                { user_id: user.id, store_id: selectedStores.map((s) => s.id) },
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
            onClose();
            onUpdated();
            setSelectedStores([]);
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
                    Assign Stores {`(${user.name.toUpperCase()})`}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Row>
                    <Col>
                        <Multiselect
                            options={stores}
                            selectedValues={selectedStores}
                            onSelect={(e) => setSelectedStores(e)}
                            onRemove={(e) => setSelectedStores(e)}
                            displayValue="name"
                            id="id"
                        />
                    </Col>
                </Row>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="success" size="sm" onClick={assignStores}>
                    {loading && (
                        <Spinner
                            as="span"
                            animation="grow"
                            size="sm"
                            role="status"
                            aria-hidden="true"
                        />
                    )}
                    {loading ? " Loading" : " ASSIGN"}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default StoreAssign;
