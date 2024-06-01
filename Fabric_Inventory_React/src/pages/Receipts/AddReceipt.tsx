import { useEffect, useState } from "react";
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
import {
    add,
    clear,
    remove,
    update,
    updateColor,
} from "../../store/ReceiptItemsSlice";
import "./Receipt.css";
import Select from "react-select";

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

interface Detail {
    dia: number;
    rolls: number;
    weight: string;
}

interface ReceiptItem2 {
    color_id: number;
    details: Detail[];
}

interface Summary {
    rolls: number;
    weight: number;
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
    const [diasString, setDiasString] = useState("");
    const [dias, setDias] = useState<number[]>([]);
    const [selectedColors, setSelectedColors] = useState<number[]>([]);
    const [summary, setSummary] = useState<Summary>({ rolls: 0, weight: 0 });

    const [receipt, setReceipt] = useState<Receipt>({
        lot_no: "",
        brand: "",
        contact_id: 0,
        fabric_id: 0,
        remarks: "",
        user_id: user!.id,
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

    const getAvailableColors = (colorId: number) => {
        return colors.filter(
            (c) => c.id === colorId || !selectedColors.includes(c.id)
        );
    };

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
                const colorIds: number[] = Array.from(
                    new Set(
                        data.receipt_items.map(
                            (item: ReceiptItem) => +item.color_id
                        )
                    )
                );
                const dias: number[] = Array.from(
                    new Set(
                        data.receipt_items.map((item: ReceiptItem) => +item.dia)
                    )
                );

                setDias(dias);
                setSelectedColors(colorIds);

                let processedColors: number[] = [];

                colorIds.forEach((c) => {
                    if (!processedColors.includes(c)) {
                        let details: Detail[] = data.receipt_items
                            .filter((item: ReceiptItem) => +item.color_id === c)
                            .map((item: ReceiptItem) => ({
                                dia: +item.dia,
                                rolls: +item.rolls,
                                weight: (+item.weight).toFixed(2),
                            }));

                        dispatch(
                            add({
                                color_id: c,
                                details: details,
                            })
                        );

                        processedColors.push(c);
                    }
                });
            } catch (error: any) {
                const { response } = error;
                if (response) {
                    setErrors((p) => [
                        ...p,
                        { message: response.data.message, type: "failure" },
                    ]);
                    clearErrors();
                } else {
                    console.log(error);
                }
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
        if (diasString.endsWith(",")) {
            setDiasString(diasString.slice(0, diasString.length - 1));
        }

        if (!validateInput(diasString)) {
            let error: Error = {
                message: "Please enter valid dias",
                type: "failure",
            };

            setErrors((p) => [...p, error]);
            clearErrors();
            return;
        }

        const diasArray = diasString.split(",").map((d) => parseInt(d));
        let details: Detail[] = [];
        diasArray.forEach((dia) => {
            details.push({ dia: dia, rolls: 0, weight: "" });
        });
        setDias(diasArray);
        const newReceiptItem: ReceiptItem2 = {
            color_id: 0,
            details: details,
        };
        dispatch(add(newReceiptItem));
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

        const receipt_items: ReceiptItem[] = [];

        receiptItems.forEach((i) => {
            i.details.forEach((j) => {
                receipt_items.push({
                    color_id: i.color_id,
                    dia: j.dia,
                    rolls: j.rolls,
                    weight: j.weight,
                });
            });
        });

        try {
            const response = await axios.post(
                edit
                    ? `${LOCAL_URL}/receipts/${editId}?_method=PUT`
                    : `${LOCAL_URL}/receipts`,
                { ...receipt, receipt_items: receipt_items },
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
            setDiasString("");
            setDias([]);

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

    useEffect(() => {
        let details = receiptItems.map((i) => i.details);

        let rolls = details
            .flat()
            .reduce((acc, detail) => acc + +detail.rolls, 0);

        let weight = details
            .flat()
            .reduce((acc, detail) => acc + +detail.weight, 0);

        setSummary({
            rolls: rolls,
            weight: weight,
        });
    }, [receiptItems]);

    const validateInput = (input: string) => {
        const pattern = /^\d{2}(,\d{2})*$/;
        return pattern.test(input);
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
                }
                dispatch(clear());
                setDiasString("");
                setDias([]);
                setSelectedColors([]);
                setSummary({
                    rolls: 0,
                    weight: 0,
                });
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
                    <Col xs={2}>
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
                    <Col xs={2}>
                        <FloatingLabel
                            controlId="dias"
                            label="Dias"
                            className="text-secondary"
                        >
                            <Form.Control
                                type="text"
                                placeholder="***"
                                value={diasString ?? ""}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setDiasString(value);
                                }}
                            />
                        </FloatingLabel>
                    </Col>
                    <Col xs={1} className="mt-1">
                        <Button onClick={addEntry} className="p-0 b-0 d-flex">
                            <box-icon
                                name="plus"
                                color="white"
                                size="lg"
                            ></box-icon>
                        </Button>
                    </Col>
                </Row>
                <hr />
                <Table bordered hover>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th style={{ minWidth: "250px" }}>Color</th>
                            <th>Type</th>
                            {dias.map((dia, index) => {
                                return <th key={index}>{dia}</th>;
                            })}
                            <th>Total</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td
                                    colSpan={5 + dias.length}
                                    className="text-center"
                                >
                                    Loading...
                                </td>
                            </tr>
                        ) : (
                            receiptItems.map((item, index) => {
                                // const availableColors = getAvailableColors(
                                //     item.color_id
                                // ).map((color) => ({
                                //     value: color.id,
                                //     label: color.name,
                                // }));
                                const availableColors = getAvailableColors(
                                    item.color_id
                                ).map((option) => ({
                                    value: option.id,
                                    label: option.name,
                                }));
                                return (
                                    <tr key={index}>
                                        <td>{index + 1}</td>
                                        <td>
                                            <Select
                                                value={
                                                    availableColors.find(
                                                        (color) =>
                                                            color.value ===
                                                            item.color_id
                                                    ) || null
                                                }
                                                onChange={(e) => {
                                                    const colorId = e ?
                                                        +e.value : 0;
                                                    let newSelectedColors = [
                                                        ...selectedColors,
                                                    ];
                                                    newSelectedColors[index] =
                                                        colorId;
                                                    setSelectedColors(
                                                        newSelectedColors
                                                    );
                                                    dispatch(
                                                        updateColor({
                                                            color_id:
                                                                colorId,
                                                            index: index,
                                                        })
                                                    );
                                                }}
                                                options={availableColors}
                                                placeholder="Select Color"
                                            />
                                        </td>
                                        <td>
                                            <Table
                                                borderless
                                                className="inner-table"
                                            >
                                                <tbody>
                                                    <tr>
                                                        <td>
                                                            <Form.Control
                                                                size="sm"
                                                                defaultValue={
                                                                    "Rolls"
                                                                }
                                                                readOnly
                                                                disabled
                                                            />
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td>
                                                            <Form.Control
                                                                size="sm"
                                                                defaultValue={
                                                                    "Weight"
                                                                }
                                                                readOnly
                                                                disabled
                                                            />
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </Table>
                                        </td>
                                        {dias.map((d, i) => (
                                            <td key={i}>
                                                <Table
                                                    borderless
                                                    className="inner-table"
                                                >
                                                    <tbody>
                                                        <tr className="table-input">
                                                            <td>
                                                                <Form.Control
                                                                    size="sm"
                                                                    disabled={
                                                                        item.color_id ===
                                                                        0
                                                                    }
                                                                    value={
                                                                        item
                                                                            .details[
                                                                            i
                                                                        ]
                                                                            .rolls ||
                                                                        ""
                                                                    }
                                                                    onChange={(
                                                                        e
                                                                    ) =>
                                                                        dispatch(
                                                                            update(
                                                                                {
                                                                                    color_id:
                                                                                        item.color_id,
                                                                                    dia: d,
                                                                                    roll: +e
                                                                                        .target
                                                                                        .value,
                                                                                    weight: undefined,
                                                                                }
                                                                            )
                                                                        )
                                                                    }
                                                                />
                                                            </td>
                                                        </tr>
                                                        <tr className="table-input">
                                                            <td>
                                                                <Form.Control
                                                                    size="sm"
                                                                    disabled={
                                                                        item.color_id ===
                                                                        0
                                                                    }
                                                                    value={
                                                                        item
                                                                            .details[
                                                                            i
                                                                        ]
                                                                            .weight ||
                                                                        ""
                                                                    }
                                                                    onChange={(
                                                                        e
                                                                    ) =>
                                                                        dispatch(
                                                                            update(
                                                                                {
                                                                                    color_id:
                                                                                        item.color_id,
                                                                                    dia: d,
                                                                                    roll: undefined,
                                                                                    weight: e
                                                                                        .target
                                                                                        .value,
                                                                                }
                                                                            )
                                                                        )
                                                                    }
                                                                />
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </Table>
                                            </td>
                                        ))}
                                        <td>
                                            <Table
                                                borderless
                                                className="inner-table"
                                            >
                                                <tbody>
                                                    <tr className="table-input">
                                                        <td>
                                                            <Form.Control
                                                                size="sm"
                                                                disabled
                                                                value={receiptItems
                                                                    .filter(
                                                                        (i) =>
                                                                            i.color_id ===
                                                                            item.color_id
                                                                    )
                                                                    .reduce(
                                                                        (
                                                                            acc,
                                                                            curr
                                                                        ) =>
                                                                            acc +
                                                                            curr.details.reduce(
                                                                                (
                                                                                    acc,
                                                                                    curr
                                                                                ) =>
                                                                                    acc +
                                                                                    curr.rolls,
                                                                                0
                                                                            ),
                                                                        0
                                                                    )}
                                                            />
                                                        </td>
                                                    </tr>
                                                    <tr className="table-input">
                                                        <td>
                                                            <Form.Control
                                                                size="sm"
                                                                disabled
                                                                value={receiptItems
                                                                    .filter(
                                                                        (i) =>
                                                                            i.color_id ===
                                                                            item.color_id
                                                                    )
                                                                    .reduce(
                                                                        (
                                                                            acc,
                                                                            curr
                                                                        ) =>
                                                                            acc +
                                                                            +curr.details.reduce(
                                                                                (
                                                                                    acc,
                                                                                    curr
                                                                                ) =>
                                                                                    acc +
                                                                                    +curr.weight,
                                                                                0
                                                                            ),
                                                                        0
                                                                    )}
                                                            />
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </Table>
                                        </td>
                                        <td className="text-center">
                                            <Button
                                                variant="danger"
                                                onClick={() =>
                                                    dispatch(remove(index))
                                                }
                                                className="p-0 b-0 d-flex"
                                            >
                                                <box-icon
                                                    name="x"
                                                    color="white"
                                                    size="md"
                                                ></box-icon>
                                            </Button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </Table>
            </Modal.Body>
            <Modal.Footer>
                <div className="d-flex justify-content-between w-100">
                    <div className="d-flex flex-column w-50">
                        <Row className="fw-bold font-monospace">
                            <Col
                                className="col-3"
                                style={{ whiteSpace: "nowrap" }}
                            >
                                TOTAL ROLLS
                            </Col>
                            <Col className="col-auto"> : </Col>
                            <Col className="col-2">{summary.rolls}</Col>
                        </Row>
                        <Row className="fw-bold font-monospace">
                            <Col
                                className="col-3"
                                style={{ whiteSpace: "nowrap" }}
                            >
                                TOTAL WEIGHT
                            </Col>
                            <Col className="col-auto"> : </Col>
                            <Col className="col-2">
                                {summary.weight.toFixed(2)}
                            </Col>
                        </Row>
                    </div>
                    <Button size="lg" onClick={saveReceipt}>
                        {`${edit ? "Update" : "Save"}`}
                    </Button>
                </div>
            </Modal.Footer>
        </Modal>
    );
};

export default AddReceipt;
