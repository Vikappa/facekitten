'use client'

import { ReactionData, ReactionType } from "@/lib/interfaces/CommonInterfaces";
import { useCallback, useEffect, useRef, useState } from "react";
import ReactionIcon, { useReactionIconsPreload } from "./ReactionIcon";
import ReactionInputModal from "../modals/ReactionInputModal";

export interface InputTemplateType {
    type: "post" | "comment" | "commentReply" | "other"
}

interface ReactInputProps {
    InputTemplateType: InputTemplateType;
    ReactionData: ReactionData | undefined;
    value?: ReactionType;
    targetId?: string;
    className: string;
    text: string;
    placeholer: string;
}

type UseLongPressOptions = {
    delay?: number;
    onLongPress: () => void;
    onClick?: () => void;
};

type ReactionTargetType = NonNullable<ReactionData["targetType"]>;

export function useLongPress({
    delay = 500,
    onLongPress,
    onClick,
}: UseLongPressOptions) {
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const longPressTriggeredRef = useRef(false);

    const onPointerDown = useCallback((e: React.PointerEvent) => {
        if (e.pointerType === "mouse" && e.button !== 0) {
            return;
        }

        longPressTriggeredRef.current = false;

        timerRef.current = setTimeout(() => {
            longPressTriggeredRef.current = true;
            onLongPress();
        }, delay);
    }, [delay, onLongPress]);

    const clear = useCallback((triggerClick: boolean) => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }

        if (triggerClick && !longPressTriggeredRef.current) {
            onClick?.();
        }
    }, [onClick]);

    return {
        onPointerDown,
        onPointerUp: () => clear(true),
        onPointerLeave: () => clear(false),
        onPointerCancel: () => clear(false),
        onContextMenu: (e: React.MouseEvent) => e.preventDefault(),
    };
}

function resolveReactionRequestUrl(inputTemplateType: InputTemplateType): string {
    if (inputTemplateType.type === "post") {
        return "/api/v1/post/react";
    }

    if (inputTemplateType.type === "comment") {
        return "/api/v1/post/comment/react";
    }

    if (inputTemplateType.type === "commentReply") {
        return "/api/v1/post/comment/reply/react";
    }

    return "/api/other";
}

function mapInputTemplateToTargetType(inputTemplateType: InputTemplateType): ReactionTargetType | undefined {
    if (inputTemplateType.type === "post") {
        return "post";
    }

    if (inputTemplateType.type === "comment") {
        return "comment";
    }

    if (inputTemplateType.type === "commentReply") {
        return "commentReply";
    }

    return undefined;
}

function buildOptimisticReactionData(
    previousReaction: ReactionData | undefined,
    reactionType: ReactionType,
    options?: {
        targetType?: ReactionTargetType;
        targetId?: string;
    }
): ReactionData {
    return {
        reactionId: previousReaction?.reactionId ?? `temp-reaction-${Date.now()}`,
        reactionType,
        author: previousReaction?.author ?? "",
        authorId: previousReaction?.authorId,
        authorAvatarUrl: previousReaction?.authorAvatarUrl,
        authorProfile: previousReaction?.authorProfile,
        createdAt: previousReaction?.createdAt ?? new Date().toISOString(),
        targetType: previousReaction?.targetType ?? options?.targetType,
        targetId: previousReaction?.targetId ?? options?.targetId,
    };
}

async function sendReactionRequest(params: {
    inputTemplateType: InputTemplateType;
    currentReaction: ReactionData | undefined;
    nextReactionType: ReactionType;
    shouldDelete: boolean;
    fallbackTargetId?: string;
    fallbackTargetType?: ReactionTargetType;
}) {
    const requestUrlBase = resolveReactionRequestUrl(params.inputTemplateType);

    const payloadReactionData = buildOptimisticReactionData(
        params.currentReaction,
        params.nextReactionType,
        {
            targetId: params.fallbackTargetId,
            targetType: params.fallbackTargetType,
        }
    );

    try {
        if (params.inputTemplateType.type === "comment") {
            const commentId = payloadReactionData.targetId ?? params.fallbackTargetId;
            if (!commentId) {
                console.error("commentId mancante per aggiornare la reaction del commento");
                return;
            }

            const response = await fetch(requestUrlBase, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    commentId,
                    reactionType: params.nextReactionType,
                    reactionData: payloadReactionData,
                }),
            });

            if (!response.ok) {
                console.error("Errore API reaction commento:", response.status);
            }
            return;
        }

        if (params.inputTemplateType.type === "commentReply") {
            const commentReplyId = payloadReactionData.targetId ?? params.fallbackTargetId;
            if (!commentReplyId) {
                console.error("commentReplyId mancante per aggiornare la reaction della reply");
                return;
            }

            const response = await fetch(requestUrlBase, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    commentReplyId,
                    reactionType: params.nextReactionType,
                    reactionData: payloadReactionData,
                }),
            });

            if (!response.ok) {
                console.error("Errore API reaction reply:", response.status);
            }
            return;
        }

        const requestUrl = params.shouldDelete ? `${requestUrlBase}/delete` : requestUrlBase;
        const response = await fetch(requestUrl, {
            method: params.shouldDelete ? "DELETE" : "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                reactionData: payloadReactionData,
                reactionType: params.nextReactionType,
            }),
        });

        if (!response.ok) {
            console.error("Errore API reaction:", response.status);
        }
    } catch (error) {
        console.error("Errore aggiornamento reaction:", error);
    }
}

export interface ReactionDataRequestBody {
    reactionData: ReactionData
}

export default function ReactInput({
    ReactionData,
    text,
    className,
    placeholer,
    InputTemplateType,
    value,
    targetId,
}: ReactInputProps) {
    useReactionIconsPreload();

    const fallbackTargetType = mapInputTemplateToTargetType(InputTemplateType);

    const [inputState, setInputState] = useState<ReactionData | undefined>(() => {
        if (ReactionData) {
            return ReactionData;
        }

        if (value !== undefined) {
            return buildOptimisticReactionData(undefined, value, {
                targetId,
                targetType: fallbackTargetType,
            });
        }

        return undefined;
    });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const inputRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (ReactionData) {
            setInputState(ReactionData);
            return;
        }

        if (value !== undefined) {
            setInputState(buildOptimisticReactionData(undefined, value, {
                targetId,
                targetType: fallbackTargetType,
            }));
            return;
        }

        setInputState(undefined);
    }, [ReactionData, fallbackTargetType, targetId, value]);

    const handleShortClick = useCallback(() => {
        setIsModalOpen(false);

        if (inputState) {
            const currentReactionType = inputState.reactionType;
            setInputState(undefined);

            void sendReactionRequest({
                inputTemplateType: InputTemplateType,
                currentReaction: inputState,
                nextReactionType: currentReactionType,
                shouldDelete: true,
                fallbackTargetId: targetId,
                fallbackTargetType,
            });

            return;
        }

        const defaultReaction = value ?? ReactionType.like;
        const nextReactionData = buildOptimisticReactionData(ReactionData, defaultReaction, {
            targetId,
            targetType: fallbackTargetType,
        });
        setInputState(nextReactionData);

        void sendReactionRequest({
            inputTemplateType: InputTemplateType,
            currentReaction: ReactionData,
            nextReactionType: defaultReaction,
            shouldDelete: false,
            fallbackTargetId: targetId,
            fallbackTargetType,
        });
    }, [InputTemplateType, ReactionData, fallbackTargetType, inputState, targetId, value]);

    const handleLongPress = useCallback(() => {
        setIsModalOpen(true);
    }, []);

    const longPressHandlers = useLongPress({
        delay: 600,
        onLongPress: handleLongPress,
        onClick: handleShortClick,
    });

    const handleReactionSelect = useCallback((reactionType: ReactionType) => {
        const currentReactionType = inputState?.reactionType;

        if (currentReactionType === reactionType) {
            setIsModalOpen(false);
            return;
        }

        const nextReactionData = buildOptimisticReactionData(inputState ?? ReactionData, reactionType, {
            targetId,
            targetType: fallbackTargetType,
        });
        setInputState(nextReactionData);
        setIsModalOpen(false);

        void sendReactionRequest({
            inputTemplateType: InputTemplateType,
            currentReaction: inputState ?? ReactionData,
            nextReactionType: reactionType,
            shouldDelete: false,
            fallbackTargetId: targetId,
            fallbackTargetType,
        });
    }, [InputTemplateType, ReactionData, fallbackTargetType, inputState, targetId]);

    const handleKeyboardClick = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
        if (event.detail === 0) {
            handleShortClick();
        }
    }, [handleShortClick]);

    const selectedReactionType = inputState?.reactionType;
    const defaultText = (text || placeholer || "Mi piace").trim();
    const interactionStateClassName = selectedReactionType === undefined
        ? "text-gray-500 hover:text-blue-600"
        : "text-blue-600";

    return (
        <div className="relative inline-flex me-3">
            <button
                type="button"
                className={`inline-flex items-center bg-transparent border-0 p-0 text-left focus:outline-none ${className} ${interactionStateClassName}`}
                ref={inputRef}
                onClick={handleKeyboardClick}
                onKeyDown={(event) => {
                    if (event.key === "ArrowDown") {
                        event.preventDefault();
                        setIsModalOpen(true);
                    }
                }}
                aria-haspopup="dialog"
                aria-expanded={isModalOpen}
                {...longPressHandlers}
            >
                <span className="inline-flex items-center">
                    {selectedReactionType === undefined ? (
                        <span>{defaultText}</span>
                    ) : (
                        <ReactionIcon reactionType={selectedReactionType} size={18} />
                    )}
                </span>
            </button>

            <ReactionInputModal
                parentRef={inputRef}
                isOpen={isModalOpen}
                selectedReactionType={selectedReactionType}
                onSelectReaction={handleReactionSelect}
                onClose={() => setIsModalOpen(false)}
                
            />
        </div>
    );
}
