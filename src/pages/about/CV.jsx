import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileArrowDown } from "@fortawesome/free-solid-svg-icons";
import { Button } from "../../components/ui";
import profile from "../../profile";

function CV() {
  return (
    <Button
      $primary
      href={`${process.env.PUBLIC_URL || ""}/${profile.cv.file}`}
      download={profile.cv.downloadAs}
    >
      <FontAwesomeIcon icon={faFileArrowDown} />
      Download CV
    </Button>
  );
}

export default CV;
