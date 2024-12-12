import { useState, useEffect } from "react";
import Modal from "../modal/modal";
import { AddToIosSafari } from "./add-to-ios-safari";
import { AddToMobileChrome } from "./add-to-mobile-chrome";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import useUserAgent from "@/hooks/useUserAgent";

type AddToHomeScreenPromptType =
  | "safari"
  | "chrome"
  | "firefox"
  | "other"
  | "firefoxIos"
  | "chromeIos"
  | "samsung"
  | "";
const LS_KEY_NAME = "addToHomeScreenPrompt";

export const AddToHomeScreen: React.FC = () => {
  const [displayPrompt, setDisplayPrompt] =
    useState<AddToHomeScreenPromptType>("");
  const { userAgent, isMobile, isStandalone, isIOS } = useUserAgent();
  const { getItem, setItem } = useLocalStorage(LS_KEY_NAME);

  const closePrompt = () => {
    setDisplayPrompt("");
  };

  // const doNotShowAgain = () => {
  //   setItem("dontShow");
  //   setDisplayPrompt("");
  // };

  useEffect(() => {
    const addToHomeScreenPromptCookie = getItem();

    if (addToHomeScreenPromptCookie !== "dontShow") {
      // Only show prompt if user is on mobile and app is not installed
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
      }
    }
  }, [userAgent, isMobile, isStandalone, isIOS, getItem]);

  const Prompt = () => (
    <>
      {
        {
          safari: (
            <AddToIosSafari
            // closePrompt={closePrompt}
            // doNotShowAgain={doNotShowAgain}
            />
          ),
          chrome: (
            <AddToMobileChrome
            // closePrompt={closePrompt}
            // doNotShowAgain={doNotShowAgain}
            />
          ),
          firefox: (
            <AddToMobileChrome
            // closePrompt={closePrompt}
            // doNotShowAgain={doNotShowAgain}
            />
          ),
          firefoxIos: (
            <AddToMobileChrome
            // closePrompt={closePrompt}
            // doNotShowAgain={doNotShowAgain}
            />
          ),
          chromeIos: (
            <AddToMobileChrome
            // closePrompt={closePrompt}
            // doNotShowAgain={doNotShowAgain}
            />
          ),
          samsung: (
            <AddToMobileChrome
            // closePrompt={closePrompt}
            // doNotShowAgain={doNotShowAgain}
            />
          ),
          other: (
            <AddToMobileChrome
            // closePrompt={closePrompt}
            // doNotShowAgain={doNotShowAgain}
            />
          ),
          "": <></>,
        }[displayPrompt]
      }
    </>
  );

  return (
    <>
      {/* {displayPrompt !== "" ? ( */}
      <Modal isOpen title="Add to homescreen" hideModal={closePrompt}>
        <Prompt />
      </Modal>
      {/*  ) : (
        <></>
       )} */}
    </>
  );
};

export default AddToHomeScreen;
