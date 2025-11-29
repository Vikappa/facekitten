import Image, { StaticImageData } from "next/image";

import likePng   from "@/../public/assets/reactionsIcons/0.png";
import lovePng   from "@/../public/assets/reactionsIcons/1.png";
import carePng   from "@/../public/assets/reactionsIcons/2.png";
import laughPng  from "@/../public/assets/reactionsIcons/3.png";
import wowPng    from "@/../public/assets/reactionsIcons/4.png";
import sadPng    from "@/../public/assets/reactionsIcons/5.png";
import angryPng  from "@/../public/assets/reactionsIcons/6.png";
import rainbowPng from "@/../public/assets/reactionsIcons/7.png";
import flowerPng  from "@/../public/assets/reactionsIcons/8.png";
import bombPng    from "@/../public/assets/reactionsIcons/9.png";
import { ReactionType } from "@/lib/Classes/Reaction/Reaction";

interface IReactionProp {
  type: ReactionType;
  size: number;
}

const reactionConfig: Record<
  ReactionType,
  { src: StaticImageData; alt: string }
> = {
  [ReactionType.like]:   { src: likePng, alt: "Like" },
  [ReactionType.love]:   { src: lovePng, alt: "Heart" },
  [ReactionType.care]:   { src: carePng, alt: "Hug" },
  [ReactionType.laugh]:  { src: laughPng, alt: "Laugh" },
  [ReactionType.wow]:    { src: wowPng, alt: "Wow" },
  [ReactionType.sad]:    { src: sadPng, alt: "Sad" },
  [ReactionType.angry]:  { src: angryPng, alt: "Angry" },
  [ReactionType.gay]:    { src: rainbowPng, alt: "Rainbow" },
  [ReactionType.flower]: { src: flowerPng, alt: "Flower" },
  [ReactionType.boom]:   { src: bombPng, alt: "Bomb" },
};

export function ReactionAtom({ type, size }: IReactionProp) {
  const cfg = reactionConfig[type];
  if (!cfg) return null;

  return (
    <Image
      src={cfg.src}
      alt={cfg.alt}
      width={cfg.src === likePng ? size*2/3 : size}
      height={cfg.src === likePng ? size*2/3 : size}
      loading="lazy"
      draggable={false}
    />
  );
}
