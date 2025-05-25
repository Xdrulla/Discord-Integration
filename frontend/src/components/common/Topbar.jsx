
import goepikLogo from '../../images/goepik-logo-big.png';

import UserProfile from '../Auth/UserProfile';
import { Layout } from 'antd';
import PropTypes from 'prop-types';

const { Header } = Layout;

const Topbar = () => {


  return (
    <Header className="topbar">
      <div className="topbar__left">
        <img src={goepikLogo} alt="GoEpik Logo" className="topbar__logo" />
      </div>

      <div className="topbar__right">
        <UserProfile />
      </div>
    </Header>
  );
};

Topbar.propTypes = {
  activeTab: PropTypes.string.isRequired,
  setActiveTab: PropTypes.func.isRequired,
};

export default Topbar;
