import React, { useContext } from "react";
import styled from "styled-components";
import data from "../../data.json";
import SectionTop from "../../components/SectionTop";
import { ThemeContext } from "../../components/context/Theme";
import Title from "../../components/Title";

const Container = styled.div`
  margin: 36px 0;
`;

const P = styled.p`
  margin-bottom: 16px;
`;

const OrganizationContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 32px;
  width: 100%;
  justify-content: space-between;
  @media (max-width: 1200px) {
    gap: 16px;
  }
`;

const IndividualOrganization = styled.div`
  width: 45%;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.3);
  background-color: ${(props) => props.theme.colors.bgCard};
  border: 1px solid ${(props) => props.theme.colors.border};
  @media (max-width: 1200px) {
    width: 100%;
  }
  cursor: pointer;
  :hover,
  select {
    transform: scale(1.03);
    transition: 500ms;
  }
`;

function Organization() {
  const organizations = data.about.organizations;
  const { theme } = useContext(ThemeContext);
  return (
    <Container>
      <Title>Supplementary activities</Title>
      <P>{organizations.description}</P>
      <OrganizationContainer theme={theme}>
        {organizations.organization_list.map((org, idx) => (
          <IndividualOrganization theme={theme} key={idx}>
            <SectionTop section={org} key={idx} isOrg={true} />
          </IndividualOrganization>
        ))}
      </OrganizationContainer>
    </Container>
  );
}

export default Organization;
