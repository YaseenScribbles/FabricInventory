import { useEffect, useRef, useState } from "react";
import {
    Button,
    Col,
    FloatingLabel,
    Form,
    Modal,
    Row,
    Table,
    Toast,
    ToastContainer,
} from "react-bootstrap";
import { useUserContext } from "../../contexts/UserContext";
import { useDispatch } from "react-redux";
import axios from "axios";
import { LOCAL_URL } from "../../assets/common";
import { useTypedSelector } from "../../store/Store";
import { add, clear, remove } from "../../store/ReceiptItemsSlice";

type AddReceiptProps = {
    show: boolean;
    onClose: () => void;
    onAdded: () => void;
    edit?: boolean;
    editId?: number;
};

interface Receipt {
    lot_no: string;
    brand: string;
    contact_id: number;
    fabric_id: number;
    remarks: string;
    user_id: number;
}

interface ReceiptItem {
    color_id: number;
    dia: number;
    rolls: number;
    weight: string;
}

interface Fabric {
    id: number;
    name: string;
}

interface Color {
    id: number;
    name: string;
}

interface Error {
    type: "success" | "failure";
    message: string;
}

const AddReceipt: React.FC<AddReceiptProps> = ({
    show,
    onClose,
    onAdded,
    edit,
    editId,
}) => {
    const { user } = useUserContext();
    const [fabrics, setFabrics] = useState<Fabric[]>([]);
    const [colors, setColors] = useState<Color[]>([]);
    const dispatch = useDispatch();
    const receiptItems = useTypedSelector((s) => s.receiptItems);
    const [errors, setErrors] = useState<Error[]>([]);
    const [loading, setLoading] = useState(false);
    const colorRef = useRef<HTMLSelectElement>(null);
    // const [dias, setDias] = useState("");

    const [receipt, setReceipt] = useState<Receipt>({
        lot_no: "",
        brand: "",
        contact_id: 0,
        fabric_id: 0,
        remarks: "",
        user_id: user!.id,
    });

    const [receiptItem, setReceiptItem] = useState<ReceiptItem>({
        color_id: 0,
        dia: 0,
        rolls: 0,
        weight: "",
    });

    useEffect(() => {
        setLoading(true);
        const getFabrics = async () => {
            try {
                const response = await axios.get(
                    `${LOCAL_URL}/fabrics?all=true`
                );
                const { data } = response;
                setFabrics(data.data);
            } catch (error: any) {
                const { response } = error;
                setErrors((p) => [
                    ...p,
                    { message: response.data.message, type: "failure" },
                ]);
                clearErrors();
            }
        };
        const getColors = async () => {
            try {
                const response = await axios.get(
                    `${LOCAL_URL}/colors?all=true`
                );
                const { data } = response;
                setColors(data.data);
            } catch (error: any) {
                const { response } = error;
                setErrors((p) => [
                    ...p,
                    { message: response.data.message, type: "failure" },
                ]);
                clearErrors();
            }
        };

        getFabrics();
        getColors();

        setLoading(false);
    }, []);

    useEffect(() => {
        const getReceipt = async (id: number) => {
            setLoading(true);
            try {
                const response = await axios.get(`${LOCAL_URL}/receipts/${id}`);
                const { data } = response;
                setReceipt({
                    lot_no: data.lot_no,
                    brand: data.brand,
                    contact_id: data.contact_id,
                    fabric_id: data.fabric_id,
                    remarks: data.remarks,
                    user_id: user!.id,
                });

                dispatch(clear());
                data.receipt_items.forEach((item: ReceiptItem) => {
                    dispatch(
                        add({
                            color_id: +item.color_id,
                            dia: +item.dia,
                            rolls: +item.rolls,
                            weight: item.weight,
                        })
                    );
                });
            } catch (error: any) {
                const { response } = error;
                setErrors((p) => [
                    ...p,
                    { message: response.data.message, type: "failure" },
                ]);
                clearErrors();
            } finally {
                setLoading(false);
            }
        };
        if (edit) {
            getReceipt(editId!);
        }
    }, [edit]);

    const clearErrors = () => {
        setTimeout(() => {
            setErrors([]);
        }, 3000);
    };

    const addEntry = () => {
        if (receiptItem.color_id === 0) {
            let error: Error = {
                message: "Please select color",
                type: "failure",
            };

            setErrors((p) => [...p, error]);
            clearErrors();
            return;
        } else if (receiptItem.dia === 0) {
            let error: Error = {
                message: "Please enter dia",
                type: "failure",
            };

            setErrors((p) => [...p, error]);
            clearErrors();
            return;
        } else if (receiptItem.rolls === 0) {
            let error: Error = {
                message: "Please enter rolls",
                type: "failure",
            };

            setErrors((p) => [...p, error]);
            clearErrors();
            return;
        } else if (parseFloat(receiptItem.weight) === 0) {
            let error: Error = {
                message: "Please enter weight",
                type: "failure",
            };

            setErrors((p) => [...p, error]);
            clearErrors();
            return;
        }

        dispatch(add(receiptItem));
        setReceiptItem({
            color_id: 0,
            dia: 0,
            rolls: 0,
            weight: "",
        });
        colorRef.current?.focus();
    };

    const saveReceipt = async () => {
        if (receipt.lot_no === "") {
            let error: Error = {
                message: "Please enter Lot No",
                type: "failure",
            };

            setErrors((p) => [...p, error]);
            clearErrors();
            return;
        } else if (receipt.brand === "") {
            let error: Error = {
                message: "Please enter brand",
                type: "failure",
            };

            setErrors((p) => [...p, error]);
            clearErrors();
            return;
        } else if (receipt.contact_id === 0) {
            let error: Error = {
                message: "Please select contact",
                type: "failure",
            };

            setErrors((p) => [...p, error]);
            clearErrors();
            return;
        } else if (receipt.fabric_id === 0) {
            let error: Error = {
                message: "Please select fabric",
                type: "failure",
            };

            setErrors((p) => [...p, error]);
            clearErrors();
            return;
        } else if (receiptItems.length === 0) {
            let error: Error = {
                message: "No data",
                type: "failure",
            };

            setErrors((p) => [...p, error]);
            clearErrors();
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post(
                edit
                    ? `${LOCAL_URL}/receipts/${editId}?_method=PUT`
                    : `${LOCAL_URL}/receipts`,
                { ...receipt, receipt_items: receiptItems },
                { headers: { Accept: "application/json" } }
            );

            const { data } = response;
            setErrors((p) => [
                ...p,
                {
                    type: "success",
                    message: data.message,
                },
            ]);
            clearErrors();

            setReceipt({
                lot_no: "",
                brand: "",
                contact_id: 0,
                fabric_id: 0,
                remarks: "",
                user_id: user!.id,
            });

            setReceiptItem({
                color_id: 0,
                dia: 0,
                rolls: 0,
                weight: "",
            });

            dispatch(clear());
            onAdded();
        } catch (error: any) {
            const { response } = error;
            setErrors((p) => [
                ...p,
                { type: "failure", message: response.data.message },
            ]);
            clearErrors();
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            show={show}
            onHide={() => {
                onClose();
                if (edit) {
                    setReceipt({
                        lot_no: "",
                        brand: "",
                        contact_id: 0,
                        fabric_id: 0,
                        remarks: "",
                        user_id: user!.id,
                    });
                    dispatch(clear());
                }
            }}
            backdrop="static"
            keyboard={false}
            aria-labelledby="contained-modal-title-vcenter"
            centered
            fullscreen
            scrollable
        >
            <Modal.Header closeButton>
                <Modal.Title id="receipt">
                    {`${edit ? "Edit Receipt" : "Add Receipt"}`}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <ToastContainer
                    position="bottom-end"
                    className="p-3"
                    style={{ zIndex: 1 }}
                >
                    {errors.map((e, i) => {
                        return (
                            <Toast
                                key={i}
                                bg={
                                    `${e.type === "failure"}`
                                        ? "warning"
                                        : "success"
                                }
                            >
                                <Toast.Header closeButton={false}>
                                    <strong className="me-auto">
                                        Fabric Inventory
                                    </strong>
                                </Toast.Header>
                                <Toast.Body>
                                    <b
                                        className={`${
                                            e.type === "success" && "text-light"
                                        }`}
                                    >{`${e.message.toUpperCase()}`}</b>
                                </Toast.Body>
                            </Toast>
                        );
                    })}
                </ToastContainer>
                <Row>
                    <Col xs={1}>
                        <FloatingLabel
                            controlId="lot_no"
                            label="Lot No"
                            className="text-secondary"
                        >
                            <Form.Control
                                type="text"
                                placeholder="***"
                                value={receipt.lot_no}
                                onChange={(e) =>
                                    setReceipt((prev) => ({
                                        ...prev,
                                        lot_no: e.target.value,
                                    }))
                                }
                                autoFocus
                            />
                        </FloatingLabel>
                    </Col>
                    <Col xs={2}>
                        <FloatingLabel
                            controlId="brand"
                            label="Brand"
                            className="text-secondary"
                        >
                            <Form.Control
                                type="text"
                                placeholder="***"
                                value={receipt.brand}
                                onChange={(e) =>
                                    setReceipt((prev) => ({
                                        ...prev,
                                        brand: e.target.value,
                                    }))
                                }
                            />
                        </FloatingLabel>
                    </Col>
                    <Col xs={2}>
                        <FloatingLabel
                            controlId="contact_id"
                            label="Contact"
                            className="text-secondary"
                        >
                            <Form.Select
                                value={receipt.contact_id}
                                onChange={(e) =>
                                    setReceipt((prev) => ({
                                        ...prev,
                                        contact_id: Number(e.target.value),
                                    }))
                                }
                            >
                                <option value="0">Select Contact</option>
                                <option value={1}>Demo</option>
                            </Form.Select>
                        </FloatingLabel>
                    </Col>
                    <Col xs={2}>
                        <FloatingLabel
                            controlId="fabric_id"
                            label="Fabric"
                            className="text-secondary"
                        >
                            <Form.Select
                                value={receipt.fabric_id}
                                onChange={(e) =>
                                    setReceipt((prev) => ({
                                        ...prev,
                                        fabric_id: Number(e.target.value),
                                    }))
                                }
                            >
                                <option value="0">Select Fabric</option>
                                {fabrics.map((f) => {
                                    return (
                                        <option key={f.id} value={f.id}>
                                            {f.name.toUpperCase()}
                                        </option>
                                    );
                                })}
                            </Form.Select>
                        </FloatingLabel>
                    </Col>
                    <Col xs={5}>
                        <FloatingLabel
                            controlId="remarks"
                            label="Remarks"
                            className="text-secondary"
                        >
                            <Form.Control
                                type="text"
                                placeholder="***"
                                value={receipt.remarks ?? ""}
                                onChange={(e) =>
                                    setReceipt((prev) => ({
                                        ...prev,
                                        remarks: e.target.value,
                                    }))
                                }
                            />
                        </FloatingLabel>
                    </Col>
                </Row>
                <hr />
                <Row>
                    <Col>
                        <FloatingLabel
                            controlId="color_id"
                            label="Color"
                            className="text-secondary"
                        >
                            <Form.Select
                                value={receiptItem.color_id}
                                onChange={(e) =>
                                    setReceiptItem((prev) => ({
                                        ...prev,
                                        color_id: Number(e.target.value),
                                    }))
                                }
                                ref={colorRef}
                            >
                                <option value="0">Select Color</option>
                                {colors.map((c) => {
                                    return (
                                        <option key={c.id} value={c.id}>
                                            {c.name.toUpperCase()}
                                        </option>
                                    );
                                })}
                            </Form.Select>
                        </FloatingLabel>
                    </Col>
                    <Col>
                        <FloatingLabel
                            controlId="dia"
                            label="Dia"
                            className="text-secondary"
                        >
                            <Form.Control
                                type="text"
                                placeholder="***"
                                value={receiptItem.dia || ""}
                                onChange={(e) =>
                                    setReceiptItem((prev) => ({
                                        ...prev,
                                        dia: Number(e.target.value),
                                    }))
                                }
                            />
                        </FloatingLabel>
                    </Col>
                    <Col>
                        <FloatingLabel
                            controlId="rolls"
                            label="Rolls"
                            className="text-secondary"
                        >
                            <Form.Control
                                type="text"
                                placeholder="***"
                                value={receiptItem.rolls || ""}
                                onChange={(e) =>
                                    setReceiptItem((prev) => ({
                                        ...prev,
                                        rolls: Number(e.target.value),
                                    }))
                                }
                            />
                        </FloatingLabel>
                    </Col>
                    <Col>
                        <FloatingLabel
                            controlId="weight"
                            label="Weight"
                            className="text-secondary"
                        >
                            <Form.Control
                                type="text"
                                placeholder="***"
                                value={receiptItem.weight || ""}
                                onChange={(e) =>
                                    setReceiptItem((prev) => ({
                                        ...prev,
                                        weight: e.target.value,
                                    }))
                                }
                            />
                        </FloatingLabel>
                    </Col>
                    <Col>
                        <Button className="w-50 h-100" onClick={addEntry}>
                            ADD
                        </Button>
                    </Col>
                </Row>
                <hr />
                <Table striped bordered hover>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Color</th>
                            <th>Dia</th>
                            <th>Rolls</th>
                            <th>Weight</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={6} className="text-center">
                                    Loading...
                                </td>
                            </tr>
                        ) : (
                            receiptItems.map((item, index) => {
                                return (
                                    <tr key={index}>
                                        <td>{index + 1}</td>
                                        <td>
                                            {colors
                                                .find(
                                                    (c) =>
                                                        c.id === item.color_id
                                                )
                                                ?.name.toUpperCase()}
                                        </td>
                                        <td>{item.dia}</td>
                                        <td>{item.rolls}</td>
                                        <td>{(+item.weight).toFixed(2)}</td>
                                        <td>
                                            <Button
                                                variant="danger"
                                                onClick={() =>
                                                    dispatch(remove(item))
                                                }
                                            >
                                                <box-icon
                                                    name="x"
                                                    color="white"
                                                    size="xs"
                                                ></box-icon>
                                            </Button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                    <tfoot>
                        <tr>
                            <th></th>
                            <th></th>
                            <th></th>
                            <th>
                                {receiptItems.reduce(
                                    (acc, item) => acc + item.rolls,
                                    0
                                )}
                            </th>
                            <th>
                                {receiptItems.reduce(
                                    (acc, item) => acc + +item.weight,
                                    0
                                )}
                            </th>
                        </tr>
                    </tfoot>
                </Table>
            </Modal.Body>
            <Modal.Footer>
                <Button size="lg" onClick={saveReceipt}>
                    {`${edit ? "Update" : "Save"}`}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default AddReceipt;
