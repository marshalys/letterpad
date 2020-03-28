import React, { Component } from "react";
import { StyledLayout, defaultStyles } from "./Layout.css";
import { darkTheme, lightTheme } from "../../css-variables";

import Header from "../header";
import Sidebar from "../sidebar";
import styled from "styled-components";

const CSSVariables = styled.div<any>`
  ${props => (props.dark ? darkTheme : lightTheme)};
`;

const NoLayout = styled.div`
  ${defaultStyles};
`;
const Layout = <P extends object>(
  ComponentClass: React.ComponentType<P>,
  props: any,
) => {
  const settings = props.settings;
  let defaultTheme = "dark";
  if (typeof localStorage !== "undefined" && localStorage.theme) {
    defaultTheme = localStorage.theme;
  }

  return class extends Component<P> {
    state = {
      sidebarOpen: true,
      theme: defaultTheme,
    };

    mounted = false;

    componentDidMount() {
      this.mounted = true;
      if (typeof window !== "undefined") {
        window.addEventListener("resize", this.onResize);

        this.onResize();
      }
    }

    componentWillUnmount() {
      if (typeof window !== "undefined") {
        window.removeEventListener("resize", this.onResize);
      }
    }

    toggleSidebar = e => {
      if (e.type == "mouseover") {
        document.body.classList.add("hovering");
      } else {
        document.body.classList.remove("hovering");
      }
    };

    onResize = () => {
      if (!this.mounted) return false;
      if (document.body.clientWidth < 991) {
        this.setState({ sidebarOpen: false });
      } else {
        this.setState({ sidebarOpen: true });
      }
    };

    sidebarToggle = () => {
      this.setState({ sidebarOpen: !this.state.sidebarOpen });
    };

    switchTheme = theme => {
      this.setState({ theme });
      if (typeof localStorage !== "undefined") {
        localStorage.theme = theme;
      }
    };

    render() {
      const _props = { ...props, router: { ...this.props } };
      const classes = this.state.sidebarOpen ? "" : " collapsed";
      const selectedTheme = { [this.state.theme]: true };
      return (
        <CSSVariables {...selectedTheme}>
          {_props.layout == "none" ? (
            <NoLayout>
              <div className="content-area">
                <ComponentClass {..._props} theme={this.state.theme} />
              </div>
            </NoLayout>
          ) : (
            <StyledLayout className={"main a two-column" + classes}>
              <Sidebar {..._props} />
              <main>
                <div className="content-area">
                  <ComponentClass {..._props} theme={this.state.theme} />
                </div>
              </main>
            </StyledLayout>
          )}
        </CSSVariables>
      );
    }
  };
};

export default Layout;
