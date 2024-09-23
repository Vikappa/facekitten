import { Form } from "react-bootstrap"
import { FaSearch } from "react-icons/fa";

const MarketplaceSideSearchBar = () => {

    return (
        <Form>
            <Form.Group className="mb-3 position-relative">
                <FaSearch className="position-absolute top-50 start-0 translate-middle-y ms-3" />
                <Form.Control className="bg-grayBg rounded-5" type="text" placeholder="      Search Marketplace" />
            </Form.Group>
        </Form>
    )
}

export default MarketplaceSideSearchBar