import axios from "axios";
import { Button, Col, Modal, Row, Spinner } from "react-bootstrap";
import { GroupBase, OptionsOrGroups } from "react-select";
import SelectAsync from "react-select/async-creatable";
import { LOCAL_URL } from "../../assets/common";
import { useEffect, useState } from "react";
import { useNotificationContext } from "../../contexts/NotificationsContext";

type BrandProps = {
    show: boolean;
    onClose: () => void;
    receiptId: number;
    editBrand: string;
    onUpdate:() => void;
};

interface Options {
    label: string;
    value: string;
}

interface Brand {
    brand: string;
}

const Brand: React.FC<BrandProps> = ({
    show,
    onClose,
    receiptId,
    editBrand,
    onUpdate
}) => {
    const [brand, setBrand] = useState("");
    const [loading, setLoading] = useState(false);
    const { setNotifications } = useNotificationContext();
    const [defaultOptions, setDefaultOptions] = useState<Options[]>([]);
    const [defaultValue, setDefaultValue] = useState<Options | null>(null);

    useEffect(() => {
        if (editBrand) {
            const defOpts: Options[] = [];
            defOpts.push({
                label: editBrand.toUpperCase(),
                value: editBrand,
            });
            setDefaultOptions(defOpts);
            setDefaultValue(defOpts[0]);
        }
    }, [editBrand]);

    const loadBrands = async (
        inputValue: string,
        callback: (
            options: OptionsOrGroups<Options, GroupBase<Options>>
        ) => void
    ): Promise<OptionsOrGroups<Options, GroupBase<Options>>> => {
        try {
            const response = await axios.get(`${LOCAL_URL}/brands`, {
                params: { query: inputValue },
            });
            const options = response.data.brands.map((item: Brand) => ({
                label: item.brand,
                value: item.brand,
            }));
            callback(options);
            return options;
        } catch (error) {
            console.error("Error fetching data:", error);
            callback([]);
            return [];
        }
    };

    const updateBrand = async () => {
        try {
            setLoading(true);
            const response = await axios.post(
                `${LOCAL_URL}/brand-update/${receiptId}?_method=PUT`,
                { brand: brand },
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
            onClose();
            onUpdate();
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
        <Modal
            centered
            backdrop="static"
            keyboard={false}
            show={show}
            size="sm"
            aria-labelledby="contained-modal-title-vcenter"
            onHide={() => {
                onClose();
                setBrand("");
            }}
        >
            <Modal.Header closeButton>
                <Modal.Title>Update Brand</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Row>
                    <Col>
                        <SelectAsync
                            placeholder="Select Brand"
                            defaultOptions={defaultOptions}
                            value={defaultValue}
                            cacheOptions
                            loadOptions={loadBrands}
                            styles={{
                                control: (baseStyles, _) => ({
                                    ...baseStyles,
                                    minHeight: "58px",
                                }),
                            }}
                            onChange={(e) => {
                                const brand = e ? e.value : "";
                                setBrand(brand);
                                setDefaultValue(e)
                            }}
                            isClearable
                        />
                    </Col>
                </Row>
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={updateBrand}>
                    {loading ? <Spinner animation="border" /> : "Update"}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default Brand;
