'use client'

import { ReactionType } from "@/lib/interfaces/CommonInterfaces";
import Image from "next/image";
import { useEffect } from "react";

export type ReactionIconMetadata = {
    type: ReactionType;
    label: string;
    alt: string;
    src: string;
};

const REACTION_ICON_MAP: Record<ReactionType, Omit<ReactionIconMetadata, "type">> = {
    [ReactionType.like]: {
        label: "Mi piace",
        alt: "Mi piace",
        src: "/assets/reactionsIcons/0.png",
    },
    [ReactionType.love]: {
        label: "Love",
        alt: "Love",
        src: "/assets/reactionsIcons/1.png",
    },
    [ReactionType.care]: {
        label: "Abbraccio",
        alt: "Abbraccio",
        src: "/assets/reactionsIcons/2.png",
    },
    [ReactionType.laugh]: {
        label: "Haha",
        alt: "Haha",
        src: "/assets/reactionsIcons/3.png",
    },
    [ReactionType.wow]: {
        label: "Wow",
        alt: "Wow",
        src: "/assets/reactionsIcons/4.png",
    },
    [ReactionType.sad]: {
        label: "Triste",
        alt: "Triste",
        src: "/assets/reactionsIcons/5.png",
    },
    [ReactionType.angry]: {
        label: "Arrabbiato",
        alt: "Arrabbiato",
        src: "/assets/reactionsIcons/6.png",
    },
    [ReactionType.gay]: {
        label: "Gay",
        alt: "Gay",
        src: "/assets/reactionsIcons/7.png",
    },
    [ReactionType.flower]: {
        label: "Flower",
        alt: "Flower",
        src: "/assets/reactionsIcons/8.png",
    },
    [ReactionType.boom]: {
        label: "Boom",
        alt: "Boom",
        src: "/assets/reactionsIcons/9.png",
    },
};

export const REACTION_PICKER_ORDER = [
    ReactionType.like,
    ReactionType.love,
    ReactionType.care,
    ReactionType.laugh,
    ReactionType.wow,
    ReactionType.sad,
    ReactionType.angry,
    ReactionType.gay,
    ReactionType.flower,
    ReactionType.boom,
] as const satisfies readonly ReactionType[];

export const REACTION_PICKER_ITEMS: readonly ReactionIconMetadata[] = REACTION_PICKER_ORDER.map((type) => ({
    type,
    ...REACTION_ICON_MAP[type],
}));

const inMemoryImageCache = new Map<string, HTMLImageElement>();
let hasPreloadedReactionIcons = false;

export function preloadReactionIcons(): void {
    if (typeof window === "undefined" || hasPreloadedReactionIcons) {
        return;
    }

    hasPreloadedReactionIcons = true;

    REACTION_PICKER_ITEMS.forEach((icon) => {
        const image = new window.Image();
        image.src = icon.src;
        inMemoryImageCache.set(icon.src, image);
    });
}

export function useReactionIconsPreload(): void {
    useEffect(() => {
        preloadReactionIcons();
    }, []);
}

export function getReactionIconMetadata(reactionType: ReactionType): ReactionIconMetadata {
    return {
        type: reactionType,
        ...REACTION_ICON_MAP[reactionType],
    };
}

export function getReactionLabel(reactionType: ReactionType): string {
    return REACTION_ICON_MAP[reactionType].label;
}

interface ReactionIconProps {
    reactionType: ReactionType;
    size?: number;
    className?: string;
}

export default function ReactionIcon({ reactionType, size = 20, className }: ReactionIconProps) {
    useReactionIconsPreload();
    const iconMetadata = getReactionIconMetadata(reactionType);
    return (
        <Image
            src={iconMetadata.src}
            alt={iconMetadata.alt}
            width={size}
            height={size}
            className={className}
            draggable={false}
        />
    );
}
