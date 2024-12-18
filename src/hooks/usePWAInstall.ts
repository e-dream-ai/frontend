import { useEffect, useState } from "react";
import { toast } from "react-toastify";

type BeforeInstallPromptEvent = Event & {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
};

// custom hook for pwa installation
export const usePWAInstall = () => {
  const [installPrompt, setInstallPrompt] = useState<Event>();
  const [isInstallable, setIsInstallable] = useState(false);

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
  };
};

export default usePWAInstall;
