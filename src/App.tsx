import { useEffect, useRef, useState } from "react";

import { SquareSplitHorizontal } from "lucide-react";

import { Label } from "./components/ui/label";
import { Input } from "./components/ui/input";
import { Button } from "./components/ui/button";
import { Checkbox } from "./components/ui/checkbox";

import type { Channel } from "./types/channels";

import { normalizeChannel } from "./lib/utils";
import { processImage } from "./lib/processImageFns/processImages";

const possibleLetters = ["r", "g", "b"];

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const timeOutId = useRef<NodeJS.Timeout | null>(null);

  const [imageSrc, setImageSrc] = useState<string>("");

  const [grains, setGrains] = useState<number>(0);
  const [channels, setChannels] = useState<Channel>("rgb");

  const [channelsArray, setChannelsArray] = useState<Channel[]>([]);
  const [grainsArray, setGrainsArray] = useState<number[]>([0, 0, 0]);

  const [isChannelArray, setIsChannelArray] = useState(true);
  const [isGrainArray, setIsGrainArray] = useState(true);

  const [processedImages, setProcessedImages] = useState<
    { url: string; label: string }[]
  >([]);

  function handleUploadImage() {
    fileRef.current?.click();
  }

  function handleSelectedImage(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const src = URL.createObjectURL(file);

    setImageSrc(src);
  }

  function hanldeDrawImage(event: React.SyntheticEvent<HTMLImageElement>) {
    const image = event.currentTarget;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const width = image.width;
    const height = image.height;

    canvas.width = width;
    canvas.height = height;

    ctx.drawImage(image, 0, 0, width, height);
  }

  function handleChannelChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = [...new Set(event.target.value.split(""))]
      .filter((char) => {
        return possibleLetters.includes(char);
      })
      .join("");

    setChannels(value as Channel);
  }

  function handleGrainChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;

    if (value === "") {
      setGrains(0);
      return;
    }

    const parsedValue = parseInt(value);

    if (isNaN(parsedValue)) return;

    if (typeof grains === "number" && parsedValue > 255) return;

    setGrains(parsedValue);
  }

  function handleChannelArrayChange(
    event: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) {
    const value = [...new Set(event.target.value.split(""))]
      .filter((char) => {
        return possibleLetters.includes(char);
      })
      .join("");

    if (!channelsArray[index] && value !== "") {
      const newChannelsArray = [...channelsArray];

      newChannelsArray.push(value as Channel);

      setChannelsArray(newChannelsArray);

      return;
    }

    if (channelsArray[index]) {
      const newChannelsArray = [...channelsArray];

      if (value === "") {
        const newChannelsArr = channelsArray.filter((_, i) => i !== index);

        setChannelsArray(newChannelsArr);

        return;
      }

      newChannelsArray[index] = value as Channel;

      setChannelsArray(newChannelsArray);
    }
  }

  function handleGrainArrayChange(
    event: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) {
    const value = event.target.value;

    if (isNaN(parseInt(value)) && value !== "") return;

    if (grainsArray[index] === undefined) {
      const newGrainsArray = [...grainsArray];

      newGrainsArray.push(Number(value));

      setGrainsArray(newGrainsArray);

      return;
    }

    if (value === "") {
      setGrainsArray((prev) => {
        const newGrainsArray = [...prev];
        newGrainsArray[index] = 0;
        return newGrainsArray;
      });

      return;
    }

    const parsedValue = parseInt(value);

    if (parsedValue > 255) return;

    if (grainsArray[index] !== undefined) {
      const newGrainsArray = [...grainsArray];

      newGrainsArray[index] = parsedValue;
      setGrainsArray(newGrainsArray);
    }
  }

  useEffect(
    function () {
      async function draw() {
        if (!imageSrc) return;

        setProcessedImages([]);

        const canvas = canvasRef.current;
        if (!canvas) return;

        let selectedGrains: number[], selectedChannels: string[];

        if (isGrainArray) {
          selectedGrains = grainsArray;
        } else {
          selectedGrains = [grains, grains, grains];
        }

        if (isChannelArray) {
          selectedChannels = normalizeChannel(channelsArray);
        } else {
          selectedChannels = normalizeChannel(channels);
        }

        const ctx = canvas.getContext("2d", { willReadFrequently: true });

        if (!ctx) return;

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        const { images, processedInfo } = await processImage({
          grains: selectedGrains,
          channels: selectedChannels,
          imageData,
        });

        for (let i = 0; i < images.length; i++) {
          const image = images[i];

          ctx.clearRect(0, 0, canvas.width, canvas.height);

          ctx.putImageData(image, 0, 0);

          const url = canvas.toDataURL("image/jpeg");

          setProcessedImages((prev) => {
            return [
              ...prev,
              {
                url,
                label: `${processedInfo[i].channel}-${processedInfo[i].grain}`,
              },
            ];
          });

          ctx.clearRect(0, 0, canvas.width, canvas.height);

          ctx.putImageData(imageData, 0, 0);
        }
      }

      clearTimeout(timeOutId.current ? timeOutId.current : undefined);

      timeOutId.current = setTimeout(() => {
        draw();
      }, 500);
    },
    [
      grains,
      imageSrc,
      channels,
      grainsArray,
      isGrainArray,
      channelsArray,
      isChannelArray,
    ]
  );

  return (
    <div className="flex items-center justify-center h-dvh w-full p-4 dark:bg-[#0a0a0a] bg-white">
      <div className="flex gap-x-8 items-center justify-center w-[1200px]">
        <div className="flex items-center flex-grow justify-center flex-col gap-y-4">
          <div className="space-y-2 rounded-sm overflow-hidden">
            <canvas ref={canvasRef} className="object-contain" hidden></canvas>

            {imageSrc && (
              <img
                src={imageSrc}
                alt="Original Image"
                title="Original Image"
                onLoad={hanldeDrawImage}
                className="w-full object-cover border max-w-[800px] max-h-[500px]"
              />
            )}
          </div>

          <div className="flex items-center rounded-sm p-2 justify-between h-[200px] w-full">
            {processedImages.map((image, index) => {
              return (
                <div
                  key={`${image.label}-${index}`}
                  className="h-full aspect-square rounded-sm overflow-hidden"
                >
                  <img
                    src={image.url}
                    alt={image.label}
                    title={image.label}
                    className="w-full h-full rounded-sm object-contain"
                  />
                </div>
              );
            })}
          </div>
        </div>

        <form className="w-[250px] space-y-5">
          <div className="space-y-2 w-full">
            <Label>Channels</Label>

            {!isChannelArray ? (
              <Input
                type="text"
                maxLength={3}
                value={channels}
                className="rounded-sm"
                onChange={(e) => handleChannelChange(e)}
              />
            ) : (
              <div className="flex gap-x-2.5">
                <Input
                  type="text"
                  maxLength={3}
                  className="rounded-sm"
                  value={channelsArray[0] || ""}
                  onChange={(e) => handleChannelArrayChange(e, 0)}
                />

                {channelsArray.length > 0 && (
                  <Input
                    type="text"
                    maxLength={3}
                    className="rounded-sm"
                    value={channelsArray[1] || ""}
                    onChange={(e) => handleChannelArrayChange(e, 1)}
                  />
                )}

                {channelsArray.length > 1 && (
                  <Input
                    type="text"
                    maxLength={3}
                    className="rounded-sm"
                    value={channelsArray[2] || ""}
                    onChange={(e) => handleChannelArrayChange(e, 2)}
                  />
                )}
              </div>
            )}
          </div>

          <div className="space-y-2 w-full">
            <Label>Grains</Label>

            {!isGrainArray ? (
              <Input
                min={0}
                max={255}
                type="number"
                className="rounded-sm"
                value={grains.toString()}
                onChange={handleGrainChange}
              />
            ) : (
              <div className="flex gap-x-2.5">
                <Input
                  type="number"
                  className="rounded-sm"
                  value={grainsArray[0]}
                  onChange={(e) => handleGrainArrayChange(e, 0)}
                  min={0}
                  max={255}
                />

                {grainsArray.length > 0 && (
                  <Input
                    type="number"
                    className="rounded-sm"
                    value={grainsArray[1]}
                    onChange={(e) => handleGrainArrayChange(e, 1)}
                    min={0}
                    max={255}
                  />
                )}

                {grainsArray.length > 1 && (
                  <Input
                    type="number"
                    className="rounded-sm"
                    value={grainsArray[2]}
                    onChange={(e) => handleGrainArrayChange(e, 2)}
                    min={0}
                    max={255}
                  />
                )}
              </div>
            )}
          </div>

          <div className="flex justify-between gap-y-4">
            <div className="flex items-center gap-x-1.5">
              <Checkbox
                checked={isChannelArray}
                onClick={() => setIsChannelArray(!isChannelArray)}
                className="cursor-pointer"
                id="isChannelArray"
              />

              <Label htmlFor="isChannelArray" className="text-sm">
                Channels Array
              </Label>
            </div>

            <div className="flex items-center gap-x-1.5">
              <Checkbox
                checked={isGrainArray}
                onClick={() => setIsGrainArray(!isGrainArray)}
                className="cursor-pointer"
                id="isGrainArray"
              />

              <Label htmlFor="isGrainArray" className="text-sm">
                Grain Array
              </Label>
            </div>
          </div>

          <div className="w-full">
            <input
              hidden
              type="file"
              ref={fileRef}
              onChange={handleSelectedImage}
              accept="image/png, image/jpeg, .png, .jpg, .jpeg"
            />
            <Button
              type="button"
              variant={"default"}
              onClick={handleUploadImage}
              className="rounded-sm w-full font-semibold cursor-pointer flex gap-x-2 items-center"
            >
              Upload Image
              <SquareSplitHorizontal size={26} />
            </Button>
          </div>

          <p className="text-xs text-center">
            <a
              href="https://documenter.getpostman.com/view/29426986/2sB2qgedtc" //TODO: CHANGE TO ACTUAL URL
              target="_blank"
              className="underline hover:text-muted-foreground transition-colors duration-150"
            >
              View Documentation
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}
