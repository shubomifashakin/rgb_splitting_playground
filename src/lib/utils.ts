import { twMerge } from "tailwind-merge";
import { clsx, type ClassValue } from "clsx";

import { NormalizedChannels } from "@/types/channels";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const CHANNEL_MAP: Record<
  string,
  (typeof NormalizedChannels)[keyof typeof NormalizedChannels]
> = {
  r: NormalizedChannels.RED,
  g: NormalizedChannels.GREEN,
  b: NormalizedChannels.BLUE,
  rg: NormalizedChannels.REDGREEN,
  gr: NormalizedChannels.REDGREEN,
  rb: NormalizedChannels.REDBLUE,
  br: NormalizedChannels.REDBLUE,
  gb: NormalizedChannels.GREENBLUE,
  bg: NormalizedChannels.GREENBLUE,
  rgb: NormalizedChannels.REDGREENBLUE,
  rbg: NormalizedChannels.REDGREENBLUE,
  grb: NormalizedChannels.REDGREENBLUE,
  gbr: NormalizedChannels.REDGREENBLUE,
  brg: NormalizedChannels.REDGREENBLUE,
  bgr: NormalizedChannels.REDGREENBLUE,
};

export function normalizeChannel(input: string | string[]) {
  const process = (
    str: string
  ): (typeof NormalizedChannels)[keyof typeof NormalizedChannels] => {
    //get the string they passed
    //find the key in the channel map
    //return the value
    const foundNormalization = CHANNEL_MAP[str];

    if (!foundNormalization) {
      throw new Error(`Invalid channel value: ${str}`);
    }

    return foundNormalization;
  };

  return Array.isArray(input)
    ? input.map(process)
    : [process(input), process(input), process(input)];
}
