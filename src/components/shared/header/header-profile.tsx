import { ReactElement, Fragment } from "react";
import { AnchorLink } from "@/components/shared";
import { ROUTES } from "@/constants/routes.constants";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import { AnchorIcon, Divider, StyledHeaderProfile } from "./header-profile.styled";
import StyledHeader, {
  HeaderAvatar,
  HeaderAvatarPlaceholder,
  HeaderAvatarPlaceholderIcon,
  HeaderAvatarWrapper,
  HeaderProfileWrapper,
  HeaderUserName,
  StyledSocketStatus,
  StyledStatusDot,
} from "./header.styled";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLock,
  faPencil,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { getUserNameOrEmail } from "@/utils/user.util";
import { useImage } from "@/hooks/useImage";
import { useDesktopClient } from "@/hooks/useDesktopClient";
import useSocket from "@/hooks/useSocket";

const AuthAnchor: React.FC<{
  text: string;
  icon: ReactElement;
  href: string;
}> = ({ text, icon, href }) => {
  return (
    <AnchorLink type="primary" to={href} style={{ textDecoration: "none" }}>
      <AnchorIcon>{icon}</AnchorIcon>
      <span>{text}</span>
    </AnchorLink>
  );
};

export const HeaderProfile: React.FC = () => {
  const { t } = useTranslation();
  const { user, isLoading } = useAuth();
  const { isActive } = useDesktopClient();
  const { isConnected } = useSocket();

  const avatarUrl = useImage(user?.avatar, {
    width: 30,
    fit: "cover",
  });

  if (isLoading) return <StyledHeader />;

  return (
    <Fragment>
      <StyledHeaderProfile>
        {user ? (
          <AnchorLink to={ROUTES.MY_PROFILE}>
            <HeaderProfileWrapper>
              <HeaderAvatarWrapper>
                <StatusDot
                  socketConnected={isConnected}
                  desktopClientConnected={isActive}
                />
                {user?.avatar ? (
                  <HeaderAvatar
                    url={avatarUrl}
                  />
                ) : (
                  <HeaderAvatarPlaceholder>
                    <HeaderAvatarPlaceholderIcon>
                      <FontAwesomeIcon icon={faUser} />
                    </HeaderAvatarPlaceholderIcon>
                  </HeaderAvatarPlaceholder>
                )}
              </HeaderAvatarWrapper>
              <HeaderUserName>{getUserNameOrEmail(user)}</HeaderUserName>
            </HeaderProfileWrapper>
          </AnchorLink>
        ) : (
          <>
            <AuthAnchor
              key="signup"
              text={t("header.signup")}
              icon={<FontAwesomeIcon icon={faPencil} />}
              href={ROUTES.SIGNUP}
            />
            <Divider>•</Divider>
            <AuthAnchor
              key="signin"
              text={t("header.login")}
              icon={<FontAwesomeIcon icon={faLock} />}
              href={ROUTES.SIGNIN}
            />
          </>
        )}
      </StyledHeaderProfile>
    </Fragment>
  );
};

export const StatusDot: React.FC<{
  socketConnected: boolean;
  desktopClientConnected: boolean;
}> = ({ socketConnected, desktopClientConnected }) => {
  return (
    <StyledStatusDot desktopClientConnected={desktopClientConnected}>
      <StyledSocketStatus socketConnected={socketConnected}>x</StyledSocketStatus>
    </StyledStatusDot>
  );
}
