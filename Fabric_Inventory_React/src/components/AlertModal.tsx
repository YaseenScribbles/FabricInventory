import { Button, Modal } from "react-bootstrap";

interface AlertProps {
    show: boolean;
    onProceed: () => void;
    onCancel: () => void;
}

const AlertModal: React.FC<AlertProps> = ({ show, onProceed, onCancel }) => {
    return (
        <Modal
            centered
            backdrop="static"
            keyboard={false}
            show={show}
            aria-labelledby="contained-modal-title-vcenter"
            size="sm"
        >
            <Modal.Header>
                <Modal.Title>⚠️ Confirmation</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>Are you sure ?</p>
            </Modal.Body>
            <Modal.Footer>
                <Button
                    variant="secondary"
                    onClick={onCancel}
                    className="d-flex"
                >
                    <box-icon name="x" color="white" size="md"></box-icon>
                </Button>
                <Button
                    variant="primary"
                    onClick={onProceed}
                    className="d-flex"
                >
                    <box-icon name="check" color="white" size="md"></box-icon>
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default AlertModal;
