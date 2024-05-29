type HeadingProps = {
    title: string;
    buttonText: string;
    onClick: () => void;
};

const Heading: React.FC<HeadingProps> = ({ title, buttonText, onClick }) => {
    return (
        <>
            <div className="d-flex justify-content-between align-items-center mt-2">
                <h4 className="me-auto">{title}</h4>
                <div
                    className="border border-1 p-2 d-flex justify-content-around text-bg-success"
                    style={{ cursor: "pointer" }}
                    onClick={onClick}
                >
                    <box-icon name="plus" color="white"></box-icon>
                    &nbsp; {buttonText}
                </div>
            </div>
            <hr />
        </>
    );
};

export default Heading;
