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

interface Delivery {
    id: number;
    date: string;
    companyName: string;
    companyAddress: string;
    lot_no: string;
    brand: string;
    store: string;
    contact: string;
    fabric: string;
    remarks: string;
    user: string;
}

interface DeliveryItem {
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

interface DeliveryItem2 {
    color: string;
    details: Detail[];
}

Font.register({
    family: "Oswald",
    src: "https://fonts.gstatic.com/s/oswald/v13/Y_TKV6o8WovbUd3m_X9aAA.ttf",
});

const styles = StyleSheet.create({
    page: {
        padding: "20",
        fontFamily: "Oswald",
    },
    companyName :{
        fontSize: "30px",
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: "10",
    },
    companyAddress : {
        fontSize:"15",
        textAlign:"center",
        marginBottom:"10"
    },
    title: {
        fontSize: "20px",
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: "10",
    },
    heading: {
        fontSize: "15px",
        fontWeight: "bold",
        width: "75",
    },
    colon: {
        fontSize: "15",
        width: "20",
    },
    master: {
        fontSize: "15px",
        fontWeight: "bold",
    },
    columns: {
        display: "flex",
        flexDirection: "row",
        marginBottom: "10",
    },
    table: {
        marginTop: "20",
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
        marginTop: "30",
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
        marginTop:"30",
        display: "flex",
        flexDirection:"row",
        justifyContent: "space-between",
    },
});

const DeliveryDocument: React.FC = () => {
    const [delivery, setDelivery] = useState<Delivery>({
        id: 0,
        date: "",
        companyName:"",
        companyAddress:"",
        lot_no: "",
        brand: "",
        store: "",
        contact: "",
        fabric: "",
        remarks: "",
        user: "",
    });

    const [deliveryItems, setDeliveryItems] = useState<DeliveryItem2[]>([]);
    const { id } = useParams();
    const [dias, setDias] = useState<number[]>([]);

    useEffect(() => {
        const getDelivery = async () => {
            try {
                const response = await axios.get(
                    `${LOCAL_URL}/delivery-report/${id}`,
                    {
                        headers: {
                            Accept: "application/json",
                        },
                    }
                );

                const {
                    data: { master, details },
                } = response;

                setDelivery({
                    id: master.id,
                    date: master.date,
                    companyName: master.company_name,
                    companyAddress: master.company_address,
                    lot_no: master.lot_no,
                    brand: master.brand,
                    store: master.store,
                    contact: master.contact,
                    fabric: master.fabric,
                    remarks: master.remarks,
                    user: master.user,
                });

                let delivery_items: DeliveryItem2[] = [];

                const allColors = details.map(
                    (detail: DeliveryItem) => detail.color
                );
                const uniqueColors: string[] = Array.from(new Set(allColors));

                const allDias = details.map(
                    (detail: DeliveryItem) => detail.dia
                );
                const uniqueDias: number[] = Array.from(new Set(allDias));

                setDias(uniqueDias);

                uniqueColors.forEach((color) => {
                    let delivery_details: Detail[] = [];
                    details.forEach((detail: DeliveryItem) => {
                        if (detail.color === color) {
                            delivery_details.push({
                                dia: +detail.dia,
                                rolls: +detail.rolls,
                                weight: (+detail.weight).toFixed(2),
                            });
                        }
                    });
                    delivery_items.push({
                        color: color,
                        details: delivery_details,
                    });
                });

                setDeliveryItems(delivery_items);
            } catch (error: any) {
                console.log(error);
            }
        };

        getDelivery();
    }, []);

    return (
        <PDFViewer style={{ height: "99vh", width: "99vw" }}>
            <Document>
                <Page size={"A4"} style={styles.page}>
                    <View style={styles.companyName}>
                        <Text>{delivery.companyName.toUpperCase()}</Text>
                    </View>
                    <View style={styles.companyAddress}>
                        <Text>{delivery.companyAddress.toUpperCase()}</Text>
                    </View>
                    <Text style={styles.title}>DELIVERY REPORT</Text>
                    <View style={styles.columns}>
                        <Text style={styles.heading}>Lot No</Text>
                        <Text style={styles.colon}>:</Text>
                        <Text style={styles.master}>{delivery.lot_no}</Text>
                        <Text style={[styles.heading, { marginLeft: "auto" }]}>
                            Delivery No
                        </Text>
                        <Text style={styles.colon}>:</Text>
                        <Text style={[styles.master, { width: "65" }]}>
                            {delivery.id}
                        </Text>
                    </View>
                    <View style={styles.columns}>
                        <Text style={styles.heading}>Brand</Text>
                        <Text style={styles.colon}>:</Text>
                        <Text style={styles.master}>
                            {delivery.brand.toUpperCase()}
                        </Text>
                        <Text style={[styles.heading, { marginLeft: "auto" }]}>
                            Date
                        </Text>
                        <Text style={styles.colon}>:</Text>
                        <Text style={[styles.master, { width: "65" }]}>
                            {new Date(delivery.date).toLocaleDateString()}
                        </Text>
                    </View>
                    <View style={styles.columns}>
                        <Text style={styles.heading}>Store</Text>
                        <Text style={styles.colon}>:</Text>
                        <Text style={styles.master}>
                            {delivery.store.toUpperCase()}
                        </Text>
                        <Text style={[styles.heading, { marginLeft: "auto" }]}>
                            User
                        </Text>
                        <Text style={styles.colon}>:</Text>
                        <Text style={[styles.master, { width: "65" }]}>
                            {delivery.user.toUpperCase()}
                        </Text>
                    </View>
                    <View style={styles.columns}>
                        <Text style={styles.heading}>Contact</Text>
                        <Text style={styles.colon}>:</Text>
                        <Text style={styles.master}>
                            {delivery.contact.toUpperCase()}
                        </Text>
                    </View>
                    <View style={styles.columns}>
                        <Text style={styles.heading}>Fabric</Text>
                        <Text style={styles.colon}>:</Text>
                        <Text style={styles.master}>
                            {delivery.fabric.toUpperCase()}
                        </Text>
                    </View>
                    <View style={styles.columns}>
                        <Text style={styles.heading}>Remarks</Text>
                        <Text style={styles.colon}>:</Text>
                        <Text style={styles.master}>
                            {delivery.remarks
                                ? delivery.remarks.toUpperCase()
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
                                        <Text>{dia}</Text>
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
                        {deliveryItems.map((item, index) => (
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
                                {deliveryItems
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
                                {deliveryItems
                                    .flatMap((item) => item.details)
                                    .reduce(
                                        (acc, detail) => acc + +detail.weight,
                                        0
                                    )
                                    .toFixed(2)}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.signature}>
                        <View>
                            <Text>Prepared By</Text>
                        </View>
                        <View>
                            <Text>Authorized By</Text>
                        </View>
                    </View>
                </Page>
            </Document>
        </PDFViewer>
    );
};

export default DeliveryDocument;
