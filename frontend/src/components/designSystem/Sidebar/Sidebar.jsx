import { Menu } from 'antd';
import PropTypes from 'prop-types';
import {
  buildSidebarClasses,
  SIDEBAR_WIDTHS,
  DEFAULT_SIDEBAR_WIDTH,
} from '../../../helpers/sidebar';

/**
 * Sidebar - Navigation sidebar with menu
 *
 * @component
 * @example
 * <Sidebar logo={<Logo />} menuItems={items} user={<UserProfile />} />
 */
const Sidebar = ({
  logo,
  menuItems = [],
  user,
  footer,
  collapsed = false,
  width = DEFAULT_SIDEBAR_WIDTH,
  className = '',
  style = {},
  ...restProps
}) => {
  const rootClassName = buildSidebarClasses(className, collapsed);
  const sidebarWidth = collapsed ? SIDEBAR_WIDTHS.COLLAPSED : width;

  return (
    <aside
      className={rootClassName}
      style={{
        width: sidebarWidth,
        minWidth: sidebarWidth,
        maxWidth: sidebarWidth,
        ...style,
      }}
      {...restProps}
    >
      <div className="ds-sidebar__container">
        {/* Logo */}
        {logo && (
          <div className="ds-sidebar__logo">
            {logo}
          </div>
        )}

        {/* Menu */}
        <Menu
          mode="inline"
          items={menuItems}
          className="ds-sidebar__menu"
          inlineCollapsed={collapsed}
        />

        {/* Footer (User + Settings) */}
        {(user || footer) && (
          <div className="ds-sidebar__footer">
            {footer && <div className="ds-sidebar__footer-content">{footer}</div>}
            {user && <div className="ds-sidebar__user">{user}</div>}
          </div>
        )}
      </div>
    </aside>
  );
};

Sidebar.propTypes = {
  logo: PropTypes.node,
  menuItems: PropTypes.array,
  user: PropTypes.node,
  footer: PropTypes.node,
  collapsed: PropTypes.bool,
  width: PropTypes.number,
  className: PropTypes.string,
  style: PropTypes.object,
};

export default Sidebar;
