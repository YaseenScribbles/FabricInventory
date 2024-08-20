import { useEffect, useRef, useState } from "react";
import {
    Button,
    Col,
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
import Select, { GroupBase, OptionsOrGroups } from "react-select";
// import CustomAlert from "../../components/Alert";
import AlertModal from "../../components/AlertModal";
import SelectAsync from "react-select/async";

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
    cloth: string;
    company_id: number;
    store_id: number;
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

interface Store {
    id: number;
    name: string;
}

interface Company {
    id: number;
    name: string;
    address: string;
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

interface Options {
    label: string;
    value: string;
}

interface Supplier {
    id: number;
    name: string;
}

const AddReceipt: React.FC<AddReceiptProps> = ({
    show,
    onClose,
    onAdded,
    edit,
    editId,
}) => {
    const { user } = useUserContext();
    const [fabricOptions, setFabricOptions] = useState<Options[]>([]);
    const [selectedFabric, setSelectedFabric] = useState<Options | null>(null);
    const [colors, setColors] = useState<Color[]>([]);
    const [companyOptions, setCompanyOptions] = useState<Options[]>([]);
    const [selectedCompany, setSelectedCompany] = useState<Options | null>(
        null
    );
    const [storeOptions, setStoreOptions] = useState<Options[]>([]);
    const [selectedStore, setSelectedStore] = useState<Options | null>(null);
    const dispatch = useDispatch();
    const receiptItems = useTypedSelector((s) => s.receiptItems);
    const [errors, setErrors] = useState<Error[]>([]);
    const [loading, setLoading] = useState(false);
    const [diasString, setDiasString] = useState("");
    const [dias, setDias] = useState<number[]>([]);
    const [selectedColors, setSelectedColors] = useState<number[]>([]);
    const [summary, setSummary] = useState<Summary>({ rolls: 0, weight: 0 });
    const [showAlert, setShowAlert] = useState(false);
    const [removeIndex, setRemoveIndex] = useState(0);
    const hasFetchedData = useRef(false);

    const [receipt, setReceipt] = useState<Receipt>({
        lot_no: "",
        brand: "",
        cloth: "",
        company_id: 0,
        store_id: 0,
        contact_id: 0,
        fabric_id: 0,
        remarks: "",
        user_id: user!.id,
    });

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
                    // setFabrics(data.data);

                    const fabric_options: Options[] = data.data.map(
                        (fabric: Fabric) => ({
                            label: fabric.name.toUpperCase(),
                            value: fabric.id,
                        })
                    );

                    setFabricOptions(fabric_options);
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

                    // const color_options: Options[] = data.data.map(
                    //     (color: Color) => ({
                    //         label: color.name,
                    //         value: color.id,
                    //     })
                    // );

                    // setColorOptions(color_options);
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
                    // setStores(data.stores);

                    const store_options: Options[] = data.stores.map(
                        (store: Store) => ({
                            label: store.name.toUpperCase(),
                            value: store.id,
                        })
                    );

                    setStoreOptions(store_options);
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
                    // setCompanies(data.companies);
                    const company_options: Options[] = data.companies.map(
                        (company: Company) => ({
                            label: company.name.toUpperCase(),
                            value: company.id,
                        })
                    );

                    setCompanyOptions(company_options);
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
            ]);

            hasFetchedData.current = true;
            setLoading(false);
        };

        loadInitialData();
    }, []);

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
                    cloth: data.cloth,
                    company_id: data.company_id,
                    store_id: data.store_id,
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
        if (
            dias.length === 0 ||
            (dias.length === diasArray.length &&
                diasArray.every((d) => dias.includes(d)))
        ) {
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
        } else {
            let error: Error = {
                message: "Selected dias cannot be changed",
                type: "failure",
            };

            setErrors((p) => [...p, error]);
            clearErrors();
        }
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
        } else if (receipt.cloth === "") {
            let error: Error = {
                message: "Please enter cloth name",
                type: "failure",
            };

            setErrors((p) => [...p, error]);
            clearErrors();
            return;
        } else if (receipt.company_id === 0) {
            let error: Error = {
                message: "Please select company",
                type: "failure",
            };

            setErrors((p) => [...p, error]);
            clearErrors();
            return;
        } else if (receipt.store_id === 0) {
            let error: Error = {
                message: "Please select store",
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
                message: "No data to save",
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
                cloth: "",
                company_id: 0,
                store_id: 0,
                contact_id: 0,
                fabric_id: 0,
                remarks: "",
                user_id: user!.id,
            });
            setDiasString("");
            setDias([]);

            dispatch(clear());
            onAdded();
            closeModal();
            window.open(`/receipt-report/${data.id}`, "_blank");
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
        // const pattern = /^\d{2}(,\d{2})*$/;
        // const pattern = /^\d{2}(,\s*\d{2})*$/;
        const pattern = /^\d{2}(\s*,\s*\d{2})*$/;
        return pattern.test(input);
    };

    const closeModal = () => {
        onClose();
        if (edit) {
            setReceipt({
                lot_no: "",
                brand: "",
                cloth: "",
                company_id: 0,
                store_id: 0,
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
    };

    return (
        <Modal
            show={show}
            onHide={closeModal}
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
                        <Form.Label>Lot No</Form.Label>
                        <Form.Control
                            type="text"
                            value={receipt.lot_no}
                            onChange={(e) =>
                                setReceipt((prev) => ({
                                    ...prev,
                                    lot_no: e.target.value,
                                }))
                            }
                            autoFocus
                        />
                    </Col>
                    <Col xs={2}>
                        <Form.Label>Brand</Form.Label>
                        <Form.Control
                            type="text"
                            value={receipt.brand}
                            onChange={(e) =>
                                setReceipt((prev) => ({
                                    ...prev,
                                    brand: e.target.value,
                                }))
                            }
                        />
                    </Col>
                    <Col xs={2}>
                        <Form.Label>Company</Form.Label>
                        <Select
                            placeholder="Select Company"
                            value={selectedCompany}
                            options={companyOptions}
                            onChange={(e) => {
                                setSelectedCompany(e);
                                setReceipt((prev) => ({
                                    ...prev,
                                    company_id: Number(e ? e.value : 0),
                                }));
                            }}
                        />
                    </Col>
                    <Col xs={2}>
                        <Form.Label>Store</Form.Label>
                        <Select
                            placeholder="Select Store"
                            value={selectedStore}
                            options={storeOptions}
                            onChange={(e) => {
                                setSelectedStore(e);
                                setReceipt((prev) => ({
                                    ...prev,
                                    store_id: Number(e ? e.value : 0),
                                }));
                            }}
                        />
                    </Col>
                    <Col xs={3}>
                        <Form.Label>Supplier</Form.Label>
                        <SelectAsync
                            placeholder="Select Supplier"
                            cacheOptions
                            loadOptions={loadSuppliers}
                            onChange={(e) => {
                                setReceipt((prev) => ({
                                    ...prev,
                                    contact_id: Number(e ? e.value : 0),
                                }));
                            }}
                            isClearable
                        />
                    </Col>
                    <Col xs={2}>
                        <Form.Label>Cloth Type</Form.Label>
                        <Select
                            placeholder="Select Cloth Type"
                            value={selectedFabric}
                            options={fabricOptions}
                            onChange={(e) => {
                                setSelectedFabric(e);
                                setReceipt((prev) => ({
                                    ...prev,
                                    fabric_id: Number(e ? e.value : 0),
                                }));
                            }}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col xs={3}>
                        <Form.Label>Cloth</Form.Label>
                        <Form.Control
                            type="text"
                            value={receipt.cloth}
                            onChange={(e) =>
                                setReceipt((prev) => ({
                                    ...prev,
                                    cloth: e.target.value,
                                }))
                            }
                        />
                    </Col>
                    <Col xs={6}>
                        <Form.Label>Remarks</Form.Label>
                        <Form.Control
                            type="text"
                            value={receipt.remarks ?? ""}
                            onChange={(e) =>
                                setReceipt((prev) => ({
                                    ...prev,
                                    remarks: e.target.value,
                                }))
                            }
                        />
                    </Col>
                    <Col xs={2}>
                        <Form.Label>Dias</Form.Label>
                        <Form.Control
                            type="text"
                            value={diasString ?? ""}
                            onChange={(e) => {
                                const value = e.target.value;
                                setDiasString(value);
                            }}
                        />
                    </Col>
                    <Col xs={1} className="mt-1">
                        <Form.Label></Form.Label>
                        <Button
                            onClick={addEntry}
                            className="d-flex h-50 w-100 justify-content-center align-items-center"
                        >
                            <box-icon
                                name="plus"
                                color="white"
                                size="lg"
                            ></box-icon>
                        </Button>
                    </Col>
                </Row>
                <hr />
                <Table bordered size="sm">
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
                            <th></th>
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
                                        <td style={{ verticalAlign: "middle" }}>
                                            {index + 1}
                                        </td>
                                        <td style={{ verticalAlign: "middle" }}>
                                            <Select
                                                value={
                                                    availableColors.find(
                                                        (color) =>
                                                            color.value ===
                                                            item.color_id
                                                    ) || null
                                                }
                                                onChange={(e) => {
                                                    const colorId = e
                                                        ? +e.value
                                                        : 0;
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
                                                            color_id: colorId,
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
                                                                    className="text-center"
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
                                                                    className="text-center"
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
                                                                className="text-end"
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
                                                                className="text-end"
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
                                                                    )
                                                                    .toFixed(2)}
                                                            />
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </Table>
                                        </td>
                                        <td style={{ verticalAlign: "middle" }}>
                                            <Table
                                                className="inner-table"
                                                borderless
                                            >
                                                <tbody>
                                                    {receiptItems.length - 1 ===
                                                        index && (
                                                        <tr>
                                                            <td>
                                                                <Button
                                                                    variant="primary"
                                                                    onClick={() => {
                                                                        addEntry();
                                                                    }}
                                                                    className="d-flex p-0"
                                                                >
                                                                    <box-icon
                                                                        name="plus"
                                                                        color="white"
                                                                        size="sm"
                                                                    ></box-icon>
                                                                </Button>
                                                            </td>
                                                        </tr>
                                                    )}
                                                    <tr>
                                                        <td>
                                                            <Button
                                                                variant="danger"
                                                                onClick={() => {
                                                                    setRemoveIndex(
                                                                        index
                                                                    );
                                                                    setShowAlert(
                                                                        true
                                                                    );
                                                                }}
                                                                className="d-flex p-0"
                                                            >
                                                                <box-icon
                                                                    name="x"
                                                                    color="white"
                                                                    size="sm"
                                                                ></box-icon>
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </Table>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </Table>
                {/* <CustomAlert
                    show={showAlert}
                    onProceed={() => {
                        setShowAlert(false);
                        dispatch(remove(removeIndex));
                    }}
                    onCancel={() => {
                        setShowAlert(false);
                    }}
                /> */}
                <AlertModal
                    show={showAlert}
                    onProceed={() => {
                        setShowAlert(false);
                        dispatch(remove(removeIndex));
                    }}
                    onCancel={() => {
                        setShowAlert(false);
                    }}
                />
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
