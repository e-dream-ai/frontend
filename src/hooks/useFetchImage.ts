import { useEffect, useState } from "react";

type UseFetchImageProps = {
  url?: string;
};

export const useFetchImage = ({ url }: UseFetchImageProps) => {
  const [imageSrc, setImageSrc] = useState<string>();

  const fetchImage = async (url?: string) => {
    if (!url) {
      return;
    }

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Access-Control-Allow-Methods": "GET",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
          "Cache-Control": "max-age=604800",
          Age: "10",
        },
      });
      console.log(response);
      if (!response.ok) {
        setImageSrc(undefined);
        return;
      }
      const imageBlob = await response.blob();
      const imageObjectURL = URL.createObjectURL(imageBlob);
      setImageSrc(imageObjectURL);
    } catch (error) {
      console.error("Error fetching image:", error);
    }
  };

  useEffect(() => {
    fetchImage(url);
  }, [url]);

  return {
    src: imageSrc,
  };
};

export default useFetchImage;
