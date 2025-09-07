import "./TagButton.css";

import { ButtonHTMLAttributes } from "react";

type TagButtonProps = {
  icon?: string;
  label?: string;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export const TagButton = (props: TagButtonProps) => {
  return (
    <button
      className="tag-button"
      {...props}
    >
      {props.icon && <i className={`pi ${props.icon}`} />}
      {props.label && <span>{props.label}</span>}
    </button>
  );
};
