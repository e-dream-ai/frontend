import { useState, useEffect } from "react";
import Modal from "../modal/modal";
import { AddToIosSafari } from "./add-to-ios-safari";
import { AddToMobileChrome } from "./add-to-mobile-chrome";
import { AddToMobileChromeIos } from "./add-to-mobile-chrome-ios";
import useUserAgent from "@/hooks/useUserAgent";
import styled from "styled-components";
import { AddToSamsung } from "./add-to-samsung";
import { AddToOtherBrowser } from "./add-to-other-browser";
import { AddToFirefox } from "./add-to-firefox";
import { AddToFirefoxIos } from "./add-to-firefox-ios";
import { AddToDesktopChrome } from "./add-to-desktop-chrome";

export const LogoIcon = styled.img`
  width: auto;
  height: 4rem;
`;

type AddToHomeScreenPromptType =
  | "safari"
  | "chrome"
  | "firefox"
  | "other"
  | "firefoxIos"
  | "chromeIos"
  | "samsung"
  | "chromeDesktop"
  | "";

type AddToHomeScreenProps = {
  isOpen?: boolean
  onClose?: () => void
}

export const AddToHomeScreen: React.FC<AddToHomeScreenProps> = ({ isOpen, onClose }) => {
  const [displayPrompt, setDisplayPrompt] =
    useState<AddToHomeScreenPromptType>("");
  const { userAgent, isMobile, isStandalone, isIOS } = useUserAgent();


  useEffect(() => {
    if (isMobile && !isStandalone) {
      if (userAgent === "Safari") {
        setDisplayPrompt("safari");
      } else if (userAgent === "Chrome") {
        setDisplayPrompt("chrome");
      } else if (userAgent === "Firefox") {
        setDisplayPrompt("firefox");
      } else if (userAgent === "FirefoxiOS") {
        setDisplayPrompt("firefoxIos");
      } else if (userAgent === "ChromeiOS") {
        setDisplayPrompt("chromeIos");
      } else if (userAgent === "SamsungBrowser") {
        setDisplayPrompt("samsung");
      } else {
        setDisplayPrompt("other");
      }
    } else {
      if (userAgent === "Chrome") {
        setDisplayPrompt("chromeDesktop");
      } else {
        setDisplayPrompt("other");
      }
    }

  }, [userAgent, isMobile, isStandalone, isIOS]);

  const Prompt = () => (
    <>
      {
        {
          safari: (
            <AddToIosSafari />
          ),
          chrome: (
            <AddToMobileChrome />
          ),
          firefox: (
            <AddToFirefox />
          ),
          firefoxIos: (
            <AddToFirefoxIos />
          ),
          chromeIos: (
            <AddToMobileChromeIos />
          ),
          chromeDesktop: (<AddToDesktopChrome />),
          samsung: (
            <AddToSamsung />
          ),
          other: (
            <AddToOtherBrowser />
          ),
          "": <></>,
        }[displayPrompt]
      }
    </>
  );

  return (
    <>
      <Modal isOpen={isOpen} title="Add to homescreen" hideModal={onClose}>
        <Prompt />
      </Modal>
    </>
  );
};

export default AddToHomeScreen;