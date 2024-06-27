import { Button, Container, Table } from "react-bootstrap";
import Heading from "../../components/Heading";
import { useEffect, useRef, useState } from "react";
import AddEditDelivery from "./AddEditDelivery";
import { useNotificationContext } from "../../contexts/NotificationsContext";
import { useUserContext } from "../../contexts/UserContext";
import axios from "axios";
import { LOCAL_URL } from "../../assets/common";
import MyPagination from "../../components/Pagination";
import AlertModal from "../../components/AlertModal";

interface Delivery {
    id: number;
    lotNo: string;
    brand: string;
    contactId: number;
    contact: string;
    fabricId: number;
    fabric: string;
    remarks: string;
    rolls: number;
    weight: number;
    user: string;
    date: string;
    receiptNo: number;
}

interface Meta {
    currentPage: number;
    lastPage: number;
}

const Deliveries: React.FC = () => {
    const [showAddEditModal, setShowAddEditModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [deliveries, setDeliveries] = useState<Delivery[]>([]);
    const [edit, setEdit] = useState(false);
    const [editId, setEditId] = useState(0);
    const { setNotifications } = useNotificationContext();
    const { user } = useUserContext();
    const [meta, setMeta] = useState<Meta>({
        currentPage: 1,
        lastPage: 1,
    });
    const [currentPage, setCurrentPage] = useState(1);
    const hasFetchedData = useRef(false);
    const [alertId, setAlertId] = useState(0);
    const [showAlert, setShowAlert] = useState(false);

    const getDeliveries = async (page: number = 1) => {
        setLoading(true);
        try {
            const response = await axios.get(
                `${LOCAL_URL}/deliveries?page=${page}&userId=${user?.id}`,
                {
                    headers: { Accept: "application/json" },
                }
            );

            const { data } = response;
            setDeliveries(data.data);
            setMeta({
                currentPage: data.meta.current_page,
                lastPage: data.meta.last_page,
            });
            hasFetchedData.current = true;
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

    const deleteDelivery = async (id: number) => {
        setLoading(true);
        try {
            const response = await axios.delete(
                `${LOCAL_URL}/deliveries/${id}`,
                {
                    headers: { Accept: "application/json" },
                }
            );

            const { data } = response;
            setNotifications({
                message: data.message,
                result: "success",
            });

            getDeliveries(currentPage);
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

    useEffect(() => {
        if (hasFetchedData.current) return;
        getDeliveries();
    }, []);

    return (
        <Container className="p-2" id="deliveries">
            <Heading
                title="Deliveries"
                buttonText="Add Delivery"
                onClick={() => {
                    setShowAddEditModal(true);
                }}
            />
            <Table striped bordered hover>
                <thead>
                    <tr style={{ verticalAlign: "middle" }}>
                        <th>D. No</th>
                        <th>Date</th>
                        <th>R. No</th>
                        <th>Lot No</th>
                        <th>Brand</th>
                        <th>Contact</th>
                        <th>Fabric</th>
                        <th className="remarks">Remarks</th>
                        <th>Rolls</th>
                        <th>Weight</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr>
                            <td className="text-center " colSpan={11}>
                                Loading...
                            </td>
                        </tr>
                    ) : (
                        deliveries.map((delivery, index) => (
                            <tr key={index} style={{ verticalAlign: "middle" }}>
                                <td className="text-center">{delivery.id}</td>
                                <td className="text-center">
                                    {new Date(
                                        delivery.date
                                    ).toLocaleDateString()}
                                </td>
                                <td className="text-center">{delivery.receiptNo}</td>
                                <td>{delivery.lotNo}</td>
                                <td>{delivery.brand.toUpperCase()}</td>
                                <td>{delivery.contact.toUpperCase()}</td>
                                <td>{delivery.fabric.toUpperCase()}</td>
                                <td className="remarks">
                                    {delivery.remarks
                                        ? delivery.remarks.toUpperCase()
                                        : ""}
                                </td>
                                <td className="text-end">{delivery.rolls}</td>
                                <td className="text-end">{(+delivery.weight).toFixed(2)}</td>
                                <td className="d-flex flex-nowrap">
                                    <Button
                                        variant="primary"
                                        onClick={() => {
                                            setEdit(true);
                                            setEditId(delivery.id);
                                            setShowAddEditModal(true);
                                        }}
                                        style={{
                                            display: "flex",
                                            height: "40px",
                                            width: "45px",
                                        }}
                                    >
                                        <box-icon
                                            name="edit-alt"
                                            color="white"
                                            size="sm"
                                        ></box-icon>
                                    </Button>
                                    &nbsp;
                                    <Button
                                        variant="danger"
                                        onClick={() => {
                                            setAlertId(delivery.id);
                                            setShowAlert(true);
                                        }}
                                        style={{
                                            display: "flex",
                                            height: "40px",
                                            width: "45px",
                                        }}
                                    >
                                        <box-icon
                                            name="x"
                                            color="white"
                                            size="sm"
                                        ></box-icon>
                                    </Button>
                                    &nbsp;
                                    <Button
                                        variant="secondary"
                                        href={`/delivery-report/${delivery.id}`}
                                        target="_blank"
                                        style={{
                                            display: "flex",
                                            height: "40px",
                                            width: "45px",
                                        }}
                                    >
                                        <box-icon
                                            type="solid"
                                            name="file-pdf"
                                            color="white"
                                            size="sm"
                                        ></box-icon>
                                    </Button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </Table>
            <AddEditDelivery
                edit={edit}
                editId={editId}
                show={showAddEditModal}
                onAdd={() => {
                    let page = edit ? currentPage : meta.lastPage;
                    setCurrentPage(page);
                    getDeliveries(page);
                    setEdit(false);
                    setEditId(0);
                }}
                onClose={() => {
                    setShowAddEditModal(false);
                    setEdit(false);
                    setEditId(0);
                }}
            />
            <AlertModal
                show={showAlert}
                onCancel={() => setShowAlert(false)}
                onProceed={() => {
                    setShowAlert(false);
                    deleteDelivery(alertId);
                }}
            />
            {deliveries.length > 0 && (
                <MyPagination
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    lastPage={meta.lastPage}
                    paginationURL={`${LOCAL_URL}/deliveries`}
                    setLoading={setLoading}
                    setState={setDeliveries}
                />
            )}
        </Container>
    );
};

export default Deliveries;
