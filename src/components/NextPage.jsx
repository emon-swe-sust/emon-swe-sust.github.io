import React from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { Shell } from "./ui";

const Wrap = styled.div`
  border-top: 1px solid var(--line);
  margin-top: 24px;
  padding: 40px 0 72px;
`;

const NextLink = styled(Link)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 8px 0;
  svg {
    font-size: 1.5rem;
    color: var(--accent);
    transition: transform 0.2s ease;
  }
  &:hover svg {
    transform: translateX(6px);
  }
  &:hover strong {
    text-decoration: underline;
    text-decoration-color: var(--accent);
    text-decoration-thickness: 3px;
    text-underline-offset: 8px;
  }
`;

const Label = styled.span`
  display: block;
  font-family: var(--font-display);
  font-weight: 500;
  font-size: 0.9375rem;
  color: var(--muted);
  margin-bottom: 4px;
`;

const Target = styled.strong`
  font-family: var(--font-display);
  font-weight: 750;
  font-size: clamp(1.625rem, 3.4vw, 2.25rem);
  letter-spacing: -0.03em;
  line-height: 1.1;
`;

function NextPage({ to, tone, label = "Next", children }) {
  return (
    <Shell>
      <Wrap data-tone={tone}>
        <NextLink to={to}>
          <span>
            <Label>{label}</Label>
            <Target>{children}</Target>
          </span>
          <FontAwesomeIcon icon={faArrowRight} />
        </NextLink>
      </Wrap>
    </Shell>
  );
}

export default NextPage;
