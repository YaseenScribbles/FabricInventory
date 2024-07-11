import axios, { AxiosResponse } from "axios";
import { Pagination } from "react-bootstrap";

type PaginationProps = {
    currentPage: number;
    paginationURL: string;
    lastPage: number;
    setState: (type: any) => void;
    setCurrentPage: (page: number) => void;
    setLoading: (loading: boolean) => void;
    hasOtherParams?: boolean;
};

const MyPagination: React.FC<PaginationProps> = ({
    currentPage,
    paginationURL,
    lastPage,
    setState,
    setCurrentPage,
    setLoading,
    hasOtherParams
}) => {
    const getData = async (page: number) => {
        if (currentPage !== page && page > 0 && page <= lastPage) {
            setLoading(true);
            let response : AxiosResponse<any,any>;
            if (hasOtherParams){
                 response = await axios.get(`${paginationURL}&page=${page}`, {
                    headers: {
                        Accept: "application/json",
                    },
                });
            } else {
                response = await axios.get(`${paginationURL}?page=${page}`, {
                    headers: {
                        Accept: "application/json",
                    },
                });
            }
            const {
                data: { data },
            } = response;
            setState(data);
            setCurrentPage(page);
            setLoading(false);
        }
    };

    return (
        <Pagination className="d-flex justify-content-end">
            <Pagination.First onClick={() => getData(1)} />
            <Pagination.Prev onClick={() => getData(currentPage - 1)} />
            {currentPage - 2 > 0 && (
                <Pagination.Item onClick={() => getData(currentPage - 2)}>
                    {currentPage - 2}
                </Pagination.Item>
            )}
            {currentPage - 1 > 0 && (
                <Pagination.Item onClick={() => getData(currentPage - 1)}>
                    {currentPage - 1}
                </Pagination.Item>
            )}
            <Pagination.Item active>{currentPage}</Pagination.Item>
            {currentPage + 1 <= lastPage && (
                <Pagination.Item onClick={() => getData(currentPage + 1)}>
                    {currentPage + 1}
                </Pagination.Item>
            )}
            {currentPage + 2 <= lastPage && (
                <Pagination.Item onClick={() => getData(currentPage + 2)}>
                    {currentPage + 2}
                </Pagination.Item>
            )}
            <Pagination.Next onClick={() => getData(currentPage + 1)} />
            <Pagination.Last onClick={() => getData(lastPage)} />
        </Pagination>
    );
};

export default MyPagination;
