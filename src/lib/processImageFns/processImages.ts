import { getRedChannel } from "./channelFns/getRedChannel";
import { getBlueChannel } from "./channelFns/getBlueChannel";
import { getGreenChannel } from "./channelFns/getGreenChannel";
import { getRedAndBlueChannels } from "./channelFns/getRedAndBlueChannels";
import { getRedAndGreenChannels } from "./channelFns/getRedAndGreenChannels";
import { getGreenAndBlueChannels } from "./channelFns/getGreenAndBlueChannels";
import { getRedGreenAndBlueChannels } from "./channelFns/getRedGreenAndBlueChannels";

import {
  NormalizedChannels,
  type NormalizedChannelsType,
} from "../../types/channels";

import { default_grain, default_normalized_channel } from "../constants";

const channelFns: Record<
  NormalizedChannelsType,
  (args: { imageData: ImageData; grain: number }) => ImageData
> = {
  [NormalizedChannels.RED]: getRedChannel,
  [NormalizedChannels.BLUE]: getBlueChannel,
  [NormalizedChannels.GREEN]: getGreenChannel,
  [NormalizedChannels.REDBLUE]: getRedAndBlueChannels,
  [NormalizedChannels.REDGREEN]: getRedAndGreenChannels,
  [NormalizedChannels.GREENBLUE]: getGreenAndBlueChannels,
  [NormalizedChannels.REDGREENBLUE]: getRedGreenAndBlueChannels,
};

export async function processImage({
  grains,
  channels,
  imageData,
}: {
  grains: number[];
  imageData: ImageData;
  channels: NormalizedChannelsType[];
}) {
  let processedImages: ImageData[] = [];
  const processedInfo: {
    grain: number;
    channel: NormalizedChannelsType;
  }[] = [];

  //if the channels and grains specified are qual, then process each channel with the corresponding grain at that index
  if (channels.length === grains.length) {
    processedImages = await Promise.all(
      channels
        .map((channel, index) => {
          const grain = grains[index];

          //skip any process that result in the same image uploaded
          if (isTheSameImage({ channel, grain })) {
            return;
          }

          processedInfo.push({
            grain,
            channel,
          });

          return channelFns[channel]({
            grain,
            imageData,
          });
        })
        .filter((image) => image !== undefined)
    );
  }

  //if they sent more channels than grains
  //use a grain value of 0 for the channels without a corresponding grain
  if (channels.length > grains.length) {
    processedImages = await Promise.all(
      channels
        .map((channel, index) => {
          const grain = grains[index] ?? 0;

          //skip any process that result in the same image uploaded
          if (isTheSameImage({ channel, grain })) {
            return;
          }

          processedInfo.push({
            grain,
            channel,
          });

          return channelFns[channel]({
            grain,
            imageData,
          });
        })
        .filter((image) => image !== undefined)
    );
  }

  //if they sent more grains than channels
  //skip all grains that do not have a corresponding channel
  if (grains.length > channels.length) {
    processedImages = await Promise.all(
      grains
        .map((grain, index) => {
          const channel = channels[index];

          //if a channel does not exist at the current index, skip
          if (!channel) {
            return;
          }

          //skip any process that result in the same image uploaded
          if (isTheSameImage({ channel, grain })) {
            return;
          }

          processedInfo.push({
            grain,
            channel,
          });

          return channelFns[channel]({
            grain,
            imageData,
          });
        })
        .filter((image) => image !== undefined)
    );
  }

  return { images: processedImages, processedInfo };
}

function isTheSameImage({
  channel,
  grain,
}: {
  channel: NormalizedChannelsType;
  grain: number;
}) {
  return channel === default_normalized_channel && grain === default_grain;
}
