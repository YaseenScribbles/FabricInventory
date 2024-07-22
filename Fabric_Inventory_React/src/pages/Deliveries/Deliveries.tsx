import {
    Container,
    OverlayTrigger,
    Spinner,
    Table,
    Tooltip,
} from "react-bootstrap";
import Heading from "../../components/Heading";
import { useEffect, useRef, useState, lazy, Suspense } from "react";
import { useNotificationContext } from "../../contexts/NotificationsContext";
import { useUserContext } from "../../contexts/UserContext";
import axios from "axios";
import { LOCAL_URL } from "../../assets/common";
import MyPagination from "../../components/Pagination";
import AlertModal from "../../components/AlertModal";
const AddEditDelivery = lazy(() => import("./AddEditDelivery"));

interface Delivery {
    id: number;
    lotNo: string;
    brand: string;
    cloth: string;
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
            <Table striped bordered hover size="sm">
                <thead>
                    <tr style={{ verticalAlign: "middle" }}>
                        <th className="eightypixels">D. No</th>
                        <th>Date</th>
                        <th className="eightypixels">R. No</th>
                        <th className="eightypixels">Lot No</th>
                        <th className="hundredpixels">Brand</th>
                        <th className="hundredpixels">Supplier</th>
                        <th className="hundredpixels">Cloth</th>
                        <th>Type</th>
                        <th className="remarks">Remarks</th>
                        <th>Rolls</th>
                        <th>Weight</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr>
                            <td className="text-center " colSpan={12}>
                                Loading...
                            </td>
                        </tr>
                    ) : (
                        deliveries.map((delivery, index) => (
                            <tr key={index} style={{ verticalAlign: "middle" }}>
                                <td className="text-center eightypixels">
                                    {delivery.id}
                                </td>
                                <td className="text-center">
                                    {new Date(
                                        delivery.date
                                    ).toLocaleDateString()}
                                </td>
                                <td className="text-center eightypixels">
                                    {delivery.receiptNo}
                                </td>
                                <OverlayTrigger
                                    placement="top"
                                    overlay={
                                        <Tooltip>{delivery.lotNo}</Tooltip>
                                    }
                                >
                                    <td className="eightypixels">
                                        {delivery.lotNo}
                                    </td>
                                </OverlayTrigger>
                                <OverlayTrigger
                                    placement="top"
                                    overlay={
                                        <Tooltip>
                                            {delivery.brand
                                                ? delivery.brand.toUpperCase()
                                                : "NOT GIVEN"}
                                        </Tooltip>
                                    }
                                >
                                    <td className="hundredpixels">
                                        {delivery.brand
                                            ? delivery.brand.toUpperCase()
                                            : "NOT GIVEN"}
                                    </td>
                                </OverlayTrigger>
                                <OverlayTrigger
                                    placement="top"
                                    overlay={
                                        <Tooltip>
                                            {delivery.contact.toUpperCase()}
                                        </Tooltip>
                                    }
                                >
                                    <td className="hundredpixels">
                                        {delivery.contact.toUpperCase()}
                                    </td>
                                </OverlayTrigger>
                                <OverlayTrigger
                                    placement="top"
                                    overlay={
                                        <Tooltip>
                                            {delivery.cloth.toUpperCase()}
                                        </Tooltip>
                                    }
                                >
                                    <td className="hundredpixels">
                                        {delivery.cloth.toUpperCase()}
                                    </td>
                                </OverlayTrigger>
                                <td>{delivery.fabric.toUpperCase()}</td>
                                <OverlayTrigger
                                    placement="top"
                                    overlay={
                                        <Tooltip>
                                            {delivery.remarks
                                                ? delivery.remarks.toUpperCase()
                                                : ""}
                                        </Tooltip>
                                    }
                                >
                                    <td className="remarks">
                                        {delivery.remarks
                                            ? delivery.remarks.toUpperCase()
                                            : ""}
                                    </td>
                                </OverlayTrigger>
                                <td className="text-end">{delivery.rolls}</td>
                                <td className="text-end">
                                    {(+delivery.weight).toFixed(2)}
                                </td>
                                <td>
                                    <div className="d-flex">
                                        {user!.role === "admin" && (
                                            <div
                                                onClick={() => {
                                                    setEdit(true);
                                                    setEditId(delivery.id);
                                                    setShowAddEditModal(true);
                                                }}
                                                className="d-flex me-1"
                                            >
                                                <box-icon
                                                    name="edit-alt"
                                                    color="green"
                                                    size="sm"
                                                ></box-icon>
                                            </div>
                                        )}
                                        <div
                                            onClick={() => {
                                                window.open(
                                                    `/delivery-report/${delivery.id}`,
                                                    "_blank"
                                                );
                                            }}
                                            className="d-flex me-1"
                                        >
                                            <box-icon
                                                type="solid"
                                                name="file-pdf"
                                                color="green"
                                                size="sm"
                                            ></box-icon>
                                        </div>
                                        {user!.role === "admin" && (
                                            <div
                                                onClick={() => {
                                                    setAlertId(delivery.id);
                                                    setShowAlert(true);
                                                }}
                                                className="d-flex"
                                            >
                                                <box-icon
                                                    name="x"
                                                    color="red"
                                                    size="sm"
                                                ></box-icon>
                                            </div>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </Table>
            <Suspense
                fallback={
                    <div className="d-flex justify-content-center align-items-center">
                        <Spinner animation="border" />
                    </div>
                }
            >
                {showAddEditModal && (
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
                )}
            </Suspense>
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
                    paginationURL={`${LOCAL_URL}/deliveries?userId=${user?.id}`}
                    setLoading={setLoading}
                    setState={setDeliveries}
                    hasOtherParams={true}
                />
            )}
        </Container>
    );
};

export default Deliveries;
