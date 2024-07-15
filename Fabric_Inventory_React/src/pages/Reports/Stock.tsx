import {
    Button,
    Col,
    Container,
    OverlayTrigger,
    Row,
    Table,
    Tooltip,
    Form,
} from "react-bootstrap";
import Heading from "../../components/Heading";
import Select from "react-select";
import { useEffect, useState } from "react";
import axios from "axios";
import { LOCAL_URL } from "../../assets/common";
import { useUserContext } from "../../contexts/UserContext";
import { useNotificationContext } from "../../contexts/NotificationsContext";
import MyPagination from "../../components/Pagination";
import "./stock.css";
import * as ExcelJS from "exceljs";
import { saveAs } from "file-saver";

interface SaveFilePickerOptions {
    suggestedName?: string;
    types?: {
        description: string;
        accept: { [mimeType: string]: string[] };
    }[];
}

declare global {
    interface Window {
        showSaveFilePicker?: (
            options?: SaveFilePickerOptions
        ) => Promise<FileSystemFileHandle>;
    }
}

interface Option {
    label: string;
    value: string;
}

interface ReportRow {
    receiptNo: number;
    lotNo: string;
    brand: string;
    cloth: string;
    company: string;
    store: string;
    fabric: string;
    contact: string;
    rolls: number;
    weight: number;
    days: number;
}

interface LotAndBrand {
    lot_no: string;
    brand: string;
}

interface Store {
    id: number;
    name: string;
}

interface Fabric {
    id: number;
    name: string;
}

interface Meta {
    currentPage: number;
    lastPage: number;
}

const Stock: React.FC = () => {
    const [stores, setStores] = useState<Option[]>([]);
    const [lots, setLots] = useState<Option[]>([]);
    const [brands, setBrands] = useState<Option[]>([]);
    const [fabrics, setFabrics] = useState<Option[]>([]);
    const [selectedStore, setSelectedStore] = useState<Option | null>(null);
    const [selectedLot, setSelectedLot] = useState<Option | null>(null);
    const [selectedBrand, setSelectedBrand] = useState<Option | null>(null);
    const [selectedFabric, setSelectedFabric] = useState<Option | null>(null);
    const [reportRows, setReportRows] = useState<ReportRow[]>([]);
    const { user } = useUserContext();
    const { setNotifications } = useNotificationContext();
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [meta, setMeta] = useState<Meta>({
        currentPage: 1,
        lastPage: 1,
    });
    const [isClosed, setIsClosed] = useState(false);

    const getStock = async (page: number = 1) => {
        try {
            const response = await axios.get(
                `${LOCAL_URL}/stock?page=${page}
                &userId=${user!.id}
                &lot_no=${selectedLot ? selectedLot.value : ""}
                &brand=${selectedBrand ? selectedBrand.value : ""}
                &store_id=${selectedStore ? selectedStore.value : ""}
                &fabric_id=${selectedFabric ? selectedFabric.value : ""}
                &is_closed=${isClosed}`,
                {
                    headers: {
                        Accept: "application/json",
                    },
                }
            );

            const { data, meta } = response.data;
            setReportRows(data);
            setMeta({
                currentPage: meta.current_page,
                lastPage: meta.last_page,
            });
        } catch (error: any) {
            const { response } = error;
            setNotifications({
                message: response.data.message,
                result: "failure",
            });
        }
    };

    useEffect(() => {
        const loadInitialData = async () => {
            setLoading(true);
            const getLotsAndBrands = async () => {
                try {
                    const response = await axios.get(
                        `${LOCAL_URL}/lotsandbrands/${user!.id}`
                    );
                    const { lotsAndBrands } = response.data;
                    const lots: Option[] = [];
                    const brands: Option[] = [];
                    lotsAndBrands.forEach((i: LotAndBrand) => {
                        lots.push({
                            label: i.lot_no,
                            value: i.lot_no,
                        });
                        brands.push({
                            label: i.brand,
                            value: i.brand,
                        });
                    });
                    setLots(lots);
                    setBrands(brands);
                } catch (error: any) {
                    const {
                        response: {
                            data: { message },
                        },
                    } = error;
                    setNotifications({
                        message: message,
                        result: "failure",
                    });
                }
            };

            const getStores = async () => {
                try {
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
                } catch (error: any) {
                    const { response } = error;
                    setNotifications({
                        message: response.data.message,
                        result: "failure",
                    });
                }
            };

            const getFabrics = async () => {
                try {
                    const response = await axios.get(
                        `${LOCAL_URL}/fabrics?all=true`
                    );
                    const {
                        data: { data },
                    } = response;
                    setFabrics(() => {
                        return data.map((fabric: Fabric) => {
                            return {
                                label: fabric.name,
                                value: fabric.id,
                            };
                        });
                    });
                } catch (error: any) {
                    const { response } = error;
                    setNotifications({
                        message: response.data.message,
                        result: "failure",
                    });
                }
            };
            await Promise.all([getLotsAndBrands(), getStores(), getFabrics()]);
            // await getStock();
            setLoading(false);
        };

        loadInitialData();
    }, []);

    useEffect(() => {
        const getFilteredData = async () => {
            setLoading(true);
            await getStock();
            setLoading(false);
        };
        getFilteredData();
    }, [selectedStore, selectedLot, selectedBrand, selectedFabric, isClosed]);

    const downloadExcel = async () => {
        try {
            setLoading(true);
            const response = await axios.get(
                `${LOCAL_URL}/stock?all=true
                &userId=${user!.id}
                &lot_no=${selectedLot ? selectedLot.value : ""}
                &brand=${selectedBrand ? selectedBrand.value : ""}
                &store_id=${selectedStore ? selectedStore.value : ""}
                &fabric_id=${selectedFabric ? selectedFabric.value : ""}
                &is_closed=${isClosed ? "true" : "false"}`,
                {
                    headers: {
                        Accept: "application/json",
                    },
                }
            );

            const { data } = response.data;

            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet("Sheet1");

            // Add header row
            const headers = Object.keys(data[0]).map((key) => {
                if (key === "cloth") {
                    return "CLOTH";
                } else if (key === "fabric") {
                    return "CLOTH TYPE";
                } else {
                    return key.toUpperCase();
                }
            });
            const headerRow = worksheet.addRow(headers);
            headerRow.font = { bold: true };

            // Add data rows
            data.forEach((item: any) => {
                worksheet.addRow(
                    Object.values(item).map((value, index) => {
                        // Ensure the 9th column (weight) is a number
                        if (index === 9) {
                            return parseFloat(value as string).toFixed(2);
                        }
                        return value;
                    })
                );
            });

            // Auto fit columns
            (worksheet.columns as ExcelJS.Column[]).forEach((column) => {
                let maxLength = 10; // Default column width
                column.eachCell(
                    { includeEmpty: true },
                    (cell: ExcelJS.Cell) => {
                        if (cell.value !== undefined && cell.value !== null) {
                            const cellValue = cell.value.toString();
                            maxLength = Math.max(maxLength, cellValue.length);
                        }
                    }
                );
                column.width = maxLength + 2; // Add some padding
            });

            // Format the 9th column (index 8) as decimal with two digits
            worksheet.getColumn(10).numFmt = "0.00"; // 9th column (index 8) formatted as decimal

            const centerAlignedColumns = [1, 11];
            const rightAlignedColumns = [9, 10];
            rightAlignedColumns.forEach((column) => {
                worksheet.getColumn(column).alignment = { horizontal: "right" };
            });

            centerAlignedColumns.forEach((column) => {
                worksheet.getColumn(column).alignment = {
                    horizontal: "center",
                };
            });

            // Create buffer and save file
            const buffer = await workbook.xlsx.writeBuffer();

            // Save file to desktop
            if (window.showSaveFilePicker) {
                const options = {
                    suggestedName: "Stock Summary Report.xlsx",
                    types: [
                        {
                            description: "Excel file",
                            accept: {
                                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
                                    [".xlsx"],
                            },
                        },
                    ],
                };

                const fileHandle = await window.showSaveFilePicker(options);
                const writableStream = await fileHandle.createWritable();
                await writableStream.write(buffer);
                await writableStream.close();
            } else {
                // Fallback for browsers that do not support showSaveFilePicker
                const blob = new Blob([buffer], {
                    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                });
                saveAs(blob, "Stock Summary Report.xlsx");
            }
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
        <Container className="p-2" id="stock">
            <Heading title="Stock Report" />
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
                    />
                </Col>
                <Col xs={3}>
                    <Select
                        value={selectedBrand}
                        onChange={(e) => {
                            setSelectedBrand(e);
                        }}
                        options={brands}
                        placeholder="Select Brand"
                        isClearable
                    />
                </Col>
                <Col xs={2}>
                    <Select
                        value={selectedLot}
                        onChange={(e) => {
                            setSelectedLot(e);
                        }}
                        options={lots}
                        placeholder="Select Lot"
                        isClearable
                    />
                </Col>
                <Col xs={2}>
                    <Select
                        value={selectedFabric}
                        onChange={(e) => {
                            setSelectedFabric(e);
                        }}
                        options={fabrics}
                        placeholder="Cloth Type"
                        isClearable
                    />
                </Col>
                <Col
                    xs={1}
                    className="d-flex justify-content-start align-items-center"
                >
                    <Form.Check
                        type="switch"
                        label="Closed"
                        id="is_closed"
                        className="text-secondary"
                        onClick={(
                            e: React.MouseEvent<HTMLInputElement, MouseEvent>
                        ) => {
                            const target = e.target as HTMLInputElement;
                            setIsClosed(target.checked);
                        }}
                    />
                </Col>
                <Col xs={1}>
                    <Button
                        variant="success"
                        onClick={downloadExcel}
                        className="d-flex w-75 justify-content-center ms-auto"
                    >
                        <box-icon
                            name="download"
                            color="white"
                            size="sm"
                        ></box-icon>
                    </Button>
                </Col>
            </Row>
            <hr />
            <Table striped bordered hover size="sm">
                <thead>
                    <tr style={{ verticalAlign: "middle" }}>
                        <th>R. No</th>
                        <th>Lot No</th>
                        <th className="brand">Brand</th>
                        <th className="company">Company</th>
                        <th className="store">Store</th>
                        <th className="cloth">Cloth</th>
                        <th>Type</th>
                        <th className="contact">Contact</th>
                        <th>Rolls</th>
                        <th>Weight</th>
                        <th>Days</th>
                        <th>PDF</th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr>
                            <td className="text-center" colSpan={12}>
                                Loading...
                            </td>
                        </tr>
                    ) : (
                        reportRows.map((row, index) => (
                            <tr style={{ verticalAlign: "middle" }} key={index}>
                                <td className="text-center">{row.receiptNo}</td>
                                <td>{row.lotNo.toUpperCase()}</td>
                                <OverlayTrigger
                                    placement="top"
                                    overlay={
                                        <Tooltip>
                                            {row.brand
                                                ? row.brand.toUpperCase()
                                                : "NOT GIVEN"}
                                        </Tooltip>
                                    }
                                >
                                    <td className="brand">
                                        {row.brand
                                            ? row.brand.toUpperCase()
                                            : "NOT GIVEN"}
                                    </td>
                                </OverlayTrigger>
                                {
                                    <OverlayTrigger
                                        overlay={
                                            <Tooltip>
                                                {row.company.toUpperCase()}
                                            </Tooltip>
                                        }
                                    >
                                        <td className="company">
                                            {row.company.toUpperCase()}
                                        </td>
                                    </OverlayTrigger>
                                }
                                {
                                    <OverlayTrigger
                                        overlay={
                                            <Tooltip>
                                                {row.store.toUpperCase()}
                                            </Tooltip>
                                        }
                                    >
                                        <td className="store">
                                            {row.store.toUpperCase()}
                                        </td>
                                    </OverlayTrigger>
                                }
                                <OverlayTrigger
                                    placement="top"
                                    overlay={
                                        <Tooltip>
                                            {row.cloth.toUpperCase()}
                                        </Tooltip>
                                    }
                                >
                                    <td className="cloth">
                                        {row.cloth.toUpperCase()}
                                    </td>
                                </OverlayTrigger>
                                <td>{row.fabric.toUpperCase()}</td>
                                <OverlayTrigger
                                    placement="top"
                                    overlay={
                                        <Tooltip>
                                            {row.contact.toUpperCase()}
                                        </Tooltip>
                                    }
                                >
                                    <td className="contact">
                                        {row.contact.toUpperCase()}
                                    </td>
                                </OverlayTrigger>
                                <td className="text-end">{row.rolls}</td>
                                <td className="text-end">
                                    {(+row.weight).toFixed(2)}
                                </td>
                                <td className="text-center">{row.days}</td>
                                <td>
                                    <div className="d-flex">
                                        <div
                                            className="d-flex"
                                            onClick={() =>
                                                window.open(
                                                    `/stock-report/${row.receiptNo}`,
                                                    "_blank"
                                                )
                                            }
                                        >
                                            <box-icon
                                                type="solid"
                                                name="file-pdf"
                                                color="green"
                                                size="sm"
                                            ></box-icon>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </Table>
            {reportRows.length > 0 && (
                <MyPagination
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    lastPage={meta.lastPage}
                    paginationURL={`${LOCAL_URL}/stock?userId=${user!.id}
                    &lot_no=${selectedLot ? selectedLot.value : ""}
                    &brand=${selectedBrand ? selectedBrand.value : ""}
                    &store_id=${selectedStore ? selectedStore.value : ""}
                    &fabric_id=${selectedFabric ? selectedFabric.value : ""}
                    &is_closed=${isClosed}`}
                    setLoading={setLoading}
                    setState={setReportRows}
                    hasOtherParams={true}
                />
            )}
        </Container>
    );
};

export default Stock;
