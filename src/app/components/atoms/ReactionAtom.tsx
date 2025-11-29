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
  { src: StaticImageData; alt: string, mod:number }
> = {
  [ReactionType.like]:   { src: likePng, alt: "Like", mod:0.8 },
  [ReactionType.love]:   { src: lovePng, alt: "Heart", mod:0.9 },
  [ReactionType.care]:   { src: carePng, alt: "Hug", mod:0.9 },
  [ReactionType.laugh]:  { src: laughPng, alt: "Laugh", mod:1 },
  [ReactionType.wow]:    { src: wowPng, alt: "Wow", mod:0.95 },
  [ReactionType.sad]:    { src: sadPng, alt: "Sad", mod:0.9 },
  [ReactionType.angry]:  { src: angryPng, alt: "Angry", mod:1 },
  [ReactionType.gay]:    { src: rainbowPng, alt: "Rainbow", mod:1 },
  [ReactionType.flower]: { src: flowerPng, alt: "Flower", mod:1 },
  [ReactionType.boom]:   { src: bombPng, alt: "Bomb", mod:0.8 },
};

export function ReactionAtom({ type, size }: IReactionProp) {
  const cfg = reactionConfig[type];
  if (!cfg) return null;

  return (
    <Image
      src={cfg.src}
      alt={cfg.alt}
      width={size*cfg.mod}
      height={size*cfg.mod}
      loading="lazy"
      draggable={false}
      className="overflow-clip"
    />
  );
}
