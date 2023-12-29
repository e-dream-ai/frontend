import React, { useState } from "react";
import Input, { InputProps } from "../input/input";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

export const InputPassword = React.forwardRef<HTMLInputElement, InputProps>(
  ({ after, ...props }, ref) => {
    const [show, setShow] = useState(false);
    const handleShow = () => setShow((val) => !val);

    return (
      <Input
        ref={ref}
        {...props}
        type={show ? "text" : "password"}
        onClickAfter={handleShow}
        after={
          <>
            {after}
            <FontAwesomeIcon icon={show ? faEyeSlash : faEye} />
          </>
        }
      />
    );
  },
);

export default InputPassword;
