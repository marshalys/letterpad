import styled from "styled-components";

const applyConfirmStyle = () => `
    width: 767px;
    left: 50%;
    margin-left: -353px;
    margin-top: 2%;
    position: absolute;
    height: auto;
    box-shadow: var(--box-shadow);
    background: var(--bg-base);

    .modal-body {
        max-height:80vh;
    }

    @media(max-width:767px) {
      width: 100%;
      left: 0%;
      margin-left: 0px;
    }
`;
const StyledModal = styled.div<{ backDropColor?: string; confirm?: boolean }>`
  opacity: 0;
  display: block;
  height: 100%;
  left: 0;
  position: fixed;
  top: 0;
  width: 100%;
  z-index: 999;
  /* transition: 0.2s all linear; */
  transform: scale(0.7);
  &.in {
    opacity: 1;
    transform: scale(1);
  }
  &.onEnter {
    opacity: 0.98;
    transform: scale(1);
  }

  &.onLeave {
    opacity: 0;
    transform: scale(0.7);
  }

  .modal-wrapper {
    height: 100%;
    display: grid;
    grid-template-rows: 52px 1fr 52px;
    top: 0px;
    left: 0px;
    height: 100vh;
    width: 100vw;
    position: fixed;
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      min-height: 16.42857143px;
      padding: 26px 16px;
      background: var(--bg-base);
      border-bottom: 1px solid var(--color-border);
      h3 {
        padding: 15px 0px;
        margin: 0px;
      }
      .material-icons {
        color: var(--color-text-2);
        cursor: pointer;
      }
    }
    .modal-body {
      overflow-y: auto;
      max-height: calc(100vh - 106px);
      padding: 20px 16px;
      text-align: center;
    }
    .modal-footer {
      display: flex;
      align-items: center;
      width: 100%;
      justify-content: flex-end;
      padding: 0px 14px;
      border-top: 1px solid var(--color-border);
      background: var(--bg-base);
    }
    ${props => props.confirm && applyConfirmStyle()};
  }

  .backdrop {
    position: relative;
    top: 0px;
    left: 0px;
    width: 100vw;
    height: 100vh;
    background: ${p => p.backDropColor || "var(--bg-base)"};
    opacity: 0.99;
  }
`;
export default StyledModal;
