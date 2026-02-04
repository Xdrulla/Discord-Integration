import goepikLogo from '../../images/goepik-logo-big.png';
import UserProfile from '../Auth/UserProfile';
import { BulbOutlined, BulbFilled } from "@ant-design/icons";
import useDarkMode from '../../hooks/useDarkMode';
import { TopBar } from '../designSystem';

const Topbar = () => {
  const [darkMode, setDarkMode] = useDarkMode();

  // Logo
  const logo = (
    <img src={goepikLogo} alt="GoEpik Logo" className="topbar__logo" />
  );

  // Actions (theme toggle + user profile)
  const actions = (
    <>
      <button
        onClick={() => setDarkMode(!darkMode)}
        className="theme-toggle"
        title="Alternar Tema"
        aria-label={darkMode ? "Ativar modo claro" : "Ativar modo escuro"}
      >
        {darkMode ? <BulbFilled /> : <BulbOutlined />}
      </button>
      <UserProfile />
    </>
  );

  return (
    <TopBar
      logo={logo}
      actions={actions}
      className="topbar"
    />
  );
};

export default Topbar;
