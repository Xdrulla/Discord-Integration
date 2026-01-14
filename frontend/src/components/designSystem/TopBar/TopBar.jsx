import { Layout, Flex } from 'antd';
import PropTypes from 'prop-types';
import {
  buildSemanticClassNames,
  buildSemanticStyles,
  buildTopBarClasses,
  TOPBAR_VARIANTS,
  DEFAULT_TOPBAR_VARIANT,
} from '../../../helpers/topbar';

const { Header: AntHeader } = Layout;

/**
 * TopBar - Application top navigation bar
 *
 * @component
 * @example
 * <TopBar logo={<Logo />} menu={<Menu />} actions={<Actions />} />
 */
const TopBar = ({
  logo,
  menu,
  search,
  actions,
  variant = DEFAULT_TOPBAR_VARIANT,
  fixed = false,
  className = '',
  classNames: customClassNames = {},
  styles: customStyles = {},
  ...restProps
}) => {
  const semanticClassNames = buildSemanticClassNames(customClassNames, variant);
  const semanticStyles = buildSemanticStyles(customStyles);
  const rootClassName = buildTopBarClasses(className, variant, fixed);

  return (
    <AntHeader
      className={rootClassName}
      classNames={semanticClassNames}
      styles={semanticStyles}
      {...restProps}
    >
      <Flex align="center" justify="space-between" style={{ height: '100%', maxWidth: '1440px', margin: '0 auto', padding: '0 24px' }}>
        {/* Logo */}
        {logo && <div className="ds-topbar__logo">{logo}</div>}

        {/* Menu */}
        {menu && <div className="ds-topbar__menu">{menu}</div>}

        {/* Right side */}
        <Flex align="center" gap={16}>
          {/* Search */}
          {search && <div className="ds-topbar__search">{search}</div>}

          {/* Actions */}
          {actions && <div className="ds-topbar__actions">{actions}</div>}
        </Flex>
      </Flex>
    </AntHeader>
  );
};

TopBar.propTypes = {
  logo: PropTypes.node,
  menu: PropTypes.node,
  search: PropTypes.node,
  actions: PropTypes.node,
  variant: PropTypes.oneOf(Object.values(TOPBAR_VARIANTS)),
  fixed: PropTypes.bool,
  className: PropTypes.string,
  classNames: PropTypes.object,
  styles: PropTypes.object,
};

export default TopBar;
