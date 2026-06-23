import { ModelCatalogEntry, ModelPricing } from "@/types/model.types";
import { formatUsd } from "@/utils/credits.util";

export type CostParams = { durationSec?: number; imageSize?: string };

const parseMegapixels = (imageSize: string): number | null => {
  const match = imageSize.match(/^(\d+)\s*[*x]\s*(\d+)$/i);
  if (!match) return null;
  return (Number(match[1]) * Number(match[2])) / 1_000_000;
};

const priceFor = (pricing: ModelPricing, params: CostParams): number | null => {
  if (pricing.kind === "perSecond") {
    const duration = params.durationSec;
    if (
      typeof duration !== "number" ||
      !Number.isFinite(duration) ||
      duration <= 0
    ) {
      return null;
    }
    return (pricing.baseUsd ?? 0) + pricing.usdPerSecond * duration;
  }

  if (!params.imageSize) return null;
  const megapixels = parseMegapixels(params.imageSize);
  if (megapixels == null) return null;
  return pricing.usdPerMegapixel * megapixels;
};

export const estimateUnitCostUsd = (
  model: ModelCatalogEntry | undefined,
  params: CostParams,
): number | null => {
  if (!model?.pricing) return null;
  const cost = priceFor(model.pricing, params);
  if (cost == null || !Number.isFinite(cost) || cost < 0) return null;
  return cost;
};

export const formatCostUsd = (value: number): string => {
  if (value <= 0) return formatUsd(0);
  if (value >= 0.01) return formatUsd(value);
  return `$${value.toPrecision(2)}`;
};
