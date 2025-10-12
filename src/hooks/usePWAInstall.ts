import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import useUserAgent from "./useUserAgent";

type BeforeInstallPromptEvent = Event & {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
};

export type InstallationType = "prompt" | "manual" | "desktop" | "none";

interface NavigatorWithRelatedApps extends Navigator {
  getInstalledRelatedApps?: () => Promise<
    Array<{ platform: string; url?: string }>
  >;
}

export const usePWAInstall = () => {
  const [installPrompt, setInstallPrompt] = useState<Event>();
  const [isInstallable, setIsInstallable] = useState(false);
  const [isPWAInstalled, setIsPWAInstalled] = useState(false);
  const [isCheckingInstallation, setIsCheckingInstallation] = useState(true);
  const { isMobile, isIOS, isStandalone } = useUserAgent();
  const [installationType, setInstallationType] =
    useState<InstallationType>("none");

  useEffect(() => {
    const checkIfPWAInstalled = async () => {
      try {
        const nav = navigator as NavigatorWithRelatedApps;

        if ("getInstalledRelatedApps" in nav && nav.getInstalledRelatedApps) {
          const relatedApps = await nav.getInstalledRelatedApps();
          const installed = relatedApps.length > 0;
          console.log("PWA Installation Check:", {
            relatedApps,
            installed,
            isStandalone: window.matchMedia("(display-mode: standalone)")
              .matches,
          });
          setIsPWAInstalled(installed);
        } else {
          console.log("getInstalledRelatedApps API not available");
        }
      } catch (error) {
        console.warn("Could not check PWA installation status:", error);
      } finally {
        setIsCheckingInstallation(false);
      }
    };

    checkIfPWAInstalled();
  }, []);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setInstallPrompt(promptEvent);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsInstallable(false);
      setInstallPrompt(undefined);
      setIsPWAInstalled(true);
      toast.success("PWA installed successfully!");
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  useEffect(() => {
    console.log("installationType effect:", {
      isCheckingInstallation,
      isStandalone,
      isPWAInstalled,
      isMobile,
      isIOS,
      isInstallable,
    });

    if (isCheckingInstallation) {
      return;
    }

    if (isStandalone || isPWAInstalled) {
      console.log("Setting installationType to 'none' because:", {
        isStandalone,
        isPWAInstalled,
      });
      setInstallationType("none");
      return;
    }

    let newType: InstallationType;
    switch (true) {
      case isMobile && isIOS:
        newType = "manual";
        break;
      case isMobile && isInstallable:
        newType = "prompt";
        break;
      case isMobile:
        newType = "manual";
        break;
      default:
        newType = "desktop";
        break;
    }
    console.log("Setting installationType to:", newType);
    setInstallationType(newType);
  }, [
    isMobile,
    isIOS,
    isInstallable,
    isStandalone,
    isPWAInstalled,
    isCheckingInstallation,
  ]);

  const install = async () => {
    if (!installPrompt) {
      toast.warning("Installation prompt not available.");
      return null;
    }

    // show prompt
    await (installPrompt as BeforeInstallPromptEvent).prompt();
    const choiceResult = await (installPrompt as BeforeInstallPromptEvent)
      .userChoice;
    return choiceResult.outcome === "accepted";
  };

  return {
    isInstallable,
    install,
    installationType,
    isPWAInstalled,
    isCheckingInstallation,
  };
};

export default usePWAInstall;
