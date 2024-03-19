import React from "react";
import { Button, Modal } from 'react-bootstrap';

export default function ModalInfo({ infoText = "Standard info text.", show, onClose }) {
  return <>
    <Modal show={show} onHide={onClose} animation={false}>
      <Modal.Header closeButton>
        <Modal.Title>Information</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {infoText}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={onClose}>
          Ok
        </Button>
      </Modal.Footer>
    </Modal>
  </>
}