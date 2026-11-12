import styled from "styled-components";

// Small pieces shared by the games.
export const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 22px;
  max-width: 760px;
`;

export const Intro = styled.p`
  color: var(--ink-2);
  font-size: 1.0625rem;
  max-width: 60ch;
`;

export const Row = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px 14px;
`;

export const Action = styled.button`
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  padding: 0 18px;
  border-radius: 10px;
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 0.9375rem;
  cursor: pointer;
  color: ${(p) => (p.$ghost ? "var(--ink)" : "var(--bg)")};
  background: ${(p) => (p.$ghost ? "var(--surface)" : "var(--ink)")};
  border: 1px solid ${(p) => (p.$ghost ? "var(--line-strong)" : "var(--ink)")};
  transition: transform 0.15s ease, border-color 0.15s ease;
  &:hover {
    transform: translateY(-1px);
    border-color: var(--ink);
  }
  ${(p) =>
    p.$active &&
    `background: var(--ink); color: var(--bg); border-color: var(--ink);`}
`;

export const Meta = styled.span`
  font-family: var(--font-display);
  font-weight: 500;
  font-size: 0.9375rem;
  color: var(--muted);
`;

export const Status = styled.p`
  min-height: 1.6em;
  font-family: var(--font-display);
  font-weight: 650;
  font-size: 1.0625rem;
`;

export const Seg = styled.button`
  min-height: 36px;
  padding: 0 14px;
  border-radius: 8px;
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  color: ${(p) => (p.$on ? "var(--bg)" : "var(--ink-2)")};
  background: ${(p) => (p.$on ? "var(--ink)" : "var(--surface)")};
  border: 1px solid ${(p) => (p.$on ? "var(--ink)" : "var(--line-strong)")};
  &:hover {
    border-color: var(--ink);
  }
`;
