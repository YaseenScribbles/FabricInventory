import { Button, Container, Table } from "react-bootstrap";
import Heading from "../../components/Heading";
import { useEffect, useState } from "react";
import AddFabric from "./AddFabric";
import axios from "axios";
import { LOCAL_URL } from "../../assets/common";
import { useNotificationContext } from "../../contexts/NotificationsContext";
import EditFabric from "./EditFabric";
import { useUserContext } from "../../contexts/UserContext";
import MyPagination from "../../components/Pagination";
import "./fabrics.css";

interface Fabric {
    id: number;
    name: string;
    active: string;
    user: {
        name: string;
    };
}

interface Meta {
    currentPage: number;
    lastPage: number;
}

const Fabrics: React.FC = () => {
    const [fabrics, setFabrics] = useState<Fabric[]>([]);
    const [loading, setLoading] = useState(false);
    const [showAddFabricModal, setShowAddFabricModal] = useState(false);
    const [showEditFabricModal, setShowEditFabricModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [editFabric, setEditFabric] = useState<Fabric>({
        name: "",
        active: "",
        id: 0,
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
        getFabrics();
    }, []);

    const getFabrics = async (page: number = 1) => {
        setLoading(true);

        try {
            const response = await axios.get(
                `${LOCAL_URL}/fabrics?page=${page}`,
                {
                    headers: {
                        Accept: "application/json",
                    },
                }
            );

            const { data } = response;
            setFabrics(data.data);
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

    const suspendFabric = async (id: number) => {
        setLoading(true);
        try {
            const response = await axios.delete(`${LOCAL_URL}/fabrics/${id}`);
            const { data } = response;
            setNotifications({
                message: data.message,
                result: "success",
            });
            getFabrics(currentPage);
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
        <Container id="fabrics" className="p-2">
            <Heading
                title="Fabrics"
                buttonText="Add Fabric"
                onClick={() => setShowAddFabricModal(true)}
            />
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Name</th>
                        <th>Created By</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr>
                            <td colSpan={5} className="text-center">
                                Loading...
                            </td>
                        </tr>
                    ) : (
                        fabrics.map((fabric, index) => {
                            let serialNo = (currentPage - 1) * 10 + index + 1;

                            return (
                                <tr key={index}>
                                    <td>{serialNo}</td>
                                    <td>{fabric.name.toUpperCase()}</td>
                                    <td>{fabric.user.name.toUpperCase()}</td>
                                    <td>
                                        {fabric.active === "1"
                                            ? "ACTIVE"
                                            : "INACTIVE"}
                                    </td>
                                    <td>
                                        <Button
                                            variant="primary"
                                            onClick={() => {
                                                setEditFabric(fabric);
                                                setShowEditFabricModal(true);
                                            }}
                                        >
                                            <box-icon
                                                name="edit-alt"
                                                color="white"
                                                size="xs"
                                            ></box-icon>
                                        </Button>
                                        &nbsp;
                                        <Button
                                            variant="danger"
                                            onClick={() =>
                                                suspendFabric(fabric.id)
                                            }
                                        >
                                            {fabric.active === "1" ? (
                                                <box-icon
                                                    name="minus"
                                                    color="white"
                                                    size="xs"
                                                ></box-icon>
                                            ) : (
                                                <box-icon
                                                    name="plus"
                                                    color="white"
                                                    size="xs"
                                                ></box-icon>
                                            )}
                                        </Button>
                                    </td>
                                </tr>
                            );
                        })
                    )}
                </tbody>
            </Table>
            <AddFabric
                show={showAddFabricModal}
                onClose={() => setShowAddFabricModal(false)}
                onAdded={() => {
                    setCurrentPage(meta.lastPage);
                    getFabrics(meta.lastPage);
                }}
            />
            <EditFabric
                show={showEditFabricModal}
                onClose={() => setShowEditFabricModal(false)}
                onUpdated={() => getFabrics(currentPage)}
                oldFabric={{
                    id: editFabric.id,
                    name: editFabric.name,
                    user_id: user!.id,
                }}
            />
            {fabrics.length > 0 && (
                <MyPagination
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    lastPage={meta.lastPage}
                    paginationURL={`${LOCAL_URL}/fabrics`}
                    setLoading={setLoading}
                    setState={setFabrics}
                />
            )}
        </Container>
    );
};

export default Fabrics;
