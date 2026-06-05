import React from "react";
import { AuthCardBox, AuthScreen, AuthSubtitle } from "./auth-card.styled";

type AuthCardProps = {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
};

export const AuthCard: React.FC<AuthCardProps> = ({
  title,
  subtitle,
  children,
}) => (
  <AuthScreen>
    <AuthCardBox className="auth-card">
      {title && <h2>{title}</h2>}
      {subtitle && <AuthSubtitle>{subtitle}</AuthSubtitle>}
      {children}
    </AuthCardBox>
  </AuthScreen>
);

export default AuthCard;
