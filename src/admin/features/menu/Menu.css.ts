import { Link } from "react-router-dom";
import styled from "styled-components";

export const StyledHeading = styled.div`
  font-size: 11px;
  text-transform: uppercase;
  font-weight: bold;
  margin: 16px 0px 8px 8px;
  letter-spacing: 1px;
`;
export const MenuItem = styled.li`
  margin-bottom: 24px;
`;

export const StyledLink = styled(Link)`
  display: block;
  &.active {
    background: var(--bg-base);
  }
  &:hover {
    background: var(--bg-base);
  }
  .menu-icon {
    margin-right: 8px;
    color: var(--color-text-3) !important;
  }
`;
const StyledMenu = styled.div`
  overflow-y: auto;
  padding: 28px 40px;
  font-size: 16px;
`;

export default StyledMenu;
