import { Button, Container, Spinner, Table } from "react-bootstrap";
import "./Users.css";
import { useEffect, useState } from "react";
import axios from "axios";
import { LOCAL_URL } from "../../assets/common";
import { useNotificationContext } from "../../contexts/NotificationsContext";
import "boxicons";
import AddUser from "./AddUserModal";
import EditUser from "./EditUserModal";
import MyPagination from "../../components/Pagination";
declare global {
    namespace JSX {
        interface IntrinsicElements {
            // Define box-icon as a custom element
            'box-icon': any; // You can refine this type if you have more information about it
        }
    }
}

export const Users: React.FC = () => {
    interface User {
        id: number;
        name: string;
        email: string;
        role: string;
        active?: string;
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
        role: ""
    });
    const [meta, setMeta] = useState<Meta>({
        currentPage: 1,
        lastPage: 1,
    });
    const [currentPage, setCurrentPage] = useState(1);

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
            {loading && (
                <div className="text-center">
                    <Spinner animation="grow" variant="secondary" />
                </div>
            )}
            <div
                className="d-flex justify-content-between align-items-center mt-2"
                style={{ cursor: "pointer" }}
            >
                <h4 className="me-auto">Users</h4>
                <div
                    className="border border-1 p-2 d-flex justify-content-around text-bg-success"
                    onClick={() => setShowAddUser(true)}
                >
                    <box-icon name="plus" color="white"></box-icon>
                    &nbsp; Add User
                </div>
            </div>
            <hr />
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user, i) => {
                        let serialNumber: number =
                            (currentPage - 1) * 10 + i + 1;
                        return (
                            <tr key={i}>
                                <td>{serialNumber}</td>
                                <td>{user.name.toUpperCase()}</td>
                                <td>{user.email.toLowerCase()}</td>
                                <td>{user.role.toUpperCase()}</td>
                                <td>{user.active === "1" ? 'ACTIVE' : 'INACTIVE'}</td>
                                <td>
                                    <Button
                                        variant="primary"
                                        onClick={() => {
                                            setEditUser(user);
                                            setShowEditUser(true);
                                        }}
                                    >
                                        <box-icon name="edit-alt" color="white" size="xs"></box-icon>
                                    </Button>
                                    &nbsp;
                                    <Button
                                        variant="danger"
                                        onClick={() => suspendUser(user.id)}
                                    >
                                        {
                                            user.active === "1" ?
                                            <box-icon name="minus" color="white" size="xs"></box-icon> :
                                            <box-icon name="plus" color="white" size="xs"></box-icon>
                                        }
                                    </Button>
                                </td>
                            </tr>
                        );
                    })}
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
            <MyPagination
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                lastPage={meta.lastPage}
                setState={setUsers}
                paginationURL={`${LOCAL_URL}/users`}
                setLoading={setLoading}
            />
        </Container>
    );
};
