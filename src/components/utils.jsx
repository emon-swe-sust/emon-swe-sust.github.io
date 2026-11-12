import styled from "styled-components";

// Small layout helpers. Most of the visual building blocks live in ui.jsx;
// the names below are kept because pages/about/Email.jsx still imports them.

export const FlexRow = styled.div`
  display: flex;
  gap: 16px;
  width: 100%;
`;

export const FlexCol = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
`;

export const SubTitle = styled.div`
  font-family: var(--font-display);
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--ink);
  margin-bottom: 8px;
`;

export const SectionComponentContainer = styled.div`
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 14px;
  padding: 24px;
  box-shadow: var(--shadow);
  display: flex;
  flex-direction: column;
  gap: 12px;
`;
