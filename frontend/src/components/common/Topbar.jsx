import goepikLogo from '../../images/goepik-logo-big.png';
import UserProfile from '../Auth/UserProfile';
import { Layout } from 'antd';
import { BulbOutlined, BulbFilled } from "@ant-design/icons";
import useDarkMode from '../../hooks/useDarkMode';

const { Header } = Layout;

const Topbar = () => {
  const [darkMode, setDarkMode] = useDarkMode();

  return (
    <Header className="topbar">
      <div className="topbar__left">
        <img src={goepikLogo} alt="GoEpik Logo" className="topbar__logo" />
      </div>

      <div className="topbar__right">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="theme-toggle"
          title="Alternar Tema"
          aria-label={darkMode ? "Ativar modo claro" : "Ativar modo escuro"}
        >
          {darkMode ? <BulbFilled /> : <BulbOutlined />}
        </button>
        <UserProfile />
      </div>
    </Header>
  );
};

export default Topbar;
