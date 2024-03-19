import { useState, useEffect } from "react";
import { Col, Container, Row } from 'react-bootstrap';
import { useOutletContext, useNavigate } from "react-router-dom";
import { get, del } from '../utilsAndHooks/rest';
import { Table, Button, Modal } from 'react-bootstrap';
import ModalInfo from "../components/ModalInfo";

export default function AccountView() {
    const [{ user }] = useOutletContext();
    const [bookings, setBookings] = useState({ upcoming: [], past: [] });
    let navigate = useNavigate();
    const [isBookingCanceled, setIsBookingCanceled] = useState(false);

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
        if (user && user.email) {
            (async () => {
                const userBookings = await get(`bookings/getbyemail/${user.email}`);
                const currentTime = new Date();
                if (userBookings.error) {
                    return;
                }
                const upcomingBookings = userBookings.filter((booking) => {
                    const screeningTime = new Date(booking.screeningTime);
                    return screeningTime > currentTime;
                });
                const pastBookings = userBookings.filter((booking) => {
                    const screeningTime = new Date(booking.screeningTime);
                    return screeningTime <= currentTime;
                });

                setBookings({ upcoming: upcomingBookings, past: pastBookings });
            })();
        }
    }, [user, isBookingCanceled]);

    function BookingItem({ booking, index, deleteBooking }) {
        const screeningTime = booking.screeningTime.replace('T', ' ').slice(0, -3);
        return (
            <tr key={index}>
                <td><em>{booking.movie}</em></td>
                <td>{booking.theater}</td>
                <td>{screeningTime}</td>
                <td>{booking.bookingNumber}</td>
                <td>
                    {deleteBooking && (
                        <Button variant="dark" 
                        className="text-light border-1 border-warning" 
                        size="md" 
                        onClick={() => deleteBooking(booking.bookingNumber, user.email)}
                        disabled = {isBookingCanceled}
                        >
                            Avboka
                        </Button>
                    )}
                </td>
            </tr>
        );
    }

    async function deleteBooking(bookingNumber, userEmail) {
        try {
            var result = await del(`Bookings/RemoveBooking/${bookingNumber}/${userEmail}`);
            //if (result.error) return;
        } catch (error) {
            console.log("Error i borttag av bokning: ", error);
            return;
        }
        //Vill ha en rerender istället för navigate...
        setIsBookingCanceled(true);
        alertInfo("Din bokning är avbokad.");
        setTimeout(() => {
            setIsBookingCanceled(false);
        }, 5000);
        //navigate("/"); 
    }

    return (
        <Container className="my-4">
            <h1>Mitt konto</h1>
            <Row className="mt-4">
                <Col>
                    <h5 className="fw-bold mb-2 fst-italic ms-3">{user.name}</h5>
                </Col>
            </Row>
            <Row className="mt-4">
                <Col className="mx-auto text-center">
                    <h5 className="fw-bold mb-4 text-primary d-inline-block">Kommande bokningar</h5>

                    {bookings.upcoming.length === 0 ? <p>Du har inga kommande bokningar.</p> :
                        <Table striped borderless hover variant="dark">
                            <thead>
                                <tr>
                                    <th>Film</th>
                                    <th>Salong</th>
                                    <th>Tid för visning</th>
                                    <th>Bokningsnummer</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bookings.upcoming.map((booking, index) => (
                                    <BookingItem key={index} booking={booking} deleteBooking={deleteBooking} />
                                ))}
                            </tbody>
                        </Table>
                    }

                </Col>
            </Row>
            {bookings.past.length > 0 && (
                <Row className="mt-5">
                    <Col className="mx-auto text-center">
                        <h5 className="fw-bold mb-4 text-primary d-inline-block">Tidigare bokningar</h5>
                        <Table striped borderless hover variant="dark">
                            <thead>
                                <tr>
                                    <th>Film</th>
                                    <th>Salong</th>
                                    <th>Tid för visning</th>
                                    <th>Bokningsnummer</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bookings.past.map((booking, index) => (
                                    <BookingItem key={index} booking={booking} />
                                ))}
                            </tbody>
                        </Table>
                    </Col>
                </Row>
            )}
            <ModalInfo
                infoText={infoMessage}
                show={showModalInfo}
                onClose={closeInfoMessage}
            />
        </Container>
    );
}