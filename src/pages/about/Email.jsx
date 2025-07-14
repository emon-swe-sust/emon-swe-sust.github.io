import React, { useContext, useState } from "react";
import emailjs from "emailjs-com";
import { ThemeContext } from "../../components/context/Theme";
import styled from "styled-components";
import { useToast } from "@chakra-ui/react";
import { SectionComponentContainer, SubTitle } from "../../components/utils";

const TitleContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: auto;
`;

const TitleBottom = styled.div`
  color: ${(props) => props.theme.colors.secondary};
  font-size: large;
  @media (max-width: 768px) {
    font-size: medium;
  }
`;

const StyledForm = styled.form`
  margin: 36px 0 8px 0;
  display: flex;
  flex-direction: column;
  padding: 0 24px;

  gap: 16px;
`;

const Entry = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const Label = styled.label`
  font-size: larger;
  @media (max-width: 768px) {
    font-size: medium;
  }
`;

const Input = styled.input`
  padding: 8px;
  background-color: ${(props) => props.theme.colors.bg};
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: 4px;
  color: ${(props) => props.theme.colors.primary};
  font-size: large;
`;

const TextArea = styled.textarea`
  padding: 8px;
  background-color: ${(props) => props.theme.colors.bg};
  border: none;
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: 4px;
  color: ${(props) => props.theme.colors.primary};
  font-size: large;
  height: 100px;
`;

const TopEntry = styled.div`
  display: flex;
  gap: 36px;
  justify-content: space-between;
  @media (max-width: 1200px) {
    flex-direction: column;
    gap: 12px;
  }
`;

const Button = styled.button`
  padding: 12px 200px;
  font-size: large;
  background-color: ${(props) => props.theme.colors.btnSuccess};
  color: white;
  border: none;
  border-radius: 4px;
  margin: auto;
  margin-top: 36px;
  cursor: ${(props) => (props.valid ? "pointer" : "not-allowed")};
  @media (max-width: 768px) {
    padding: 12px 100px;
    margin-top: 12px;
    width: 100%;
  }
  :hover {
    background-color: ${(props) => props.theme.colors.btnHover};
  }
  :disabled {
    background-color: ${(props) => props.theme.colors.btnDisable};
  }
`;

const Container = styled(SectionComponentContainer)`
  padding: 32px 10%;
  margin-top: 16px;
  border-radius: 0;
  @media (max-width: 768px) {
    padding: 16px;
  }
`;

function Email() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [phone, setPhone] = useState("");
  const [emailValid, setEmailValid] = useState(false);
  const toast = useToast();

  function handleSubmit(event) {
    event.preventDefault();
    emailjs.init(process.env.REACT_APP_PUBLIC_KEY);

    setEmail("");
    setMessage("");
    setName("");
    setPhone("");
    setEmailValid(false);

    emailjs
      .send(
        process.env.REACT_APP_SERVICE_KEY,
        process.env.REACT_APP_TEMPLATE_ID,
        {
          from_name: name,
          from_email: email,
          message: message,
          from_phone: phone,
        }
      )
      .then((response) => {
        toast({
          title: "Email sent successfully! I'll knock you back ASAP!",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
      })
      .catch((error) => {
        toast({
          title: "Sorry, something went wrong :(",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      });
  }

  const { theme } = useContext(ThemeContext);

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setEmailValid(e.target.validity.valid);
  };
  return (
    <Container theme={theme}>
      <TitleContainer>
        <SubTitle theme={theme}>Get In Touch!</SubTitle>
        <TitleBottom theme={theme}>
          My inbox is always open. Whether you have a question or just want to
          create your next idea together ! <br />
          <i>Can ignore contact informations for anonymity</i>
        </TitleBottom>
      </TitleContainer>
      <StyledForm onSubmit={handleSubmit}>
        <TopEntry>
          <Entry>
            <Label>Name:</Label>
            <Input
              theme={theme}
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </Entry>
          <Entry>
            <Label>Phone:</Label>
            <Input
              theme={theme}
              type="number"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
            />
          </Entry>
          <Entry>
            <Label>Email:</Label>
            <Input
              theme={theme}
              type="email"
              value={email}
              onChange={(event) => handleEmailChange(event)}
            />
          </Entry>
        </TopEntry>
        <Entry>
          <Label>Message:</Label>
          <TextArea
            required
            theme={theme}
            type="text"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
          />
        </Entry>
        <Button
          type="submit"
          theme={theme}
          valid={name && email && phone && message && emailValid}
          disabled={!message}
        >
          Send
        </Button>
      </StyledForm>
    </Container>
  );
}

export default Email;
