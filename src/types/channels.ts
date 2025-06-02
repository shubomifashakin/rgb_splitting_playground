export type Channel =
  | "r"
  | "g"
  | "b"
  | "rg"
  | "rb"
  | "gr"
  | "gb"
  | "br"
  | "bg"
  | "rgb"
  | "rbg"
  | "grb"
  | "gbr"
  | "brg"
  | "bgr";

export const NormalizedChannels = {
  RED: "RED",
  GREEN: "GREEN",
  BLUE: "BLUE",
  REDGREEN: "RED-GREEN",
  REDBLUE: "RED-BLUE",
  GREENBLUE: "GREEN-BLUE",
  REDGREENBLUE: "RED-GREEN-BLUE",
};

export type NormalizedChannelsType =
  (typeof NormalizedChannels)[keyof typeof NormalizedChannels];

export type ChannelFnType = {
  grain: number;
  imageData: ImageData;
};
