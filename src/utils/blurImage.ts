import { getPlaiceholder } from "plaiceholder";

// https://plaiceholder.co/docs/usage
// used for blur image preview, very extra feature
export const blurImage = async (src: string) => {
  try {
    const buffer = await fetch(src).then(async (res) =>
      Buffer.from(await res.arrayBuffer()),
    );

    const { base64 } = await getPlaiceholder(buffer);
    return base64;
  } catch (err) {
    console.log(err);
    return;
  }
};
