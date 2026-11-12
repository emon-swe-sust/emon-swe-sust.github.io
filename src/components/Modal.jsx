import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import styled, { keyframes } from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

const fade = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const rise = keyframes`
  from { opacity: 0; transform: translateY(12px) scale(0.98); }
  to { opacity: 1; transform: none; }
`;

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: 100;
  display: grid;
  place-items: center;
  padding: 16px;
  background: rgba(8, 10, 26, 0.78);
  -webkit-backdrop-filter: blur(6px);
  backdrop-filter: blur(6px);
  animation: ${fade} 0.2s ease-out;
`;

const Dialog = styled.div`
  position: relative;
  max-width: 100%;
  max-height: 100%;
  overflow: auto;
  padding: 12px;
  border-radius: 18px;
  background: var(--surface);
  border: 1px solid var(--line-strong);
  box-shadow: 0 30px 80px -20px rgba(0, 0, 0, 0.6);
  animation: ${rise} 0.25s ease-out;
  &:focus {
    outline: none;
  }
`;

const Close = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 2;
  width: 40px;
  height: 40px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  color: var(--ink);
  background: var(--surface);
  border: 1px solid var(--line-strong);
  box-shadow: var(--shadow);
  &:hover {
    border-color: var(--ink);
  }
`;

function Modal({ isShowModal, label, children }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => {
      if (e.key === "Escape") isShowModal(false);
    };
    window.addEventListener("keydown", onKey);
    if (dialogRef.current) dialogRef.current.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [isShowModal]);

  return createPortal(
    <Backdrop onClick={() => isShowModal(false)}>
      <Dialog
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        <Close type="button" onClick={() => isShowModal(false)} aria-label="Close">
          <FontAwesomeIcon icon={faXmark} />
        </Close>
        {children}
      </Dialog>
    </Backdrop>,
    document.body
  );
}

export default Modal;
