import { Container, Table } from "react-bootstrap";
import Heading from "../../components/Heading";
import { useEffect, useState } from "react";
import AddStore from "./AddStore";
import axios from "axios";
import { LOCAL_URL } from "../../assets/common";
import { useNotificationContext } from "../../contexts/NotificationsContext";
import EditStore from "./EditStore";
import { useUserContext } from "../../contexts/UserContext";
import MyPagination from "../../components/Pagination";
import "./stores.css";

interface Store {
    id: number;
    code: string;
    name: string;
    supervisor?: string;
    phone?: string;
    active: string;
    user: {
        name: string;
    };
}

interface Meta {
    currentPage: number;
    lastPage: number;
}

const Stores: React.FC = () => {
    const [stores, setStores] = useState<Store[]>([]);
    const [loading, setLoading] = useState(false);
    const [showAddStoreModal, setShowAddStoreModal] = useState(false);
    const [showEditStoreModal, setShowEditStoreModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [editStore, setEditStore] = useState<Store>({
        id: 0,
        code: "",
        name: "",
        supervisor: "",
        phone: "",
        active: "",
        user: {
            name: "",
        },
    });
    const [meta, setMeta] = useState<Meta>({
        currentPage: 1,
        lastPage: 1,
    });
    const { setNotifications } = useNotificationContext();
    const { user } = useUserContext();

    useEffect(() => {
        getStores();
    }, []);

    const getStores = async (page: number = 1) => {
        setLoading(true);

        try {
            const response = await axios.get(
                `${LOCAL_URL}/stores?page=${page}`,
                {
                    headers: {
                        Accept: "application/json",
                    },
                }
            );

            const { data } = response;
            setStores(data.data);
            setMeta({
                lastPage: data.meta.last_page,
                currentPage: data.meta.current_page,
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

    const suspendStore = async (id: number) => {
        setLoading(true);
        try {
            const response = await axios.delete(`${LOCAL_URL}/stores/${id}`);
            const { data } = response;
            setNotifications({
                message: data.message,
                result: "success",
            });
            getStores(currentPage);
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
        <Container id="stores" className="p-2">
            <Heading
                title="Stores"
                buttonText="Add Store"
                onClick={() => setShowAddStoreModal(true)}
            />
            <Table striped bordered hover size="sm">
                <thead>
                    <tr>
                        <th className="text-center">#</th>
                        <th>Code</th>
                        <th>Name</th>
                        <th>Supervisor</th>
                        <th>Phone</th>
                        <th>Created By</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr>
                            <td colSpan={8} className="text-center">
                                Loading...
                            </td>
                        </tr>
                    ) : (
                        stores.map((store, index) => {
                            let serialNo = (currentPage - 1) * 10 + index + 1;

                            return (
                                <tr
                                    style={{ verticalAlign: "middle" }}
                                    key={index}
                                >
                                    <td className="text-center">{serialNo}</td>
                                    <td>{store.code.toUpperCase()}</td>
                                    <td>{store.name.toUpperCase()}</td>
                                    <td>{store.supervisor?.toUpperCase()}</td>
                                    <td>{store.phone?.toUpperCase()}</td>
                                    <td>{store.user.name.toUpperCase()}</td>
                                    <td>
                                        {store.active === "1"
                                            ? "ACTIVE"
                                            : "INACTIVE"}
                                    </td>
                                    <td>
                                        <div className="d-flex">
                                            <div
                                                className="d-flex me-1"
                                                onClick={() => {
                                                    setEditStore(store);
                                                    setShowEditStoreModal(true);
                                                }}
                                            >
                                                <box-icon
                                                    name="edit-alt"
                                                    color="green"
                                                    size="sm"
                                                ></box-icon>
                                            </div>
                                            <div
                                                className="d-flex"
                                                onClick={() =>
                                                    suspendStore(store.id)
                                                }
                                            >
                                                {store.active === "1" ? (
                                                    <box-icon
                                                        name="x"
                                                        color="red"
                                                        size="sm"
                                                    ></box-icon>
                                                ) : (
                                                    <box-icon
                                                        name="check"
                                                        color="red"
                                                        size="sm"
                                                    ></box-icon>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })
                    )}
                </tbody>
            </Table>
            <AddStore
                show={showAddStoreModal}
                onClose={() => setShowAddStoreModal(false)}
                onAdded={() => {
                    setCurrentPage(meta.lastPage);
                    getStores(meta.lastPage);
                }}
            />
            <EditStore
                show={showEditStoreModal}
                onClose={() => setShowEditStoreModal(false)}
                onUpdated={() => {
                    getStores(currentPage);
                }}
                oldStore={{
                    id: editStore.id,
                    code: editStore.code,
                    name: editStore.name,
                    supervisor: editStore.supervisor!,
                    phone: editStore.phone!,
                    user_id: user!.id,
                }}
            />
            {stores.length > 0 && (
                <MyPagination
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    lastPage={meta.lastPage}
                    paginationURL={`${LOCAL_URL}/stores`}
                    setLoading={setLoading}
                    setState={setStores}
                />
            )}
        </Container>
    );
};

export default Stores;
