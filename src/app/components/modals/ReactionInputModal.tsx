'use client'

import { ReactionType } from "@/lib/interfaces/CommonInterfaces";
import { useCallback, useEffect, useRef, useState } from "react";
import ReactionIcon, { REACTION_PICKER_ITEMS, useReactionIconsPreload } from "../atoms/ReactionIcon";

export interface ReactionInputModalProps {
    parentRef: React.RefObject<HTMLElement | null>;
    isOpen: boolean;
    selectedReactionType: ReactionType | undefined;
    onSelectReaction: (reactionType: ReactionType) => void;
    onClose: () => void;
}

interface ModalPosition {
    top: number;
    left: number;
}

const MODAL_MARGIN_PX = 8;

export default function ReactionInputModal({
    parentRef,
    isOpen,
    selectedReactionType,
    onSelectReaction,
    onClose,
}: ReactionInputModalProps) {
    useReactionIconsPreload();
    const modalRef = useRef<HTMLDivElement | null>(null);
    const [position, setPosition] = useState<ModalPosition>({ top: 0, left: 0 });
    const [isPositionReady, setIsPositionReady] = useState(false);

    const updatePosition = useCallback(() => {
        const parentElement = parentRef.current;

        if (!parentElement || typeof window === "undefined") {
            return;
        }

        const parentRect = parentElement.getBoundingClientRect();
        const modalWidth = modalRef.current?.offsetWidth ?? 320;

        const left = Math.min(
            Math.max(MODAL_MARGIN_PX, parentRect.left),
            Math.max(MODAL_MARGIN_PX, window.innerWidth - modalWidth - MODAL_MARGIN_PX)
        );

        setPosition({
            top: Math.max(MODAL_MARGIN_PX, parentRect.bottom + MODAL_MARGIN_PX),
            left,
        });
        setIsPositionReady(true);
    }, [parentRef]);

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        setIsPositionReady(false);
        const animationFrameId = window.requestAnimationFrame(updatePosition);

        window.addEventListener("resize", updatePosition);
        window.addEventListener("scroll", updatePosition, true);

        return () => {
            window.cancelAnimationFrame(animationFrameId);
            window.removeEventListener("resize", updatePosition);
            window.removeEventListener("scroll", updatePosition, true);
        };
    }, [isOpen, updatePosition]);

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const handlePointerDown = (event: MouseEvent | TouchEvent) => {
            const target = event.target as Node | null;
            if (!target) {
                return;
            }

            const clickedInsideModal = modalRef.current?.contains(target) ?? false;
            const clickedInsideParent = parentRef.current?.contains(target) ?? false;

            if (clickedInsideModal || clickedInsideParent) {
                return;
            }

            onClose();
        };

        document.addEventListener("mousedown", handlePointerDown);
        document.addEventListener("touchstart", handlePointerDown);

        return () => {
            document.removeEventListener("mousedown", handlePointerDown);
            document.removeEventListener("touchstart", handlePointerDown);
        };
    }, [isOpen, onClose, parentRef]);

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                onClose();
            }
        };

        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [isOpen, onClose]);

    if (!isOpen) {
        return null;
    }

    return (
        <div
            ref={modalRef}
            style={{
                top: `${position.top}px`,
                left: `${position.left}px`,
                opacity: isPositionReady ? 1 : 0,
            }}
            role="dialog"
            aria-label="Seleziona una reazione"
            className="fixed z-50 rounded-2xl border border-gray-100 bg-white p-2 shadow-lg transition-opacity duration-100"
        >
            <div className="grid grid-cols-5 gap-1.5">
                {REACTION_PICKER_ITEMS.map((icon) => {
                    const isSelected = selectedReactionType === icon.type;

                    return (
                        <button
                            key={icon.type}
                            type="button"
                            onClick={() => onSelectReaction(icon.type)}
                            aria-label={icon.label}
                            aria-pressed={isSelected}
                            className={`rounded-full p-1 transition-transform duration-150 ${
                                isSelected
                                    ? "bg-blue-50"
                                    : "hover:-translate-y-1 hover:bg-gray-100"
                            }`}
                        >
                            <ReactionIcon
                                reactionType={icon.type}
                                size={32}
                                className="pointer-events-none"
                            />
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
