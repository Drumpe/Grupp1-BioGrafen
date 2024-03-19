import React from "react";
import { Button, Modal } from 'react-bootstrap';

export default function ModalOkCancel({ show, onClickOk, onClickCancel, body, title, okButtonText = "Ok", cancelButtonText = "Cancel" }) {
  return <>
  <Modal show={show} onHide={onClickCancel} animation={false}>
    <Modal.Header closeButton>
      <Modal.Title>{title}</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      {body}
    </Modal.Body>
    <Modal.Footer>
    <Button variant="primary" onClick={onClickOk}>
      {okButtonText}
      </Button>
      <Button variant="secondary" onClick={onClickCancel}>
        {cancelButtonText}
      </Button>
    </Modal.Footer>
  </Modal>
  </>
}