import React, { useState } from "react";
import Input, { InputProps } from "../input/input";

// eslint-disable-next-line react/display-name
export const InputPassword = React.forwardRef<HTMLInputElement, InputProps>(
  ({ after, ...props }, ref) => {
    const [show, setShow] = useState(false);

    const handleShow = () => setShow((val) => !val);
    console.log({ props }, { ref });

    return (
      <Input
        ref={ref}
        {...props}
        type={show ? "text" : "password"}
        onClickAfter={handleShow}
        after={
          <>
            {after}
            <i className={`fa ${show ? "fa-eye-slash" : "fa-eye"}`} />
          </>
        }
      />
    );
  },
);

export default InputPassword;
