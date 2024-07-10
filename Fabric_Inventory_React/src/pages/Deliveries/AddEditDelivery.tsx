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
import axios from "axios";
import { LOCAL_URL } from "../../assets/common";
import { useTypedSelector } from "../../store/Store";
import { useDispatch } from "react-redux";
import { add, clear, update } from "../../store/DeliveryItemsSlice";
import { OptionsOrGroups, GroupBase } from "react-select";
import SelectAsync from "react-select/async";

type AddEditDeliveryProps = {
    show: boolean;
    edit: boolean;
    editId?: number;
    onAdd: () => void;
    onClose: () => void;
    rcptId?: number;
};

interface Error {
    type: "success" | "failure";
    message: string;
}

interface Delivery {
    receipt_id: number;
    lot_no: string;
    brand: string;
    company_id: number;
    store_id: number;
    contact_id: number;
    fabric_id: number;
    remarks: string;
    user_id: number;
}

interface DeliveryItem {
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

interface Store {
    id: number;
    name: string;
}

interface Company {
    id: number;
    name: string;
    address: string;
}

interface ReceiptId {
    id: number;
}

interface Summary {
    rolls: number;
    weight: number;
}

interface Detail {
    dia: number;
    rolls: number;
    weight: string;
}

interface Options {
    label: string;
    value: string;
}

interface Supplier {
    id: number;
    name: string;
}

const AddEditDelivery: React.FC<AddEditDeliveryProps> = ({
    show,
    edit,
    editId,
    onAdd,
    onClose,
    rcptId,
}) => {
    const { user } = useUserContext();
    const [errors, setErrors] = useState<Error[]>([]);
    const [delivery, setDelivery] = useState<Delivery>({
        receipt_id: 0,
        lot_no: "",
        brand: "",
        company_id: 0,
        store_id: 0,
        contact_id: 0,
        fabric_id: 0,
        remarks: "",
        user_id: user!.id,
    });
    const [loading, setLoading] = useState(false);
    const [fabrics, setFabrics] = useState<Fabric[]>([]);
    const [colors, setColors] = useState<Color[]>([]);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [stores, setStores] = useState<Store[]>([]);
    const [receiptIds, setReceiptIds] = useState<ReceiptId[]>([]);
    const [receiptId, setReceiptId] = useState(0);
    const [dias, setDias] = useState<number[]>([]);
    const deliveryItems = useTypedSelector((s) => s.deliveryItems);
    const dispatch = useDispatch();
    const [summary, setSummary] = useState<Summary>({ rolls: 0, weight: 0 });
    const [stockDetail, setStockDetail] = useState<DeliveryItem[]>([]);
    const [deliveryDetail, setDeliveryDetail] = useState<DeliveryItem[]>([]);
    const hasFetchedData = useRef(false);

    const clearErrors = () => {
        setTimeout(() => {
            setErrors([]);
        }, 3000);
    };

    useEffect(() => {
        const loadInitialData = async () => {
            if (hasFetchedData.current) return;

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

            const getStores = async () => {
                try {
                    const response = await axios.get(
                        `${LOCAL_URL}/userstores/${user!.id}`
                    );
                    const { data } = response;
                    setStores(data.stores);
                } catch (error: any) {
                    const { response } = error;
                    setErrors((p) => [
                        ...p,
                        { message: response.data.message, type: "failure" },
                    ]);
                    clearErrors();
                }
            };

            const getCompanies = async () => {
                try {
                    const response = await axios.get(
                        `${LOCAL_URL}/companies?all=true`
                    );
                    const { data } = response;
                    setCompanies(data.companies);
                } catch (error: any) {
                    const { response } = error;
                    setErrors((p) => [
                        ...p,
                        { message: response.data.message, type: "failure" },
                    ]);
                    clearErrors();
                }
            };

            const getReceiptIds = async () => {
                try {
                    const response = await axios.get(
                        `${LOCAL_URL}/deliverable-receipts?userId=${user!.id}`,
                        {
                            headers: {
                                Accept: "application/json",
                            },
                        }
                    );

                    const { data } = response;
                    setReceiptIds(data.receiptIds);
                } catch (error: any) {
                    const { response } = error;
                    setErrors((p) => [
                        ...p,
                        { message: response.data.message, type: "failure" },
                    ]);
                    clearErrors();
                }
            };

            await Promise.all([
                getFabrics(),
                getColors(),
                getStores(),
                getCompanies(),
                getReceiptIds(),
            ]);

            setLoading(false);
            hasFetchedData.current = true;
        };

        loadInitialData();
    }, []);

    useEffect(() => {
        const getDetails = async () => {
            try {
                setLoading(true);
                dispatch(clear());
                const response = await axios.get(
                    `${LOCAL_URL}/stock-receipt/${receiptId}`,
                    {
                        headers: {
                            Accept: "application/json",
                        },
                    }
                );

                const {
                    data: { receiptMaster, stockDetails },
                } = response;

                setDelivery({
                    receipt_id: receiptMaster.id,
                    lot_no: receiptMaster.lot_no,
                    brand: receiptMaster.brand,
                    company_id: receiptMaster.company_id,
                    store_id: receiptMaster.store_id,
                    fabric_id: receiptMaster.fabric_id,
                    contact_id: 0,
                    remarks: "",
                    user_id: user!.id,
                });

                const ColorIds: number[] = stockDetails.map(
                    (detail: DeliveryItem) => Number(detail.color_id)
                );
                const Dias: number[] = stockDetails.map(
                    (detail: DeliveryItem) => Number(detail.dia)
                );

                const uniqueColorIds = Array.from(new Set(ColorIds));
                const uniqueDias = Array.from(new Set(Dias));
                setDias(uniqueDias);

                let details: DeliveryItem[] = stockDetails.map(
                    (detail: DeliveryItem) => ({
                        color_id: +detail.color_id,
                        dia: +detail.dia,
                        rolls: +detail.rolls,
                        weight: detail.weight,
                    })
                );

                setStockDetail(details);
                dispatch(clear());
                uniqueColorIds.forEach((colorId) => {
                    let details: Detail[] = stockDetails
                        .filter(
                            (detail: DeliveryItem) =>
                                +detail.color_id === colorId
                        )
                        .map((item: DeliveryItem) => ({
                            dia: +item.dia,
                            rolls: +item.rolls,
                            weight: item.weight,
                        }));

                    dispatch(
                        add({
                            color_id: colorId,
                            details: details,
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

        if (receiptId > 0) {
            if (!edit) {
                getDetails();
            }
        }
    }, [receiptId]);

    const closeModal = () => {
        onClose();
        if (edit) {
            setDelivery({
                receipt_id: 0,
                lot_no: "",
                brand: "",
                company_id: 0,
                store_id: 0,
                contact_id: 0,
                fabric_id: 0,
                remarks: "",
                user_id: user!.id,
            });
        }
        dispatch(clear());
        setDias([]);
        setSummary({
            rolls: 0,
            weight: 0,
        });
        setReceiptId(0);
        setStockDetail([]);
        setDeliveryDetail([]);
    };

    const saveDelivery = async () => {
        if (receiptId <= 0) {
            let error: Error = {
                message: "Please select receipt",
                type: "failure",
            };

            setErrors((p) => [...p, error]);
            clearErrors();
            return;
        } else if (delivery.contact_id === 0) {
            let error: Error = {
                message: "Please select contact",
                type: "failure",
            };

            setErrors((p) => [...p, error]);
            clearErrors();
            return;
        } else if (deliveryItems.length === 0) {
            let error: Error = {
                message: "No data to save",
                type: "failure",
            };

            setErrors((p) => [...p, error]);
            clearErrors();
            return;
        }

        try {
            setLoading(true);
            const delivery_items: DeliveryItem[] = [];

            deliveryItems.forEach((i) => {
                i.details.forEach((j) => {
                    delivery_items.push({
                        color_id: i.color_id,
                        dia: j.dia,
                        rolls: j.rolls,
                        weight: j.weight || "0",
                    });
                });
            });

            const response = await axios.post(
                edit
                    ? `${LOCAL_URL}/deliveries/${editId}?_method=PUT`
                    : `${LOCAL_URL}/deliveries`,
                { ...delivery, delivery_items: delivery_items },
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

            setDelivery({
                receipt_id: 0,
                lot_no: "",
                brand: "",
                company_id: 0,
                store_id: 0,
                contact_id: 0,
                fabric_id: 0,
                remarks: "",
                user_id: user!.id,
            });
            setDias([]);

            dispatch(clear());
            onAdd();
            closeModal();
            window.open(`/delivery-report/${data.id}`, "_blank");
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

    const loadSuppliers = async (
        inputValue: string,
        callback: (
            options: OptionsOrGroups<Options, GroupBase<Options>>
        ) => void
    ): Promise<OptionsOrGroups<Options, GroupBase<Options>>> => {
        try {
            const response = await axios.get(`${LOCAL_URL}/suppliers`, {
                params: { query: inputValue },
            });
            const options = response.data.suppliers.map((item: Supplier) => ({
                label: item.name,
                value: item.id,
            }));
            callback(options);
            return options;
        } catch (error) {
            console.error("Error fetching data:", error);
            callback([]);
            return [];
        }
    };

    useEffect(() => {
        let details = deliveryItems.map((i) => i.details);

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
    }, [deliveryItems]);

    useEffect(() => {
        if (rcptId) {
            setReceiptId(rcptId);
        }
    }, [rcptId]);

    useEffect(() => {
        const getDetails = async () => {
            try {
                setLoading(true);
                const response = await axios.get(
                    `${LOCAL_URL}/deliveries/${editId}`,
                    {
                        headers: {
                            Accept: "application/json",
                        },
                    }
                );

                const {
                    receiptMaster,
                    stockDetails,
                    deliveryMaster,
                    deliveryDetails,
                } = response.data;

                setReceiptId(receiptMaster.id);

                setDelivery({
                    receipt_id: receiptMaster.id,
                    lot_no: receiptMaster.lot_no,
                    brand: receiptMaster.brand,
                    company_id: receiptMaster.company_id,
                    store_id: receiptMaster.store_id,
                    fabric_id: receiptMaster.fabric_id,
                    contact_id: deliveryMaster.contact_id,
                    remarks: deliveryMaster.remarks,
                    user_id: user!.id,
                });

                const ColorIds: number[] = stockDetails.map(
                    (detail: DeliveryItem) => Number(detail.color_id)
                );
                const Dias: number[] = stockDetails.map(
                    (detail: DeliveryItem) => Number(detail.dia)
                );

                const uniqueColorIds = Array.from(new Set(ColorIds));
                const uniqueDias = Array.from(new Set(Dias));
                setDias(uniqueDias);

                let details: DeliveryItem[] = stockDetails.map(
                    (detail: DeliveryItem) => ({
                        color_id: +detail.color_id,
                        dia: +detail.dia,
                        rolls: +detail.rolls,
                        weight: detail.weight,
                    })
                );

                setStockDetail(details);

                let details2: DeliveryItem[] = deliveryDetails.map(
                    (detail: DeliveryItem) => ({
                        color_id: +detail.color_id,
                        dia: +detail.dia,
                        rolls: +detail.rolls,
                        weight: detail.weight,
                    })
                );

                setDeliveryDetail(details2);

                dispatch(clear());
                uniqueColorIds.forEach((colorId) => {
                    let details: Detail[] = deliveryDetails
                        .filter(
                            (detail: DeliveryItem) =>
                                +detail.color_id === colorId
                        )
                        .map((item: DeliveryItem) => ({
                            dia: +item.dia,
                            rolls: +item.rolls,
                            weight: item.weight,
                        }));

                    dispatch(
                        add({
                            color_id: colorId,
                            details: details,
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

        if (edit && editId) {
            getDetails();
        }
    }, [edit]);

    return (
        <Modal
            show={show}
            backdrop="static"
            keyboard={false}
            onHide={closeModal}
            centered
            fullscreen
            scrollable
        >
            <Modal.Header closeButton>
                <Modal.Title>
                    {`${edit ? "Edit Delivery" : "Add Delivery"}`}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <ToastContainer
                    position="bottom-end"
                    className="p-3 font-monospace"
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
                <Row className="mb-3">
                    <Col xs={1}>
                        <FloatingLabel
                            controlId="receipt_id"
                            label="Receipt"
                            className="text-secondary"
                        >
                            <Form.Select
                                value={receiptId}
                                onChange={(e) => {
                                    setReceiptId(+e.target.value);
                                }}
                                disabled={edit}
                            >
                                <option value="0"></option>
                                {receiptIds.map((receiptId, index) => {
                                    return (
                                        <option
                                            key={index}
                                            value={receiptId.id}
                                        >
                                            {receiptId.id}
                                        </option>
                                    );
                                })}
                            </Form.Select>
                        </FloatingLabel>
                    </Col>
                    <Col xs={1}>
                        <FloatingLabel
                            controlId="lot_no"
                            label="Lot No"
                            className="text-secondary"
                        >
                            <Form.Control
                                disabled
                                type="text"
                                placeholder="***"
                                value={delivery.lot_no}
                                onChange={(e) =>
                                    setDelivery((prev) => ({
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
                                disabled
                                type="text"
                                placeholder="***"
                                value={delivery.brand}
                                onChange={(e) =>
                                    setDelivery((prev) => ({
                                        ...prev,
                                        brand: e.target.value,
                                    }))
                                }
                            />
                        </FloatingLabel>
                    </Col>
                    <Col xs={2}>
                        <FloatingLabel
                            controlId="fabric_id"
                            label="Cloth Type"
                            className="text-secondary"
                        >
                            <Form.Select
                                disabled
                                value={delivery.fabric_id}
                                onChange={(e) =>
                                    setDelivery((prev) => ({
                                        ...prev,
                                        fabric_id: Number(e.target.value),
                                    }))
                                }
                            >
                                <option value="0"></option>
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
                    <Col xs={3}>
                        <FloatingLabel
                            controlId="company_id"
                            label="Company"
                            className="text-secondary"
                        >
                            <Form.Select
                                disabled
                                value={delivery.company_id}
                                onChange={(e) =>
                                    setDelivery((prev) => ({
                                        ...prev,
                                        company_id: Number(e.target.value),
                                    }))
                                }
                            >
                                <option value="0"></option>
                                {companies.map((c) => {
                                    return (
                                        <option key={c.id} value={c.id}>
                                            {c.name.toUpperCase()}
                                        </option>
                                    );
                                })}
                            </Form.Select>
                        </FloatingLabel>
                    </Col>
                    <Col xs={3}>
                        <FloatingLabel
                            controlId="store_id"
                            label="Store"
                            className="text-secondary"
                        >
                            <Form.Select
                                disabled
                                value={delivery.store_id}
                                onChange={(e) =>
                                    setDelivery((prev) => ({
                                        ...prev,
                                        store_id: Number(e.target.value),
                                    }))
                                }
                            >
                                <option value="0"></option>
                                {stores.map((s) => {
                                    return (
                                        <option key={s.id} value={s.id}>
                                            {s.name.toUpperCase()}
                                        </option>
                                    );
                                })}
                            </Form.Select>
                        </FloatingLabel>
                    </Col>
                </Row>
                <Row>
                    <Col xs={2}>
                    <SelectAsync
                            placeholder="Select Contact"
                            cacheOptions
                            loadOptions={loadSuppliers}
                            styles={{
                                control: (baseStyles, _) => ({
                                    ...baseStyles,
                                    minHeight: "58px",
                                }),
                            }}
                            onChange={(e) => {
                                setDelivery((prev) => ({
                                    ...prev,
                                    contact_id: Number(e ? e.value : 0),
                                }));
                            }}
                            isClearable
                        />
                    </Col>
                    <Col xs={10}>
                        <FloatingLabel
                            controlId="remarks"
                            label="Remarks"
                            className="text-secondary"
                        >
                            <Form.Control
                                type="text"
                                placeholder="***"
                                value={delivery.remarks ?? ""}
                                onChange={(e) =>
                                    setDelivery((prev) => ({
                                        ...prev,
                                        remarks: e.target.value,
                                    }))
                                }
                            />
                        </FloatingLabel>
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
                                return (
                                    <th className="text-center" key={index}>
                                        {dia}
                                    </th>
                                );
                            })}
                            <th className="text-end">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td
                                    colSpan={4 + dias.length}
                                    className="text-center"
                                >
                                    Loading...
                                </td>
                            </tr>
                        ) : (
                            deliveryItems.map((deliveryItem, index) => (
                                <tr key={index}>
                                    <td style={{ verticalAlign: "middle" }}>
                                        {index + 1}
                                    </td>
                                    <td style={{ verticalAlign: "middle" }}>
                                        <Form.Select
                                            disabled
                                            defaultValue={deliveryItem.color_id}
                                        >
                                            {colors.map((color, index) => (
                                                <option
                                                    key={index}
                                                    value={color.id}
                                                >
                                                    {color.name.toUpperCase()}
                                                </option>
                                            ))}
                                        </Form.Select>
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
                                    {dias.map((d, i) => {
                                        let maxRolls =
                                            stockDetail.find(
                                                (detail) =>
                                                    detail.color_id ===
                                                        deliveryItem.color_id &&
                                                    detail.dia === d
                                            )?.rolls || 0;
                                        let maxWeight =
                                            stockDetail.find(
                                                (detail) =>
                                                    detail.color_id ===
                                                        deliveryItem.color_id &&
                                                    detail.dia === d
                                            )?.weight || 0;

                                        maxWeight = parseFloat(
                                            maxWeight.toString()
                                        );

                                        if (edit) {
                                            const extraRolls =
                                                deliveryDetail.find(
                                                    (detail) =>
                                                        detail.color_id ===
                                                            deliveryItem.color_id &&
                                                        detail.dia === d
                                                )?.rolls || 0;

                                            const extraWeight =
                                                deliveryDetail.find(
                                                    (detail) =>
                                                        detail.color_id ===
                                                            deliveryItem.color_id &&
                                                        detail.dia === d
                                                )?.weight || 0;

                                            maxRolls += extraRolls;
                                            maxWeight = (
                                                parseFloat(
                                                    maxWeight.toString()
                                                ) +
                                                parseFloat(
                                                    extraWeight.toString()
                                                )
                                            ).toString();
                                        }

                                        return (
                                            <td key={i}>
                                                <Table
                                                    borderless
                                                    className="inner-table"
                                                >
                                                    <tbody>
                                                        <tr className="table-input">
                                                            <td>
                                                                <Form.Control
                                                                    className="text-center"
                                                                    size="sm"
                                                                    disabled={
                                                                        deliveryItem.color_id ===
                                                                        0
                                                                    }
                                                                    value={
                                                                        deliveryItem
                                                                            .details[
                                                                            i
                                                                        ]
                                                                            .rolls ||
                                                                        ""
                                                                    }
                                                                    onChange={(
                                                                        e
                                                                    ) => {
                                                                        const value =
                                                                            +e
                                                                                .target
                                                                                .value;
                                                                        if (
                                                                            value <=
                                                                            maxRolls
                                                                        ) {
                                                                            dispatch(
                                                                                update(
                                                                                    {
                                                                                        color_id:
                                                                                            deliveryItem.color_id,
                                                                                        dia: d,
                                                                                        roll: value,
                                                                                        weight: undefined,
                                                                                    }
                                                                                )
                                                                            );
                                                                        } else {
                                                                            let error: Error =
                                                                                {
                                                                                    message: `Rolls cannot exceed ${maxRolls}`,
                                                                                    type: "failure",
                                                                                };
                                                                            setErrors(
                                                                                (
                                                                                    p
                                                                                ) => [
                                                                                    ...p,
                                                                                    error,
                                                                                ]
                                                                            );
                                                                            clearErrors();
                                                                        }
                                                                    }}
                                                                    min={0}
                                                                    max={
                                                                        maxRolls
                                                                    }
                                                                />
                                                            </td>
                                                        </tr>
                                                        <tr className="table-input">
                                                            <td>
                                                                <Form.Control
                                                                    className="text-center"
                                                                    size="sm"
                                                                    disabled={
                                                                        deliveryItem.color_id ===
                                                                        0
                                                                    }
                                                                    value={
                                                                        +deliveryItem
                                                                            .details[
                                                                            i
                                                                        ]
                                                                            .weight ||
                                                                        ""
                                                                    }
                                                                    onChange={(
                                                                        e
                                                                    ) => {
                                                                        const value =
                                                                            e
                                                                                .target
                                                                                .value;
                                                                        if (
                                                                            +value <=
                                                                            +maxWeight
                                                                        ) {
                                                                            dispatch(
                                                                                update(
                                                                                    {
                                                                                        color_id:
                                                                                            deliveryItem.color_id,
                                                                                        dia: d,
                                                                                        roll: undefined,
                                                                                        weight: e
                                                                                            .target
                                                                                            .value,
                                                                                    }
                                                                                )
                                                                            );
                                                                        } else {
                                                                            let error: Error =
                                                                                {
                                                                                    message: `Weight cannot exceed ${maxWeight}`,
                                                                                    type: "failure",
                                                                                };
                                                                            setErrors(
                                                                                (
                                                                                    p
                                                                                ) => [
                                                                                    ...p,
                                                                                    error,
                                                                                ]
                                                                            );
                                                                            clearErrors();
                                                                        }
                                                                    }}
                                                                    min={0}
                                                                    max={
                                                                        maxWeight
                                                                    }
                                                                />
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </Table>
                                            </td>
                                        );
                                    })}
                                    <td>
                                        <Table
                                            borderless
                                            className="inner-table"
                                        >
                                            <tbody>
                                                <tr className="table-input">
                                                    <td>
                                                        <Form.Control
                                                            className="text-end"
                                                            size="sm"
                                                            disabled
                                                            value={deliveryItems
                                                                .filter(
                                                                    (i) =>
                                                                        i.color_id ===
                                                                        deliveryItem.color_id
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
                                                            className="text-end"
                                                            size="sm"
                                                            disabled
                                                            value={deliveryItems
                                                                .filter(
                                                                    (i) =>
                                                                        i.color_id ===
                                                                        deliveryItem.color_id
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
                                                                )
                                                                .toFixed(2)}
                                                        />
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </Table>
                                    </td>
                                </tr>
                            ))
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
                    <Button size="lg" onClick={saveDelivery}>
                        {`${edit ? "Update" : "Save"}`}
                    </Button>
                </div>
            </Modal.Footer>
        </Modal>
    );
};

export default AddEditDelivery;
