import { useEffect, useState } from 'react'
import { Container, Button, Col, Form, Image } from 'react-bootstrap';
import { get } from '../utilsAndHooks/rest';
import { getLocaleDateString } from '../utilsAndHooks/formatter';
import { useOutletContext } from 'react-router-dom';
import ModalOkCancel from '../components/ModalOkCancel';
import ModalInfo from '../components/ModalInfo';

export default function CancelView() {
  const [globals, { }] = useOutletContext();
  const [show, setShow] = useState(false);
  const [data, setData] = useState({});
  const [formatedDate, setFormatedDate] = useState('');
  const [send, setSend] = useState({
    bookingNumber: "",
    emailAdress: ""
  });
  const [buttonDisabled, setButtonDisabled] = useState(false);

  // ModalInfo
  const [infoMessage, setInfoMessage] = useState("");
  const [showModalInfo, setShowModalInfo] = useState(false);
  const closeInfoMessage = () => {
    setShowModalInfo(false);
  };
  const alertInfo = (infoText) => {
    setInfoMessage(infoText);
    setShowModalInfo(true);
  }

  useEffect(() => {
    setSend({ ...send, emailAdress: globals.user?.email || "" });
  }, [globals]);

  //DeleteFetch
  async function SendDelete() {
    try {
      const response = await fetch(`http://localhost:5052/api/Bookings/RemoveBooking/${send.bookingNumber}/${send.emailAdress}`, {
        method: 'DELETE',
      });
      if (response.status !== 200) {
        alertInfo("Ops! Ett fel har uppstått. Försök senare eller kontakta oss via kundtjänst");
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }

  //FindData 
  async function fetchData() {
    var result = await get(`/Bookings/confirm/${send.bookingNumber}/${send.emailAdress}`)
    setData(result)
    return result;
  }

  useEffect(() => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' };
    setFormatedDate(getLocaleDateString(data.screeningTime, options));
  }, [data.screeningTime])

  //Show and hide pop up handler
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const verifyData = async () => {
    setButtonDisabled(true);
    let data = await fetchData();
    if (data.bookingId == null) {
      alertInfo("Det angivna bokningsnumret eller e-postadressen är felaktig");
    } else {
      handleShow();
    }
    setButtonDisabled(false);
  };


  const confirmDelete = async () => {
    await SendDelete();
    handleClose();
    setSend({
      bookingNumber: "",
      emailAdress: ""
    })
    alertInfo("Avbokning har genomförts.");
  }

  function modalBookingBody(data, formatedDate) {
    return <>
      <p>Är du säker på att du vill avboka?</p>
      <p>{data.theater}, {formatedDate}</p>
    </>
  }

  return (
    <Container className='py-3 rounded-3 bg-info col-lg-8 bg-opacity-75 mt-5'>
      <form className='row g-3 my-3 mx-3 '>
        <Container>
          <Col className="mx-auto text-center d-none d-lg-block">
            <Image
              src="/img/logo/filmvisarna-logo-icon.png"
              roundedCircle
              style={{ width: '100px', height: '100px' }}
            />
          </Col>

          <h1 className="text-center mb-2 mt-1">Avboka</h1>
          <p className="text-center mb-4">Ange samma e-postadress som du uppgav vid bokningen.</p>
          <div className="my-3 mx-3">
            <Form.Group className="form-floating">
              <Form.Control
                type="text"
                name="bookingNumber"
                value={send.bookingNumber}
                className="rounded-3"
                placeholder="Bokningsnummer"
                onChange={(x) =>
                  setSend({
                    ...send,
                    bookingNumber: x.target.value
                  })}
              />
              <Form.Label>Bokningsnummer</Form.Label>
            </Form.Group>
            <Form.Group className="form-floating my-4 ">
              <Form.Control
                type="email"
                name="emailAdress"
                value={send.emailAdress}
                className="rounded-3"
                placeholder="E-postadress"
                onChange={(x) => setSend({
                  ...send,
                  emailAdress: x.target.value
                })}
              />
              <Form.Label>E-postadress</Form.Label>
            </Form.Group>
          </div>
          <div className="d-flex justify-content-center my-3 mb-2">
            <Button
              variant="primary"
              size="lg"
              onClick={verifyData}
              disabled={buttonDisabled || !(send.bookingNumber && (send.emailAdress || globals.user.userRole === "member"))}
            >
              Avboka
            </Button>
          </div>
        </Container>
      </form>

      <ModalOkCancel
        show={show}
        onClickOk={confirmDelete}
        onClickCancel={handleClose}
        body={modalBookingBody(data, formatedDate)}
        title="Avbokning"
        okButtonText="Avboka"
        cancelButtonText="Behåll bokning"
      />
      <ModalInfo
        infoText={infoMessage}
        show={showModalInfo}
        onClose={closeInfoMessage}
      />
    </Container>
  );
}