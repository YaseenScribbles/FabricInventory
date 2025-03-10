import { Container, OverlayTrigger, Table, Tooltip } from "react-bootstrap";
import "./Users.css";
import { useEffect, useState } from "react";
import axios from "axios";
import { LOCAL_URL } from "../../assets/common";
import { useNotificationContext } from "../../contexts/NotificationsContext";
import "boxicons";
import AddUser from "./AddUserModal";
import EditUser from "./EditUserModal";
import MyPagination from "../../components/Pagination";
import StoreAssign from "./StoreAssignModal";
import Heading from "../../components/Heading";
declare global {
    namespace JSX {
        interface IntrinsicElements {
            // Define box-icon as a custom element
            "box-icon": any; // You can refine this type if you have more information about it
        }
    }
}

export const Users: React.FC = () => {
    interface User {
        id: number;
        name: string;
        email: string;
        role: string;
        count?: string;
        stores?: string;
        active?: string;
        storeIds?: string;
    }

    interface Meta {
        currentPage: number;
        lastPage: number;
    }

    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const { setNotifications } = useNotificationContext();
    const [showAddUser, setShowAddUser] = useState(false);
    const [showEditUser, setShowEditUser] = useState(false);
    const [editUser, setEditUser] = useState<User>({
        id: 0,
        name: "",
        email: "",
        role: "",
    });
    const [meta, setMeta] = useState<Meta>({
        currentPage: 1,
        lastPage: 1,
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [userInfo, setUserInfo] = useState<User>({
        id: 0,
        name: "",
        email: "",
        role: "",
    });

    const getUsers = async (page: number = 1) => {
        setLoading(true);

        try {
            const response = await axios.get(
                `${LOCAL_URL}/users?page=${page}`,
                {
                    headers: {
                        Accept: "application/json",
                    },
                }
            );

            const { data } = response;
            setUsers(data.data);
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

    const suspendUser = async (id: number) => {
        setLoading(true);
        try {
            const response = await axios.delete(`${LOCAL_URL}/users/${id}`);
            const { data } = response;
            setNotifications({
                message: data.message,
                result: "success",
            });
            getUsers(currentPage);
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

    useEffect(() => {
        getUsers(1);
    }, []);

    return (
        <Container id="users" className="p-2">
            <Heading
                title="Users"
                onClick={() => setShowAddUser(true)}
                buttonText="Add User"
            />
            <Table id="user-list" bordered striped hover size="sm">
                <thead>
                    <tr>
                        <th className="text-center">#</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th className="text-center count">Store Count</th>
                        <th>Stores</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr>
                            <td colSpan={8} className="text-center">
                                Loading...
                            </td>
                        </tr>
                    ) : (
                        users.map((user, i) => {
                            let serialNumber: number =
                                (currentPage - 1) * 10 + i + 1;
                            return (
                                <tr style={{ verticalAlign: "middle" }} key={i}>
                                    <td className="col-1 text-center">
                                        {serialNumber}
                                    </td>
                                    <td className="col-2 username">
                                        {user.name.toUpperCase()}
                                    </td>
                                    <td className="col-2">
                                        {user.email.toLowerCase()}
                                    </td>
                                    <td className="col-1">
                                        {user.role.toUpperCase()}
                                    </td>
                                    <td className="col-1 text-center">
                                        {user.count}
                                    </td>
                                    <OverlayTrigger
                                        placement="top"
                                        overlay={
                                            <Tooltip>
                                                {user.stores
                                                    ? user.stores?.toUpperCase()
                                                    : "NOT ASSIGNED"}
                                            </Tooltip>
                                        }
                                    >
                                        <td className="col-2 stores">
                                            {user.stores
                                                ? user.stores?.toUpperCase()
                                                : "NOT ASSIGNED"}
                                        </td>
                                    </OverlayTrigger>
                                    <td className="col-1">
                                        {user.active === "1"
                                            ? "ACTIVE"
                                            : "INACTIVE"}
                                    </td>
                                    <td className="col-2">
                                        <div className="d-flex">
                                            <div
                                                className="d-flex me-1"
                                                onClick={() => {
                                                    setEditUser(user);
                                                    setShowEditUser(true);
                                                }}
                                                style={{ cursor: "pointer" }}
                                            >
                                                <box-icon
                                                    name="edit-alt"
                                                    color="#3e9d8f"
                                                    size="sm"
                                                    animation="tada-hover"
                                                ></box-icon>
                                            </div>
                                            <div
                                                onClick={() => {
                                                    setUserInfo(user);
                                                    setShowAssignModal(true);
                                                }}
                                                className="d-flex me-1"
                                                style={{ cursor: "pointer" }}
                                            >
                                                <box-icon
                                                    name="store-alt"
                                                    color="#3e9d8f"
                                                    size="sm"
                                                    animation="tada-hover"
                                                ></box-icon>
                                            </div>
                                            <div
                                                className="d-flex"
                                                onClick={() =>
                                                    suspendUser(user.id)
                                                }
                                                style={{ cursor: "pointer" }}
                                            >
                                                {user.active === "1" ? (
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
                                        </div>
                                    </td>
                                </tr>
                            );
                        })
                    )}
                </tbody>
            </Table>
            <AddUser
                show={showAddUser}
                onClose={() => setShowAddUser(false)}
                onAdded={() => {
                    setCurrentPage(meta.lastPage);
                    getUsers(meta.lastPage);
                }}
            />
            <EditUser
                show={showEditUser}
                onClose={() => setShowEditUser(false)}
                onUpdated={() => getUsers(currentPage)}
                oldUser={editUser}
            />
            <StoreAssign
                show={showAssignModal}
                onClose={() => setShowAssignModal(false)}
                onUpdated={() => getUsers(currentPage)}
                user={userInfo}
            />
            {users.length > 0 && (
                <MyPagination
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    lastPage={meta.lastPage}
                    setState={setUsers}
                    paginationURL={`${LOCAL_URL}/users`}
                    setLoading={setLoading}
                />
            )}
        </Container>
    );
};
