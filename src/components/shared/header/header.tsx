import { LoginModal, SignupModal } from "components/modals";
import { useState } from "react";
import { AuthHeader } from "./auth-header";
import StyledHeader, { HeaderImage, NavHeader } from "./header.styled";
import { MenuHeader } from "./menu-header";

export const Header: React.FC = () => {
  const [isShownLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [isShownSignupModal, setShowSignupModal] = useState<boolean>(false);

  const showLoginModal = () => setShowLoginModal(true);
  const hideLoginModal = () => setShowLoginModal(false);
  const showSignupModal = () => setShowSignupModal(true);
  const hideSignupModal = () => setShowSignupModal(false);

  return (
    <>
      <LoginModal
        isOpen={isShownLoginModal}
        showModal={showLoginModal}
        hideModal={hideLoginModal}
      />
      <SignupModal
        isOpen={isShownSignupModal}
        showModal={showSignupModal}
        hideModal={hideSignupModal}
      />
      <StyledHeader>
        <HeaderImage
          src="/images/es-logo.svg"
          className="img-responsive"
          alt="Electric Sheep"
        />
        <NavHeader>
          <AuthHeader
            showLoginModal={showLoginModal}
            showSignupModal={showSignupModal}
          />
          <MenuHeader />
        </NavHeader>
      </StyledHeader>
    </>
  );
};

export default Header;
