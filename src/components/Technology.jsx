import React from "react";
import { Chip, Chips } from "./ui";

// `tint` colours the chips with the current section's accent.
const Technology = ({ technologies, tint = true, label = "Technologies" }) => {
  if (!technologies || technologies.length === 0) return null;
  return (
    <Chips aria-label={label}>
      {technologies.map((technology, idx) => (
        <Chip key={idx} $tint={tint}>
          {technology.trim()}
        </Chip>
      ))}
    </Chips>
  );
};

export default Technology;
