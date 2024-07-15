import { Button } from "react-bootstrap";

type HeadingProps = {
    title: string;
    buttonText?: string;
    onClick?: () => void;
};

const Heading: React.FC<HeadingProps> = ({ title, buttonText, onClick }) => {
    return (
        <>
            <div className="d-flex justify-content-between align-items-center">
                <strong className="me-auto my-auto fs-5">{title}</strong>
                {buttonText && <Button
                    variant="success"
                    onClick={onClick}
                    className="d-flex"
                >
                    <box-icon name="plus" color="white"></box-icon>
                    &nbsp; {buttonText}
                </Button>}
            </div>
            <hr />
        </>
    );
};

export default Heading;
