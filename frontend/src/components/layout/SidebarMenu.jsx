import goepikLogo from '../../images/goepik-logo-big.png'
import { Col, Image, Row } from "antd"


const SidebarMenu = () => {
  const logo = goepikLogo;

  return (
    <div id="sidebar-menu" className="open">
      <Row className="logo-container">
        <Col>
          <Image src={logo} className="logo-menu" />
        </Col>
      </Row>
    </div>
  );
};

export default SidebarMenu
