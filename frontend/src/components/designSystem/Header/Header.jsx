import { Flex, Typography } from 'antd';
import PropTypes from 'prop-types';
import {
  buildSemanticClassNames,
  buildSemanticStyles,
  buildHeaderClasses,
} from '../../../helpers/header';

const { Title, Text } = Typography;

/**
 * Header - Page header with title and actions
 *
 * @component
 * @example
 * <Header title="Team members" description="Manage your team members" actions={<Button />} />
 */
const Header = ({
  title,
  description,
  breadcrumb,
  tabs,
  search,
  actions,
  className = '',
  classNames: customClassNames = {},
  styles: customStyles = {},
  ...restProps
}) => {
  const semanticClassNames = buildSemanticClassNames(customClassNames);
  const semanticStyles = buildSemanticStyles(customStyles);
  const rootClassName = buildHeaderClasses(className);

  return (
    <div
      className={rootClassName}
      classNames={semanticClassNames}
      styles={semanticStyles}
      {...restProps}
    >
      {/* Breadcrumb */}
      {breadcrumb && <div className="ds-header__breadcrumb">{breadcrumb}</div>}

      {/* Title and actions row */}
      <Flex align="center" justify="space-between" style={{ marginBottom: tabs || search ? 16 : 0 }}>
        <div className="ds-header__title-wrapper">
          {title && (
            <Title level={3} style={{ margin: 0, fontSize: '24px', fontWeight: 600 }}>
              {title}
            </Title>
          )}
          {description && (
            <Text type="secondary" style={{ fontSize: '14px', display: 'block', marginTop: '4px' }}>
              {description}
            </Text>
          )}
        </div>

        {actions && <div className="ds-header__actions">{actions}</div>}
      </Flex>

      {/* Tabs and search row */}
      {(tabs || search) && (
        <Flex align="center" justify="space-between">
          {tabs && <div className="ds-header__tabs">{tabs}</div>}
          {search && <div className="ds-header__search">{search}</div>}
        </Flex>
      )}
    </div>
  );
};

Header.propTypes = {
  title: PropTypes.node,
  description: PropTypes.node,
  breadcrumb: PropTypes.node,
  tabs: PropTypes.node,
  search: PropTypes.node,
  actions: PropTypes.node,
  className: PropTypes.string,
  classNames: PropTypes.object,
  styles: PropTypes.object,
};

export default Header;
