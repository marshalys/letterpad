import styled from "styled-components";

const Sidebar = styled.div`
  /* border-radius: 0px;
  background: var(--bg-base);
  border: 0;
  padding: 0;
  margin: 0;
  position: fixed;
  height: 100%;
  width: 290px;
  flex: 1;

  .sidebar { */
  background: var(--bg-base);
  position: fixed;
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  box-shadow: var(--sidebar-shadow);
  width: 290px;
  height: 100vh;
  top: 0;
  left: 0;
  z-index: 999;
  background-repeat: no-repeat;
  background-position: center center;
  background-size: cover;

  .sidebar-top {
    display: flex;
    flex-direction: column;

    .custom-menu {
      height: calc(100vh - 160px);
      overflow-y: auto;
      ul {
        height: 100%;
        margin: 0px;
      }
    }
  }
  @media (max-width: 991px) {
    /* position: relative; */
    z-index: 99999;
    padding: 0;
    &:after {
      content: normal;
    }

    .wrapper {
      margin-left: 0;
    }
  }
  .about-site {
    margin: 0px;
    color: #636363;
    padding: 0px 16px 28px;
    font-weight: 400;
    text-shadow: 0px 1px 0px #000;
  }
  .search-box {
    margin: 0 16px;
    padding-left: 10px;
    background: #282c36;
    input {
      border: none;
    }
  }
  /* a {
      color: rgba(255, 255, 255, 0.7);
      &:hover {
        color: #fff;
      }
    } */
  .view-site {
    height: 45px;
    display: flex;
    border-top: 1px solid var(--color-border);
    align-items: center;
    padding: 30px 40px;
    color: var(--color-base);
  }
  /* } */
`;

export default Sidebar;
