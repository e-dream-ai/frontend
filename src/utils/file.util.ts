export const bytesToMegabytes = (bytes: number) => {
  return bytes / 1024 / 1024;
};

export const bytesToGB = (bytes: number): number => {
  const bytesPerGB = 1024 ** 3; // 2^30 bytes
  return bytes / bytesPerGB;
};

export const GBToBytes = (gb: number): number => {
  const bytesPerGB = 1024 ** 3; // 2^30 bytes
  return gb * bytesPerGB;
};
