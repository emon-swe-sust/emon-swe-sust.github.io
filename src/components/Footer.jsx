import React from "react";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBuildingColumns,
  faEnvelope,
  faGraduationCap,
  faPhone,
} from "@fortawesome/free-solid-svg-icons";
import { Shell, ExtLink } from "./ui";
import { GithubIcon, LinkedInIcon } from "./icons";
import profile from "../profile";

const FooterEl = styled.footer`
  margin-top: 40px;
  padding: 48px 0 40px;
  background: var(--surface);
  border-top: 1px solid var(--line);
`;

const Grid = styled.div`
  display: grid;
  gap: 32px;
  @media (min-width: 800px) {
    grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr) auto;
    align-items: start;
    gap: 56px;
  }
`;

const Name = styled.p`
  font-family: var(--font-display);
  font-weight: 750;
  font-size: 1.375rem;
  letter-spacing: -0.02em;
  line-height: 1.2;
`;

const Sub = styled.p`
  margin-top: 6px;
  color: var(--muted);
  font-size: 0.9375rem;
  line-height: 1.5;
`;

const ContactList = styled.ul`
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  font-family: var(--font-display);
  font-weight: 500;
  li {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  svg {
    color: var(--c-research-ink);
    flex: none;
  }
  a:hover {
    text-decoration: underline;
    text-underline-offset: 3px;
  }
`;

const Socials = styled.div`
  display: flex;
  gap: 8px;
`;

const Social = styled.a`
  display: inline-grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  font-size: 1.125rem;
  color: var(--ink-2);
  border: 1px solid var(--line-strong);
  transition: color 0.15s ease, border-color 0.15s ease;
  &:hover {
    color: var(--ink);
    border-color: var(--ink);
  }
`;

const Legal = styled.p`
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid var(--line);
  color: var(--muted);
  font-size: 0.875rem;
`;

function Footer() {
  const year = new Date().getFullYear();
  return (
    <FooterEl>
      <Shell>
        <Grid>
          <div>
            <Name>{profile.name}</Name>
            <Sub>
              {profile.role}, {profile.institution}, {profile.location}
            </Sub>
          </div>
          <ContactList>
            <li>
              <FontAwesomeIcon icon={faEnvelope} />
              <a href={`mailto:${profile.email}`}>{profile.email}</a>
            </li>
            <li>
              <FontAwesomeIcon icon={faPhone} />
              <a href={`tel:${profile.phone}`}>{profile.phone}</a>
            </li>
          </ContactList>
          <Socials>
            <Social as={ExtLink} href={profile.links.scholar} aria-label="Google Scholar" title="Google Scholar">
              <FontAwesomeIcon icon={faGraduationCap} />
            </Social>
            <Social as={ExtLink} href={profile.links.linkedin} aria-label="LinkedIn" title="LinkedIn">
              <LinkedInIcon />
            </Social>
            <Social as={ExtLink} href={profile.links.github} aria-label="GitHub" title="GitHub">
              <GithubIcon />
            </Social>
            <Social as={ExtLink} href={profile.links.sust} aria-label="SUST faculty page" title="SUST faculty page">
              <FontAwesomeIcon icon={faBuildingColumns} />
            </Social>
          </Socials>
        </Grid>
        <Legal>
          © {year} {profile.name}
        </Legal>
      </Shell>
    </FooterEl>
  );
}

export default Footer;
