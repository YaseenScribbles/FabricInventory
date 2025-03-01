import { Container, OverlayTrigger, Table, Tooltip } from "react-bootstrap";
import Heading from "../../components/Heading";
import { useEffect, useState } from "react";
import "./companies.css";
import axios from "axios";
import { LOCAL_URL } from "../../assets/common";
import { useNotificationContext } from "../../contexts/NotificationsContext";
import AddEditCompany from "./AddEditCompany";
import MyPagination from "../../components/Pagination";
import { useUserContext } from "../../contexts/UserContext";

type CompaniesProps = {};

interface Company {
    id: number;
    name: string;
    address: string;
    active: string;
    user: {
        name: string;
    };
}

interface EditCompany {
    id: number;
    name: string;
    address: string;
    user_id: number;
}

interface Meta {
    lastPage: number;
    currentPage: number;
}

const Companies: React.FC<CompaniesProps> = () => {
    const { user } = useUserContext();
    const [edit, setEdit] = useState(false);
    const [showFormModal, setShowFormModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const { setNotifications } = useNotificationContext();
    const [meta, setMeta] = useState<Meta>({
        currentPage: 0,
        lastPage: 0,
    });
    const [editCompany, setEditCompany] = useState<EditCompany>({
        id: 0,
        name: "",
        address: "",
        user_id: user!.id,
    });

    const suspendCompany = async (id: number) => {
        try {
            setLoading(true);
            const response = await axios.delete(
                `${LOCAL_URL}/companies/${id}`,
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
            getCompanies();
        } catch (error: any) {
            const {
                response: { data },
            } = error;
            setNotifications({
                message: data.message,
                result: "success",
            });
        } finally {
            setLoading(false);
        }
    };

    const getCompanies = async (page: number = 1) => {
        try {
            setLoading(true);
            const response = await axios.get(
                `${LOCAL_URL}/companies?page=${page}`,
                {
                    headers: {
                        Accept: "application/json",
                    },
                }
            );
            const { data } = response;
            setCompanies(data.data);
            setMeta({
                currentPage: data.meta.current_page,
                lastPage: data.meta.last_page,
            });
        } catch (error: any) {
            const {
                response: { data },
            } = error;
            setNotifications({
                message: data.message,
                result: "failure",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getCompanies();
    }, []);

    return (
        <Container id="companies" className="p-2">
            <Heading
                title="Companies"
                buttonText="Add Company"
                onClick={() => setShowFormModal(true)}
            />
            <Table id="company-list" bordered striped hover size="sm">
                <thead>
                    <tr>
                        <th className="text-center">#</th>
                        <th>Name</th>
                        <th className="address">Address</th>
                        <th>Created By</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr>
                            <td colSpan={6} className="text-center">
                                Loading...
                            </td>
                        </tr>
                    ) : (
                        companies.map((company, index) => {
                            let serialNo = (currentPage - 1) * 10 + index + 1;

                            return (
                                <tr
                                    style={{ verticalAlign: "middle" }}
                                    key={index}
                                >
                                    <td className="text-center">{serialNo}</td>
                                    <td>{company.name.toUpperCase()}</td>
                                    <OverlayTrigger
                                        placement="top"
                                        overlay={
                                            <Tooltip>
                                                {company.address.toUpperCase()}
                                            </Tooltip>
                                        }
                                    >
                                        <td className="address">
                                            {company.address.toUpperCase()}
                                        </td>
                                    </OverlayTrigger>
                                    <td>{company.user.name.toUpperCase()}</td>
                                    <td>
                                        {company.active === "1"
                                            ? "ACTIVE"
                                            : "INACTIVE"}
                                    </td>
                                    <td>
                                        <div className="d-flex">
                                            <div
                                                className="d-flex me-1"
                                                onClick={() => {
                                                    setEditCompany({
                                                        id: company.id,
                                                        name: company.name,
                                                        address:
                                                            company.address,
                                                        user_id: user!.id,
                                                    });
                                                    setEdit(true);
                                                    setShowFormModal(true);
                                                }}
                                                style={{ cursor: "pointer" }}
                                            >
                                                <box-icon
                                                    name="edit-alt"
                                                    color="#3e9d8f"
                                                    size="sm"
                                                    animation="tada-hover"
                                                />
                                            </div>
                                            <div
                                                className="d-flex"
                                                onClick={() => {
                                                    suspendCompany(company.id);
                                                }}
                                                style={{ cursor: "pointer" }}
                                            >
                                                {company.active === "1" ? (
                                                    <box-icon
                                                        name="x"
                                                        color="red"
                                                        size="sm"
                                                        animation="tada-hover"
                                                    />
                                                ) : (
                                                    <box-icon
                                                        name="check"
                                                        color="red"
                                                        size="sm"
                                                        animation="tada-hover"
                                                    />
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
            {companies.length > 0 && (
                <MyPagination
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    lastPage={meta.lastPage}
                    paginationURL={`${LOCAL_URL}/companies`}
                    setLoading={setLoading}
                    setState={setCompanies}
                />
            )}
            <AddEditCompany
                show={showFormModal}
                edit={edit}
                editCompany={{
                    id: editCompany.id,
                    name: editCompany.name,
                    address: editCompany.address,
                    user_id: user!.id,
                }}
                onAdd={() => {
                    if (edit) {
                        getCompanies(currentPage);
                    } else {
                        setCurrentPage(meta.lastPage);
                        getCompanies(meta.lastPage);
                    }
                    setEdit(false);
                }}
                onClose={() => {
                    setShowFormModal(false);
                    setEdit(false);
                }}
            />
        </Container>
    );
};

export default Companies;
