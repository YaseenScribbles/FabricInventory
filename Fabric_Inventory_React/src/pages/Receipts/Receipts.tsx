import {
    Col,
    Container,
    Form,
    OverlayTrigger,
    Row,
    Spinner,
    Table,
    Tooltip,
} from "react-bootstrap";
import Heading from "../../components/Heading";
import { useNotificationContext } from "../../contexts/NotificationsContext";
import React, { Suspense, lazy, useEffect, useRef, useState } from "react";
const AddReceipt = lazy(() => import("./AddReceipt"));
import axios from "axios";
import { colorPrimary, LOCAL_URL } from "../../assets/common";
import MyPagination from "../../components/Pagination";
import { useUserContext } from "../../contexts/UserContext";
import Select from "react-select";
const AddEditDelivery = lazy(() => import("../Deliveries/AddEditDelivery"));
import { Navigate } from "react-router";
import AlertModal from "../../components/AlertModal";
import Brand from "./Brand";
import "./Receipt.css";

interface Receipt {
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
    const [showBrandModal, setShowBrandModal] = useState(false);
    const [brandEditId, setBrandEditId] = useState(0);
    const [brandEdit, setBrandEdit] = useState("");

    const getReceipts = async (page: number = 1) => {
        setLoading(true);
        try {
            const response = await axios.get(
                `${LOCAL_URL}/receipts?page=${page}&userId=${
                    user?.id
                }&storeId=${
                    selectedStore ? selectedStore.value : 0
                }&isClosed=${isClosed}`,
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

    const openReport = (id: number) => {
        window.open(`/receipt-report/${id}`, "_blank");
    };

    const isEditAllowed = (created_date: string): boolean => {
        const currentDate = new Date();
        const createdDateObj = new Date(created_date);
        const allowedDate = new Date(
            createdDateObj.setDate(createdDateObj.getDate() + 3)
        );
        if (user?.role === "admin") {
            return true;
        } else {
            return currentDate <= allowedDate;
        }
    };

    useEffect(() => {
        if (hasFetchedData.current) return;
        getStores();
    }, []);

    useEffect(() => {
        getReceipts();
    }, [selectedStore, isClosed]);

    return (
        <Container fluid className="p-2" id="receipts">
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
                            setSelectedStore(e);
                        }}
                        options={stores}
                        placeholder="Select Store"
                        isClearable
                        theme={(theme) => ({
                            ...theme,
                            colors: {
                                ...theme.colors,
                                primary :colorPrimary,
                                primary25: colorPrimary,
                                primary50:colorPrimary,
                                primary75: colorPrimary
                            }
                        })}
                    />
                </Col>
                <Col
                    xs={2}
                    className="d-flex justify-content-start align-items-center"
                >
                    <Form.Check
                        type="switch"
                        label="Closed"
                        id="is_closed"
                        onClick={(
                            e: React.MouseEvent<HTMLInputElement, MouseEvent>
                        ) => {
                            const target = e.target as HTMLInputElement;
                            setIsClosed(target.checked);
                        }}
                        className="text-secondary"
                    />
                </Col>
            </Row>
            <hr />
            <Table bordered hover striped id="receipts-table" size="sm">
                <thead>
                    <tr style={{ verticalAlign: "middle" }}>
                        {/* <th>#</th> */}
                        <th className="eightypixels">R. No</th>
                        <th>Date</th>
                        <th className="eightypixels">Lot No</th>
                        <th className="hundredpixels">Brand</th>
                        <th className="hundredpixels">Supplier</th>
                        <th className="hundredpixels">Cloth</th>
                        <th>Type</th>
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
                            <td className="text-center" colSpan={16}>
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
                                    <td className="text-center eightypixels">
                                        {receipt.id}
                                    </td>
                                    <td>
                                        {new Date(
                                            receipt.date
                                        ).toLocaleDateString()}
                                    </td>
                                    <OverlayTrigger
                                        placement="top"
                                        overlay={
                                            <Tooltip>
                                                {receipt.lotNo.toUpperCase()}
                                            </Tooltip>
                                        }
                                    >
                                        <td className="eightypixels">
                                            {receipt.lotNo.toUpperCase()}
                                        </td>
                                    </OverlayTrigger>
                                    <OverlayTrigger
                                        placement="top"
                                        overlay={
                                            <Tooltip>
                                                {receipt.brand
                                                    ? receipt.brand.toUpperCase()
                                                    : "NOT GIVEN"}
                                            </Tooltip>
                                        }
                                    >
                                        <td className="hundredpixels">
                                            {receipt.brand
                                                ? receipt.brand.toUpperCase()
                                                : "NOT GIVEN"}
                                        </td>
                                    </OverlayTrigger>
                                    <OverlayTrigger
                                        placement="top"
                                        overlay={
                                            <Tooltip>
                                                {receipt.contact.toUpperCase()}
                                            </Tooltip>
                                        }
                                    >
                                        <td className="hundredpixels">
                                            {receipt.contact.toUpperCase()}
                                        </td>
                                    </OverlayTrigger>
                                    <OverlayTrigger
                                        placement="top"
                                        overlay={
                                            <Tooltip>
                                                {receipt.cloth.toUpperCase()}
                                            </Tooltip>
                                        }
                                    >
                                        <td className="hundredpixels">
                                            {receipt.cloth.toUpperCase()}
                                        </td>
                                    </OverlayTrigger>
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
                                    <td>
                                        <div className="d-flex">
                                            {isEditAllowed(receipt.date) && (
                                                <div
                                                    hidden={
                                                        receipt.isLocked === "1"
                                                    }
                                                    onClick={() => {
                                                        // setEditReceipt(receipt.id);
                                                        // setShowEditReceipt(true);
                                                        setEdit(true);
                                                        setEditId(receipt.id);
                                                        setShowAddReceipt(true);
                                                    }}
                                                    className="d-flex me-1"
                                                    style={{ cursor: "pointer" }}
                                                >
                                                    <box-icon
                                                        name="edit-alt"
                                                        color="#3e9d8f"
                                                        size="sm"
                                                        animation="tada-hover"
                                                    ></box-icon>
                                                </div>
                                            )}
                                            <div
                                                hidden={isClosed}
                                                className="d-flex me-1"
                                                onClick={() => {
                                                    setDeliveryReceipId(
                                                        receipt.id
                                                    );
                                                    setShowDeliveryModal(true);
                                                }}
                                                style={{ cursor: "pointer" }}
                                            >
                                                <box-icon
                                                    type="solid"
                                                    name="truck"
                                                    color="#3e9d8f"
                                                    size="sm"
                                                    animation="tada-hover"
                                                ></box-icon>
                                            </div>
                                            <div
                                                onClick={() =>
                                                    openReport(receipt.id)
                                                }
                                                className="d-flex me-1"
                                                style={{ cursor: "pointer" }}
                                            >
                                                <box-icon
                                                    type="solid"
                                                    name="file-pdf"
                                                    color="#3e9d8f"
                                                    size="sm"
                                                    animation="tada-hover"
                                                ></box-icon>
                                            </div>
                                            <div
                                                hidden={isClosed}
                                                className="d-flex me-1"
                                                onClick={() => {
                                                    setAlertId(receipt.id);
                                                    setShowAlert(true);
                                                }}
                                                style={{ cursor: "pointer" }}
                                            >
                                                <box-icon
                                                    name="check-double"
                                                    color="#3e9d8f"
                                                    size="sm"
                                                    animation="tada-hover"
                                                ></box-icon>
                                            </div>
                                            <div
                                                onClick={() => {
                                                    setBrandEditId(receipt.id);
                                                    setBrandEdit(receipt.brand);
                                                    setShowBrandModal(true);
                                                }}
                                                className="d-flex"
                                                style={{ cursor: "pointer" }}
                                            >
                                                <box-icon
                                                    name="customize"
                                                    color="#3e9d8f"
                                                    size="sm"
                                                    animation="tada-hover"
                                                ></box-icon>
                                            </div>
                                            {user?.role === "admin" && (
                                                <div
                                                    hidden={
                                                        receipt.isLocked === "1"
                                                    }
                                                    onClick={() => {
                                                        setAlertId(receipt.id);
                                                        setShowDeleteAlert(
                                                            true
                                                        );
                                                    }}
                                                    className="d-flex me-1"
                                                    style={{ cursor: "pointer" }}
                                                >
                                                    <box-icon
                                                        name="x"
                                                        color="red"
                                                        size="sm"
                                                        animation="tada-hover"
                                                    ></box-icon>
                                                </div>
                                            )}
                                        </div>
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
                    paginationURL={`${LOCAL_URL}/receipts?userId=${
                        user?.id
                    }&storeId=${
                        selectedStore ? selectedStore.value : 0
                    }&isClosed=${isClosed}`}
                    setLoading={setLoading}
                    setState={setReceipts}
                    hasOtherParams={true}
                />
            )}
            {
                <Suspense
                    fallback={
                        <div className="d-flex justify-content-center align-items-center">
                            <Spinner animation="border" />
                        </div>
                    }
                >
                    {showAddReceipt && (
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
                    )}
                </Suspense>
            }
            {
                <Suspense
                    fallback={
                        <div className="d-flex justify-content-center align-items-center">
                            <Spinner animation="border" />
                        </div>
                    }
                >
                    {showDeliveryModal && (
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
                    )}
                </Suspense>
            }
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
            <Brand
                show={showBrandModal}
                receiptId={brandEditId}
                onClose={() => {
                    setShowBrandModal(false);
                }}
                editBrand={brandEdit}
                onUpdate={() => getReceipts(currentPage)}
            />
        </Container>
    );
};

export default Receipts;
