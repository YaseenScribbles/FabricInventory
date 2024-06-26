import {
    Button,
    Col,
    Container,
    Form,
    OverlayTrigger,
    Row,
    Table,
    Tooltip,
} from "react-bootstrap";
import Heading from "../../components/Heading";
import { useNotificationContext } from "../../contexts/NotificationsContext";
import React, { useEffect, useRef, useState } from "react";
import AddReceipt from "./AddReceipt";
import axios from "axios";
import { LOCAL_URL } from "../../assets/common";
import MyPagination from "../../components/Pagination";
import "./Receipt.css";
import { useUserContext } from "../../contexts/UserContext";
import Select from "react-select";
import AddEditDelivery from "../Deliveries/AddEditDelivery";
import { Navigate } from "react-router";
import AlertModal from "../../components/AlertModal";

interface Receipt {
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
    deliveredRolls: number;
    deliveredWeight: number;
    stockRolls: number;
    stockWeight: number;
    user: string;
    date: string;
    isLocked: string;
}

interface Meta {
    currentPage: number;
    lastPage: number;
}

interface Store {
    id: number;
    name: string;
}

interface StoreOptions {
    value: number;
    label: string;
}

const Receipts: React.FC = () => {
    const { setNotifications } = useNotificationContext();
    const [showAddReceipt, setShowAddReceipt] = useState(false);
    const [loading, setLoading] = useState(false);
    const [receipts, setReceipts] = useState<Receipt[]>([]);
    const [meta, setMeta] = useState<Meta>({
        currentPage: 1,
        lastPage: 1,
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [edit, setEdit] = useState(false);
    const [editId, setEditId] = useState(0);
    const { user } = useUserContext();
    const [stores, setStores] = useState<StoreOptions[]>([]);
    const [selectedStore, setSelectedStore] = useState<StoreOptions | null>(
        null
    );
    const [isClosed, setIsClosed] = useState(false);
    const [showDeliveryModal, setShowDeliveryModal] = useState(false);
    const [deliveryReceiptId, setDeliveryReceipId] = useState(0);
    const hasFetchedData = useRef(false);
    const [alertId, setAlertId] = useState<number>(0);
    const [showAlert, setShowAlert] = useState(false);
    const [showDeleteAlert, setShowDeleteAlert] = useState(false);

    const getReceipts = async (page: number = 1) => {
        setLoading(true);
        try {
            const response = await axios.get(
                `${LOCAL_URL}/receipts?page=${page}&userId=${user?.id}&storeId=${selectedStore?.value}&isClosed=${isClosed}`,
                {
                    headers: { Accept: "application/json" },
                }
            );

            const { data } = response;
            setReceipts(data.data);
            setMeta({
                currentPage: data.meta.current_page,
                lastPage: data.meta.last_page,
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

    const deleteReceipt = async (id: number) => {
        setLoading(true);
        try {
            const response = await axios.delete(`${LOCAL_URL}/receipts/${id}`, {
                headers: { Accept: "application/json" },
            });

            const { data } = response;
            setNotifications({
                message: data.message,
                result: "success",
            });

            getReceipts(currentPage);
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

    const closeReceipt = async (id: number) => {
        try {
            setLoading(true);
            const response = await axios.post(
                `${LOCAL_URL}/receipt-status-update/${id}?_method=PUT`,
                {},
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

            getReceipts(currentPage);
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

    const getStores = async () => {
        try {
            setLoading(true);
            const response = await axios.get(
                `${LOCAL_URL}/userstores/${user!.id}`
            );
            const { data } = response;
            const storeOptions = data.stores.map((store: Store) => ({
                label: store.name,
                value: store.id,
            }));
            setStores(storeOptions);
            if (storeOptions.length === 1) {
                setSelectedStore(() => {
                    return {
                        label: storeOptions[0].label,
                        value: storeOptions[0].value,
                    };
                });
            }
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

    useEffect(() => {
        if (hasFetchedData.current) return;
        getStores();
    }, []);

    useEffect(() => {
        if (selectedStore) {
            getReceipts();
        }
    }, [selectedStore, isClosed]);

    return (
        <Container className="p-2" id="receipts">
            <Heading
                title="Receipts"
                buttonText="Add Receipt"
                onClick={() => setShowAddReceipt(true)}
            />
            <Row>
                <Col xs={3}>
                    <Select
                        value={selectedStore}
                        onChange={(e) => {
                            if (e) {
                                setSelectedStore(e);
                            }
                        }}
                        options={stores}
                        placeholder="Select Store"
                    />
                </Col>
                <Col
                    xs={2}
                    className="d-flex justify-content-start align-items-center"
                >
                    <Form.Check
                        disabled={selectedStore === null}
                        type="switch"
                        label="CLOSED"
                        id="is_closed"
                        onClick={(
                            e: React.MouseEvent<HTMLInputElement, MouseEvent>
                        ) => {
                            const target = e.target as HTMLInputElement;
                            setIsClosed(target.checked);
                        }}
                    />
                </Col>
            </Row>
            <hr />
            <Table striped bordered hover>
                <thead>
                    <tr style={{ verticalAlign: "middle" }}>
                        {/* <th>#</th> */}
                        <th>R. No</th>
                        <th>Date</th>
                        <th>Lot No</th>
                        <th>Brand</th>
                        <th>Contact</th>
                        <th>Fabric</th>
                        <th className="remarks">Remarks</th>
                        <th colSpan={2} className="text-center">
                            Received
                        </th>
                        {/* <th>Weight</th> */}
                        <th colSpan={2} className="text-center">
                            Delivered
                        </th>
                        {/* <th>D. Weight</th> */}
                        <th colSpan={2} className="text-center">
                            Stock
                        </th>
                        {/* <th>S. Weight</th> */}
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr>
                            <td className="text-center" colSpan={15}>
                                Loading...
                            </td>
                        </tr>
                    ) : (
                        receipts.map((receipt, index) => {
                            // let serialNo = (currentPage - 1) * 10 + index + 1;

                            return (
                                <tr
                                    style={{ verticalAlign: "middle" }}
                                    key={index}
                                >
                                    {/* <td>{serialNo}</td> */}
                                    <td className="text-center">
                                        {receipt.id}
                                    </td>
                                    <td>
                                        {new Date(
                                            receipt.date
                                        ).toLocaleDateString()}
                                    </td>
                                    <td>{receipt.lotNo.toUpperCase()}</td>
                                    <td>{receipt.brand.toUpperCase()}</td>
                                    <td>{receipt.contact.toUpperCase()}</td>
                                    <td>{receipt.fabric.toUpperCase()}</td>
                                    <OverlayTrigger
                                        placement="top"
                                        overlay={
                                            <Tooltip>
                                                {receipt.remarks &&
                                                    receipt.remarks.toUpperCase()}
                                            </Tooltip>
                                        }
                                    >
                                        <td className="remarks">
                                            {receipt.remarks
                                                ? receipt.remarks.toUpperCase()
                                                : ""}
                                        </td>
                                    </OverlayTrigger>
                                    <td className="text-end">
                                        {receipt.rolls}
                                    </td>
                                    <td className="text-end">
                                        {(+receipt.weight).toFixed(2)}
                                    </td>
                                    <td className="text-end">
                                        {receipt.deliveredRolls}
                                    </td>
                                    <td className="text-end">
                                        {(+receipt.deliveredWeight).toFixed(2)}
                                    </td>
                                    <td className="text-end">
                                        {receipt.stockRolls}
                                    </td>
                                    <td className="text-end">
                                        {(+receipt.stockWeight).toFixed(2)}
                                    </td>
                                    <td className="d-flex flex-nowrap">
                                        <Button
                                            hidden={receipt.isLocked === "1"}
                                            variant="primary"
                                            onClick={() => {
                                                // setEditReceipt(receipt.id);
                                                // setShowEditReceipt(true);
                                                setEdit(true);
                                                setEditId(receipt.id);
                                                setShowAddReceipt(true);
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
                                            hidden={receipt.isLocked === "1"}
                                            variant="danger"
                                            onClick={() => {
                                                setAlertId(receipt.id);
                                                setShowDeleteAlert(true);
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
                                            hidden={isClosed}
                                            variant="dark"
                                            style={{
                                                display: "flex",
                                                height: "40px",
                                                width: "45px",
                                            }}
                                            onClick={() => {
                                                setDeliveryReceipId(receipt.id);
                                                setShowDeliveryModal(true);
                                            }}
                                        >
                                            <box-icon
                                                type="solid"
                                                name="truck"
                                                color="white"
                                                size="sm"
                                            ></box-icon>
                                        </Button>
                                        &nbsp;
                                        <Button
                                            variant="secondary"
                                            href={`/receipt-report/${receipt.id}`}
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
                                        &nbsp;
                                        <Button
                                            hidden={isClosed}
                                            variant="info"
                                            style={{
                                                display: "flex",
                                                height: "40px",
                                                width: "45px",
                                            }}
                                            onClick={() => {
                                                setAlertId(receipt.id);
                                                setShowAlert(true);
                                            }}
                                        >
                                            <box-icon
                                                name="check-double"
                                                color="white"
                                                size="sm"
                                            ></box-icon>
                                        </Button>
                                    </td>
                                </tr>
                            );
                        })
                    )}
                </tbody>
            </Table>
            {receipts.length > 0 && (
                <MyPagination
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    lastPage={meta.lastPage}
                    paginationURL={`${LOCAL_URL}/receipts`}
                    setLoading={setLoading}
                    setState={setReceipts}
                />
            )}
            <AddReceipt
                show={showAddReceipt}
                onClose={() => {
                    setShowAddReceipt(false);
                    setEdit(false);
                    setEditId(0);
                }}
                onAdded={() => {
                    let page = edit ? currentPage : meta.lastPage;
                    setCurrentPage(page);
                    getReceipts(page);
                    setEdit(false);
                    setEditId(0);
                }}
                edit={edit}
                editId={editId}
            />
            <AddEditDelivery
                edit={false}
                show={showDeliveryModal}
                onAdd={() => {
                    <Navigate to={"/deliveries"} />;
                    getReceipts(currentPage);
                }}
                onClose={() => {
                    setDeliveryReceipId(0);
                    setShowDeliveryModal(false);
                }}
                rcptId={deliveryReceiptId}
            />
            <AlertModal
                show={showAlert}
                onCancel={() => setShowAlert(false)}
                onProceed={() => {
                    setShowAlert(false);
                    closeReceipt(alertId);
                }}
            />
            <AlertModal
                show={showDeleteAlert}
                onCancel={() => setShowDeleteAlert(false)}
                onProceed={() => {
                    setShowDeleteAlert(false);
                    deleteReceipt(alertId);
                }}
            />
        </Container>
    );
};

export default Receipts;
