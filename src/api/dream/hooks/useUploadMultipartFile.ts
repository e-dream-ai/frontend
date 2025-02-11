import { useState } from "react";
import axios, { CancelTokenSource } from "axios";
import { MULTIPART_FILE_PART_SIZE } from "@/constants/modal.constants";
import { useMutation } from "@tanstack/react-query";

interface UploadFileParams {
  urls: string[];
  file: File;
}

interface Part {
  ETag: string;
  PartNumber: number;
}

export const useUploadMultipartFile = ({
  cancelTokenSource,
}: {
  cancelTokenSource: CancelTokenSource;
}) => {
  const [uploadProgress, setUploadProgress] = useState(0);

  const uploadPart = async (
    url: string,
    chunk: Blob,
    partNumber: number,
  ): Promise<Part> => {
    const response = await axios.put(url, chunk, {
      cancelToken: cancelTokenSource.token,
      headers: { "Content-Type": "application/octet-stream" },
    });

    return {
      ETag: response.headers.etag,
      PartNumber: partNumber,
    };
  };

  const mutation = useMutation({
    mutationFn: async ({ urls, file }: UploadFileParams) => {
      const chunks: Blob[] = [];
      let start = 0;

      while (start < file.size) {
        chunks.push(file.slice(start, start + MULTIPART_FILE_PART_SIZE));
        start += MULTIPART_FILE_PART_SIZE;
      }

      let completedChunks = 0;
      const uploadPromises = chunks.map((chunk, index) =>
        uploadPart(urls[index], chunk, index + 1).then((result) => {
          completedChunks++;
          setUploadProgress(
            Math.round((completedChunks / chunks.length) * 100),
          );
          return result;
        }),
      );

      return await Promise.all(uploadPromises);
    },
  });

  return {
    ...mutation,
    uploadProgress,
  };
};
