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

let globalInstallPrompt: BeforeInstallPromptEvent | undefined;

// Set up global listener once
if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e: Event) => {
    e.preventDefault();
    globalInstallPrompt = e as BeforeInstallPromptEvent;
  });
}

export const usePWAInstall = () => {
  const [installPrompt, setInstallPrompt] = useState<Event | undefined>(
    globalInstallPrompt,
  );
  const [isInstallable, setIsInstallable] = useState(!!globalInstallPrompt);
  const { isMobile, isIOS, isStandalone } = useUserAgent();
  const [installationType, setInstallationType] =
    useState<InstallationType>("none");

  useEffect(() => {
    if (globalInstallPrompt && !installPrompt) {
      setInstallPrompt(globalInstallPrompt);
      setIsInstallable(true);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      globalInstallPrompt = promptEvent;
      setInstallPrompt(promptEvent);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      globalInstallPrompt = undefined;
      setIsInstallable(false);
      setInstallPrompt(undefined);
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
  }, [installPrompt]);

  useEffect(() => {
    if (isStandalone) {
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
  }, [isMobile, isIOS, isInstallable, isStandalone]);

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
  };
};

export default usePWAInstall;
