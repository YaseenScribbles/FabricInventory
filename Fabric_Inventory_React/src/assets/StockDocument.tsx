import {
    Document,
    View,
    Text,
    StyleSheet,
    Page,
    Font,
    PDFViewer,
} from "@react-pdf/renderer";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { LOCAL_URL } from "./common";
import { useParams } from "react-router";

interface Receipt {
    id: number;
    date: string;
    companyName: string;
    companyAddress: string;
    lot_no: string;
    brand: string;
    cloth: string;
    store: string;
    contact: string;
    fabric: string;
    remarks: string;
    days: string;
    status: string;
}

interface ReceiptItem {
    color: string;
    dia: number;
    rolls: number;
    weight: string;
}

interface ReceiptItem {
    color: string;
    dia: number;
    rolls: number;
    weight: string;
}

interface Detail {
    dia: number;
    rolls: number;
    weight: string;
}

interface ReceiptItem2 {
    color: string;
    details: Detail[];
}

Font.register({
    family: "Oswald",
    src: "https://fonts.gstatic.com/s/oswald/v13/Y_TKV6o8WovbUd3m_X9aAA.ttf",
});

const styles = StyleSheet.create({
    page: {
        padding: "15",
        fontFamily: "Oswald",
    },
    companyName: {
        fontSize: "15px",
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: "5",
    },
    companyAddress: {
        fontSize: "10",
        textAlign: "center",
        marginBottom: "5",
    },
    title: {
        fontSize: "15px",
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: "5",
    },
    heading: {
        fontSize: "10px",
        fontWeight: "bold",
        width: "75",
    },
    colon: {
        fontSize: "10",
        width: "20",
    },
    master: {
        fontSize: "10px",
        fontWeight: "bold",
    },
    columns: {
        display: "flex",
        flexDirection: "row",
        marginBottom: "5",
    },
    table: {
        marginTop: "10",
        display: "flex",
        width: "100%",
        borderStyle: "solid",
        borderWidth: 1,
        borderRightWidth: 0,
        borderBottomWidth: 0,
    },
    tableRow: {
        flexDirection: "row",
    },
    tableColHeader: {
        width: "30%",
        borderStyle: "solid",
        borderWidth: 1,
        borderLeftWidth: 0,
        borderTopWidth: 0,
        backgroundColor: "#E4E4E4",
    },
    tableCol: {
        width: "30%",
        borderStyle: "solid",
        borderWidth: 1,
        borderLeftWidth: 0,
        borderTopWidth: 0,
    },
    tableCell: {
        margin: 5,
        fontSize: 10,
    },
    rwContainer: {
        display: "flex",
        width: "100%",
        flexDirection: "column",
    },
    roll: {
        borderBottomWidth: 0.5,
        borderBottomColor: "#000",
    },
    weight: {
        borderTopWidth: 0.5,
        borderTopColor: "#000",
    },
    summary: {
        marginTop: "15",
        display: "flex",
        borderWidth: "1",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        width: "250",
        marginLeft: "30%",
    },
    sumaryRow: {
        flexDirection: "row",
    },
    signature: {
        marginTop: "10",
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        fontSize:"15"
    },
});

const StockDocument: React.FC = () => {
    const [receipt, setReceipt] = useState<Receipt>({
        id: 0,
        date: "",
        companyName: "",
        companyAddress: "",
        lot_no: "",
        brand: "",
        cloth: "",
        store: "",
        contact: "",
        fabric: "",
        remarks: "",
        days: "",
        status: "",
    });

    const [receiptItems, setReceiptItems] = useState<ReceiptItem2[]>([]);
    const { id } = useParams();
    const [dias, setDias] = useState<number[]>([]);

    const getStock = async () => {
        try {
            const response = await axios.get(
                `${LOCAL_URL}/stock-report/${id}`,
                {
                    headers: {
                        Accept: "application/json",
                    },
                }
            );

            const {
                data: { master, details },
            } = response;

            setReceipt({
                id: master.id,
                date: master.date,
                companyName: master.company_name,
                companyAddress: master.company_address,
                lot_no: master.lot_no,
                brand: master.brand,
                cloth: master.cloth,
                store: master.store,
                contact: master.contact,
                fabric: master.fabric,
                remarks: master.remarks,
                days: master.days,
                status: master.status,
            });

            let receipt_items: ReceiptItem2[] = [];

            const allColors = details.map(
                (detail: ReceiptItem) => detail.color
            );
            const uniqueColors: string[] = Array.from(new Set(allColors));

            const allDias = details.map((detail: ReceiptItem) => detail.dia);
            const uniqueDias: number[] = Array.from(new Set(allDias));

            setDias(uniqueDias);

            uniqueColors.forEach((color) => {
                let receipt_details: Detail[] = [];
                details.forEach((detail: ReceiptItem) => {
                    if (detail.color === color) {
                        receipt_details.push({
                            dia: +detail.dia,
                            rolls: +detail.rolls,
                            weight: (+detail.weight).toFixed(2),
                        });
                    }
                });
                receipt_items.push({
                    color: color,
                    details: receipt_details,
                });
            });

            setReceiptItems(receipt_items);
        } catch (error: any) {
            console.log(error);
        }
    };

    useEffect(() => {
        const loadInitialData = async () => {
            await getStock();
        };

        loadInitialData();
    }, []);

    return (
        <PDFViewer style={{ height: "99vh", width: "99vw" }}>
            <Document>
                <Page size={"A4"} style={styles.page}>
                    <View style={styles.companyName}>
                        <Text>{receipt.companyName.toUpperCase()}</Text>
                    </View>
                    <View style={styles.companyAddress}>
                        <Text>{receipt.companyAddress.toUpperCase()}</Text>
                    </View>
                    <Text style={styles.title}>STOCK REPORT</Text>
                    <View style={styles.columns}>
                        <Text style={styles.heading}>Lot No</Text>
                        <Text style={styles.colon}>:</Text>
                        <Text style={styles.master}>{receipt.lot_no}</Text>
                        <Text style={[styles.heading, { marginLeft: "auto" }]}>
                            Receipt No
                        </Text>
                        <Text style={styles.colon}>:</Text>
                        <Text style={[styles.master, { width: "50" }]}>
                            {receipt.id}
                        </Text>
                    </View>
                    <View style={styles.columns}>
                        <Text style={styles.heading}>Brand</Text>
                        <Text style={styles.colon}>:</Text>
                        <Text style={styles.master}>
                            {receipt.brand
                                ? receipt.brand.toUpperCase()
                                : "NOT GIVEN"}
                        </Text>
                        <Text style={[styles.heading, { marginLeft: "auto" }]}>
                            Date
                        </Text>
                        <Text style={styles.colon}>:</Text>
                        <Text style={[styles.master, { width: "50" }]}>
                            {new Date(receipt.date).toLocaleDateString()}
                        </Text>
                    </View>
                    <View style={styles.columns}>
                        <Text style={styles.heading}>Store</Text>
                        <Text style={styles.colon}>:</Text>
                        <Text style={styles.master}>
                            {receipt.store.toUpperCase()}
                        </Text>
                        <Text style={[styles.heading, { marginLeft: "auto" }]}>
                            Printed On
                        </Text>
                        <Text style={styles.colon}>:</Text>
                        <Text style={[styles.master, { width: "50" }]}>
                            {new Date().toLocaleDateString()}
                        </Text>
                    </View>
                    <View style={styles.columns}>
                        <Text style={styles.heading}>Supplier</Text>
                        <Text style={styles.colon}>:</Text>
                        <Text style={styles.master}>
                            {receipt.contact.toUpperCase()}
                        </Text>
                        <Text style={[styles.heading, { marginLeft: "auto" }]}>
                            Days
                        </Text>
                        <Text style={styles.colon}>:</Text>
                        <Text style={[styles.master, { width: "50" }]}>
                            {receipt.days}
                        </Text>
                    </View>
                    <View style={styles.columns}>
                        <Text style={styles.heading}>Cloth / Type</Text>
                        <Text style={styles.colon}>:</Text>
                        <Text style={styles.master}>
                            {`${receipt.cloth.toUpperCase()} / ${receipt.fabric.toUpperCase()}`}
                        </Text>
                        <Text style={[styles.heading, { marginLeft: "auto" }]}>
                            Status
                        </Text>
                        <Text style={styles.colon}>:</Text>
                        <Text style={[styles.master, { width: "50" }]}>
                            {receipt.status === "1" ? "Closed" : "Open"}
                        </Text>
                    </View>
                    <View style={styles.columns}>
                        <Text style={styles.heading}>Remarks</Text>
                        <Text style={styles.colon}>:</Text>
                        <Text style={styles.master}>
                            {receipt.remarks
                                ? receipt.remarks.toUpperCase()
                                : ""}
                        </Text>
                    </View>
                    <View style={styles.table}>
                        <View style={[styles.tableRow]}>
                            <View
                                style={[
                                    styles.tableColHeader,
                                    { width: "10%" },
                                ]}
                            >
                                <View style={[styles.tableCell]}>
                                    <Text>S No</Text>
                                </View>
                            </View>
                            <View
                                style={[
                                    styles.tableColHeader,
                                    { width: "30%" },
                                ]}
                            >
                                <View style={[styles.tableCell]}>
                                    <Text>Color</Text>
                                </View>
                            </View>
                            {dias.map((dia, index) => (
                                <View key={index} style={styles.tableColHeader}>
                                    <View
                                        style={[
                                            styles.tableCell,
                                            { textAlign: "right" },
                                        ]}
                                    >
                                        <Text>{`Dia - ${dia}`}</Text>
                                    </View>
                                </View>
                            ))}
                            <View style={styles.tableColHeader}>
                                <View
                                    style={[
                                        styles.tableCell,
                                        { textAlign: "right" },
                                    ]}
                                >
                                    <Text>Total</Text>
                                </View>
                            </View>
                        </View>
                        {receiptItems.map((item, index) => (
                            <View style={styles.tableRow} key={index}>
                                <View
                                    style={[
                                        styles.tableCol,
                                        {
                                            width: "10%",
                                            display: "flex",
                                            justifyContent: "center",
                                            alignItems: "center",
                                        },
                                    ]}
                                >
                                    <View style={styles.tableCell}>
                                        <Text>{index + 1}</Text>
                                    </View>
                                </View>
                                <View
                                    style={[
                                        styles.tableCol,
                                        {
                                            width: "30%",
                                            display: "flex",
                                            justifyContent: "center",
                                        },
                                    ]}
                                >
                                    <View style={[styles.tableCell]}>
                                        <Text>{item.color.toUpperCase()}</Text>
                                    </View>
                                </View>
                                {dias.map((dia, diaIndex) => {
                                    const detail: Detail = item.details.find(
                                        (d) => +d.dia === +dia
                                    )!;
                                    return (
                                        <View
                                            key={diaIndex}
                                            style={styles.tableCol}
                                        >
                                            <View
                                                style={[
                                                    styles.tableCell,
                                                    { textAlign: "right" },
                                                ]}
                                            >
                                                <View
                                                    style={styles.rwContainer}
                                                >
                                                    <View style={styles.roll}>
                                                        <Text>
                                                            {detail
                                                                ? detail.rolls
                                                                : "N/A"}
                                                        </Text>
                                                    </View>
                                                    <View style={styles.weight}>
                                                        <Text>
                                                            {detail
                                                                ? (+detail.weight).toFixed(
                                                                      2
                                                                  )
                                                                : "N/A"}
                                                        </Text>
                                                    </View>
                                                </View>
                                            </View>
                                        </View>
                                    );
                                })}
                                <View style={styles.tableCol}>
                                    <View
                                        style={[
                                            styles.tableCell,
                                            { textAlign: "right" },
                                        ]}
                                    >
                                        <View style={styles.rwContainer}>
                                            <View style={styles.roll}>
                                                <Text>
                                                    {item.details.reduce(
                                                        (acc, curr) =>
                                                            acc + curr.rolls,
                                                        0
                                                    )}
                                                </Text>
                                            </View>
                                            <View style={styles.weight}>
                                                <Text>
                                                    {item.details
                                                        .reduce(
                                                            (acc, curr) =>
                                                                acc +
                                                                parseFloat(
                                                                    curr.weight
                                                                ),
                                                            0
                                                        )
                                                        .toFixed(2)}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        ))}
                    </View>
                    <View style={styles.summary}>
                        <View style={[styles.sumaryRow]}>
                            <Text style={styles.heading}>Total Rolls</Text>
                            <Text style={styles.colon}>:</Text>
                            <Text style={[styles.master, { width: "50" }]}>
                                {receiptItems
                                    .flatMap((item) => item.details)
                                    .reduce(
                                        (acc, detail) => acc + detail.rolls,
                                        0
                                    )}
                            </Text>
                        </View>
                        <View style={styles.sumaryRow}>
                            <Text style={[styles.heading]}>Total Weight</Text>
                            <Text style={styles.colon}>:</Text>
                            <Text style={[styles.master, { width: "50" }]}>
                                {receiptItems
                                    .flatMap((item) => item.details)
                                    .reduce(
                                        (acc, detail) => acc + +detail.weight,
                                        0
                                    )
                                    .toFixed(2)}
                            </Text>
                        </View>
                    </View>
                    {/* <View style={styles.signature}>
                        <View>
                            <Text>Prepared By</Text>
                        </View>
                        <View>
                            <Text>Authorized By</Text>
                        </View>
                    </View> */}
                </Page>
            </Document>
        </PDFViewer>
    );
};

export default StockDocument;
