import React, { useEffect, useState } from "react";
import styled, { keyframes } from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { asset } from "./format";

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

const Frame = styled.div`
  position: relative;
  display: grid;
  place-items: center;
  min-width: min(86vw, 320px);
  min-height: 200px;
  border-radius: 10px;
  overflow: hidden;
  background: #fff;
  border: 1px solid var(--line);
`;

const Shot = styled.img`
  display: block;
  max-width: min(92vw, 1100px);
  max-height: 72vh;
  width: auto;
  height: auto;
  object-fit: contain;
  opacity: ${(p) => (p.$loaded ? 1 : 0)};
  transition: opacity 0.2s ease;
`;

const Spinner = styled.span`
  position: absolute;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 3px solid var(--line-strong);
  border-top-color: var(--ink);
  animation: ${spin} 0.8s linear infinite;
`;

const Controls = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 4px 4px;
  font-family: var(--font-display);
  font-weight: 600;
  color: var(--ink-2);
`;

const Step = styled.button`
  display: inline-grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  color: var(--ink);
  background: var(--surface-2);
  border: 1px solid var(--line-strong);
  &:hover:not(:disabled) {
    border-color: var(--ink);
  }
  &:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }
`;

function Images({ images, title = "Project" }) {
  const [index, setIndex] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const last = images.length - 1;

  useEffect(() => {
    setLoaded(false);
  }, [index]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowLeft") setIndex((i) => Math.max(0, i - 1));
      if (e.key === "ArrowRight") setIndex((i) => Math.min(last, i + 1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [last]);

  return (
    <div>
      <Frame>
        {!loaded && <Spinner aria-hidden="true" />}
        <Shot
          src={asset(images[index])}
          alt={`${title} screenshot ${index + 1} of ${images.length}`}
          onLoad={() => setLoaded(true)}
          $loaded={loaded}
        />
      </Frame>
      {images.length > 1 && (
        <Controls>
          <Step
            type="button"
            onClick={() => setIndex(index - 1)}
            disabled={index === 0}
            aria-label="Previous screenshot"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
          </Step>
          <span aria-live="polite">
            {index + 1} / {images.length}
          </span>
          <Step
            type="button"
            onClick={() => setIndex(index + 1)}
            disabled={index === last}
            aria-label="Next screenshot"
          >
            <FontAwesomeIcon icon={faArrowRight} />
          </Step>
        </Controls>
      )}
    </div>
  );
}

export default Images;
