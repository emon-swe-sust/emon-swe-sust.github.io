import { useContext } from "react";
import { ThemeContext } from "./context/Theme";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleInfo } from "@fortawesome/free-solid-svg-icons";
import { Description } from "./utils";

const InvolvmentsContainer = styled.div`
  margin-left: 16px;
  display: flex;
  flex-direction: column;
  gap: ${(props) => (props.gap ? props.gap : 0)};
  @media (max-width: 768px) {
    margin-left: 0;
  }
`;

const InvolvementItem = styled.div`
  display: flex;
  gap: ${(props) => (props.type === "small" ? "4px" : "8px")};
`;
const BulletPoints = ({ bulletPoints, type, bulletIcon, gap }) => {
  const { theme } = useContext(ThemeContext);
  return (
    <InvolvmentsContainer gap={gap}>
      {bulletPoints &&
        bulletPoints.map((point, idx) => (
          <InvolvementItem key={idx} type={type}>
            {bulletIcon ? (
              bulletIcon
            ) : (
              <FontAwesomeIcon
                icon={faCircleInfo}
                style={{
                  color: theme.colors.titleSecondary,
                }}
              />
            )}

            <Description
              dangerouslySetInnerHTML={{ __html: point }}
              margin={"0"}
            ></Description>
          </InvolvementItem>
        ))}
    </InvolvmentsContainer>
  );
};

export default BulletPoints;
