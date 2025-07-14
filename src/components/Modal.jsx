import React, { useState } from "react";
import styled from "styled-components";
import { useSpring, animated } from "react-spring";

const ModalContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 99;
  background-color: rgba(0, 0, 0, 0.65);
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ModalContent = styled.div`
  background-color: white;
  border: none;
  border-radius: 10px;
  z-index: 999;
`;

function Modal(props) {
  const [alive, isAlive] = useState(true);
  const onClose = () => {
    isAlive(false);
    setTimeout(() => {
      props.isShowModal(false);
    }, 500);
  };
  const enterStyles = useSpring({
    from: { opacity: alive ? 0 : 1, x: alive ? "100%" : "0" },
    to: { opacity: alive ? 1 : 0, x: alive ? "0%" : "-100%" },
    config: { duration: 500 },
  });

  return (
    <ModalContainer onClick={() => onClose()}>
      <animated.div style={enterStyles}>
        <ModalContent onClick={(e) => e.stopPropagation()}>
          {props.children}
        </ModalContent>
      </animated.div>
    </ModalContainer>
  );
}

export default Modal;
