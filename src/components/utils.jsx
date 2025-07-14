import styled from "styled-components";

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

export const TitleLabel = styled.div`
  font-size: xx-large;
  border-left: 8px solid #00a74b;
  font-weight: 700;
  padding-left: 16px;
  font-family: "Barlow", sans-serif;

  color: ${(props) => props.theme.colors.title};
  @media (max-width: 768px) {
    font-size: large;
  }
`;

export const SubTitle = styled.div`
  font-size: xx-large;
  color: ${(props) => props.theme.colors.title};
  font-weight: 700;
  margin-bottom: 8px;
  @media (max-width: 768px) {
    font-size: large;
  }
`;

export const SubTitle2 = styled.div`
  font-size: ${(props) => (props.isOrg ? "larger" : "x-large")};
  color: ${(props) => props.theme.colors.title};
  font-weight: 500;
  gap: 4px;
  align-items: center;
  font-family: "Patua One", cursive;
  @media (max-width: 768px) {
    font-size: medium;
  }
`;

export const SectionComponentContainer = styled.div`
  background-color: ${(props) => props.theme.colors.bgSecondary};
  padding: 16px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const ContentContainer = styled.div``;

export const ContentTitle = styled.div`
  color: ${(props) => props.theme.colors.titleSecondary};
  font-size: larger;
  font-family: "Schibsted Grotesk", sans-serif;
  border-bottom: 1px solid;
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  @media (max-width: 768px) {
    font-size: medium;
  }
`;

export const Content = styled.div`
  display: flex;
  gap: 32px;
  @media (max-width: 768px) {
    gap: 4px;
  }
`;

export const Description = styled.div`
  font-size: 14px;
  a {
    border-bottom: 1px solid;
  }
  @media (max-width: 768px) {
    font-size: 12px;
  }
`;

export const SectionContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;
