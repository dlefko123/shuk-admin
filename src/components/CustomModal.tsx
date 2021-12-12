import { Modal } from 'react-bootstrap';

type CustomModalProps = {
  show: boolean,
  close: () => void,
  title: string,
  children: React.ReactNode
};

const CustomModal = ({
  show, close, title, children,
}: CustomModalProps) => (
  <Modal
    show={show}
    onHide={close}
    dialogClassName="modal-dialog"
    centered
  >
    <Modal.Header closeButton>
      <Modal.Title>{title}</Modal.Title>
    </Modal.Header>

    <Modal.Body>
      {children}
    </Modal.Body>
  </Modal>
);

export default CustomModal;
