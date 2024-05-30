import { Spinner } from 'react-bootstrap';

const Loader = () => {
    return (<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Spinner animation="grow" variant="primary" />
        <Spinner animation="grow" variant="success" />
        <Spinner animation="grow" variant="danger" />
        <Spinner animation="grow" variant="warning" />
        <Spinner animation="grow" variant="info" />
    </div>
    );
}

export default Loader