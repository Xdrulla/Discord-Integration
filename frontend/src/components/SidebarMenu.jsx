import goepikLogo from '../images/goepik-logo-big.png'
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
      <Row className="powered">
        <Col span={24} className="powered-container">
          <span>Powered by</span>
          <b>
            <a rel="noopener noreferer" target="_blank" href="https://www.goepik.com.br/">
              GoEpik
            </a>
          </b>
        </Col>
      </Row>
    </div>
  );
};

export default SidebarMenu
