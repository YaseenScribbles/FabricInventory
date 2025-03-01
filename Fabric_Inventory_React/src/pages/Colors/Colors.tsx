import { Container, Table } from "react-bootstrap";
import Heading from "../../components/Heading";
import { useEffect, useState } from "react";
import AddColor from "./AddColor";
import axios from "axios";
import { LOCAL_URL } from "../../assets/common";
import { useNotificationContext } from "../../contexts/NotificationsContext";
import EditColor from "./EditColor";
import { useUserContext } from "../../contexts/UserContext";
import MyPagination from "../../components/Pagination";
import "./colors.css";

interface Color {
    id: number;
    name: string;
    active: string;
    user: {
        name: string;
    };
}

interface Meta {
    currentPage: number;
    lastPage: number;
}

const Colors: React.FC = () => {
    const [colors, setColors] = useState<Color[]>([]);
    const [loading, setLoading] = useState(false);
    const [showAddColorModal, setShowAddColorModal] = useState(false);
    const [showEditColorModal, setShowEditColorModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [editColor, setEditColor] = useState<Color>({
        name: "",
        active: "",
        id: 0,
        user: {
            name: "",
        },
    });
    const [meta, setMeta] = useState<Meta>({
        currentPage: 1,
        lastPage: 1,
    });
    const { setNotifications } = useNotificationContext();
    const { user } = useUserContext();

    useEffect(() => {
        getColors();
    }, []);

    const getColors = async (page: number = 1) => {
        setLoading(true);

        try {
            const response = await axios.get(
                `${LOCAL_URL}/colors?page=${page}`,
                {
                    headers: {
                        Accept: "application/json",
                    },
                }
            );

            const { data } = response;
            setColors(data.data);
            setMeta({
                lastPage: data.meta.last_page,
                currentPage: data.meta.current_page,
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

    const suspendColor = async (id: number) => {
        setLoading(true);
        try {
            const response = await axios.delete(`${LOCAL_URL}/colors/${id}`);
            const { data } = response;
            setNotifications({
                message: data.message,
                result: "success",
            });
            getColors(currentPage);
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
        <Container id="colors" className="p-2">
            <Heading
                title="Colors"
                buttonText="Add Color"
                onClick={() => setShowAddColorModal(true)}
            />
            <Table id="colors-list" bordered striped hover size="sm">
                <thead>
                    <tr>
                        <th className="text-center">#</th>
                        <th>Name</th>
                        <th>Created By</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr>
                            <td colSpan={5} className="text-center">
                                Loading...
                            </td>
                        </tr>
                    ) : (
                        colors.map((color, index) => {
                            let serialNo = (currentPage - 1) * 10 + index + 1;

                            return (
                                <tr
                                    style={{ verticalAlign: "middle" }}
                                    key={index}
                                >
                                    <td className="text-center">{serialNo}</td>
                                    <td>{color.name.toUpperCase()}</td>
                                    <td>{color.user.name.toUpperCase()}</td>
                                    <td>
                                        {color.active === "1"
                                            ? "ACTIVE"
                                            : "INACTIVE"}
                                    </td>
                                    <td>
                                        <div className="d-flex">
                                            {user?.role === "admin" && (
                                                <div
                                                    onClick={() => {
                                                        setEditColor(color);
                                                        setShowEditColorModal(
                                                            true
                                                        );
                                                    }}
                                                    className="d-flex me-1"
                                                    style={{
                                                        cursor: "pointer",
                                                    }}
                                                >
                                                    <box-icon
                                                        name="edit-alt"
                                                        color="#3e9d8f"
                                                        size="sm"
                                                        animation="tada-hover"
                                                    ></box-icon>
                                                </div>
                                            )}
                                            {user?.role === "admin" && (
                                                <div
                                                    onClick={() =>
                                                        suspendColor(color.id)
                                                    }
                                                    className="d-flex"
                                                    style={{
                                                        cursor: "pointer",
                                                    }}
                                                >
                                                    {color.active === "1" ? (
                                                        <box-icon
                                                            name="x"
                                                            color="red"
                                                            size="sm"
                                                            animation="tada-hover"
                                                        ></box-icon>
                                                    ) : (
                                                        <box-icon
                                                            name="check"
                                                            color="red"
                                                            size="sm"
                                                            animation="tada-hover"
                                                        ></box-icon>
                                                    )}
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
            <AddColor
                show={showAddColorModal}
                onClose={() => setShowAddColorModal(false)}
                onAdded={() => {
                    setCurrentPage(meta.lastPage);
                    getColors(meta.lastPage);
                }}
            />
            <EditColor
                show={showEditColorModal}
                onClose={() => setShowEditColorModal(false)}
                onUpdated={() => getColors(currentPage)}
                oldColor={{
                    id: editColor.id,
                    name: editColor.name,
                    user_id: user!.id,
                }}
            />
            {colors.length > 0 && (
                <MyPagination
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    lastPage={meta.lastPage}
                    paginationURL={`${LOCAL_URL}/colors`}
                    setLoading={setLoading}
                    setState={setColors}
                />
            )}
        </Container>
    );
};

export default Colors;
