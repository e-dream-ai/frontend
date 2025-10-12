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
          setIsPWAInstalled(installed);
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
    if (isStandalone || isPWAInstalled) {
      setInstallationType("none");
      return;
    }

    switch (true) {
      case isMobile && isIOS:
        setInstallationType("manual");
        break;
      case isMobile && isInstallable:
        setInstallationType("prompt");
        break;
      case isMobile:
        setInstallationType("manual");
        break;
      default:
        setInstallationType("desktop");
        break;
    }
  }, [isMobile, isIOS, isInstallable, isStandalone, isPWAInstalled]);

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
