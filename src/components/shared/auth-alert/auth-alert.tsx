import React from "react";
import { motion } from "framer-motion";
import { CircleAlert, CircleCheck, Info, TriangleAlert } from "lucide-react";
import {
  AuthAlertActions,
  AuthAlertBody,
  AuthAlertIcon,
  AuthAlertMessage,
  AuthAlertTitle,
  StyledAuthAlert,
} from "./auth-alert.styled";
import type { AuthAlertVariant } from "@/utils/auth-error.util";
export type { AuthAlertVariant } from "@/utils/auth-error.util";

export { AuthAlertActionLink } from "./auth-alert.styled";

const ICONS = {
  error: CircleAlert,
  warning: TriangleAlert,
  success: CircleCheck,
  info: Info,
};

type AuthAlertProps = {
  variant?: AuthAlertVariant;
  title?: React.ReactNode;
  children?: React.ReactNode;
  actions?: React.ReactNode;
};

export const AuthAlert: React.FC<AuthAlertProps> = ({
  variant = "error",
  title,
  children,
  actions,
}) => {
  const Icon = ICONS[variant];

  return (
    <motion.div
      initial={{ opacity: 0, y: -6, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6, scale: 0.98 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
    >
      <StyledAuthAlert
        variant={variant}
        role={variant === "success" || variant === "info" ? "status" : "alert"}
      >
        <AuthAlertIcon variant={variant}>
          <Icon size={16} strokeWidth={2} />
        </AuthAlertIcon>
        <AuthAlertBody>
          {title && <AuthAlertTitle variant={variant}>{title}</AuthAlertTitle>}
          {children && <AuthAlertMessage>{children}</AuthAlertMessage>}
        </AuthAlertBody>
        {actions && <AuthAlertActions>{actions}</AuthAlertActions>}
      </StyledAuthAlert>
    </motion.div>
  );
};

export default AuthAlert;
