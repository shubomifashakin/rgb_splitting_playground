import { grainEffect } from "@/lib/grainEffect";
import type { ChannelFnType } from "@/types/channels";

export function getBlueChannel({ imageData, grain }: ChannelFnType) {
  const { data, width, height } = imageData;

  const blueChannel = new ImageData(width, height);

  for (let i = 0; i < data.length; i += 4) {
    const blueValue = grainEffect(data[i + 2], grain);

    blueChannel.data[i] = 0;
    blueChannel.data[i + 1] = 0;
    blueChannel.data[i + 2] = blueValue;
    blueChannel.data[i + 3] = data[i + 3];
  }

  return blueChannel;
}
