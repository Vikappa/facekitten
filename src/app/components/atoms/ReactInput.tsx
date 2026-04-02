'use client'

import { ReactionData, ReactionType } from "@/lib/interfaces/CommonInterfaces";
import {
    removeReactionFromHomepagePosts,
    upsertReactionInHomepagePosts,
} from "@/lib/redux/homepagePostsSlice";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
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
    onOptimisticReactionChange?: (payload: {
        previousReaction: ReactionData | undefined;
        nextReaction: ReactionData | undefined;
    }) => void;
    className: string;
    text: string;
    placeholer: string;
    customSize?: number;
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

function isReactionOwnedByProfile(
    reaction: ReactionData | undefined,
    profileId: string | undefined
): reaction is ReactionData {
    if (!reaction || !profileId) {
        return false;
    }

    return reaction.authorId === profileId;
}

async function sendReactionRequest(params: {
    inputTemplateType: InputTemplateType;
    currentReaction: ReactionData | undefined;
    nextReactionType: ReactionType;
    shouldDelete: boolean;
    fallbackTargetId?: string;
    fallbackTargetType?: ReactionTargetType;
}): Promise<boolean> {
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
        if (params.inputTemplateType.type === "post") {
            const postId = payloadReactionData.targetId ?? params.fallbackTargetId;
            if (!postId) {
                console.error("postId mancante per aggiornare la reaction del post");
                return false;
            }

            const response = await fetch(requestUrlBase, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    postId,
                    reactionType: params.nextReactionType,
                    reactionData: payloadReactionData,
                }),
            });

            if (!response.ok) {
                console.error("Errore API reaction post:", response.status);
                return false;
            }
            return true;
        }

        if (params.inputTemplateType.type === "comment") {
            const commentId = payloadReactionData.targetId ?? params.fallbackTargetId;
            if (!commentId) {
                console.error("commentId mancante per aggiornare la reaction del commento");
                return false;
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
                return false;
            }
            return true;
        }

        if (params.inputTemplateType.type === "commentReply") {
            const commentReplyId = payloadReactionData.targetId ?? params.fallbackTargetId;
            if (!commentReplyId) {
                console.error("commentReplyId mancante per aggiornare la reaction della reply");
                return false;
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
                return false;
            }
            return true;
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
            return false;
        }

        return true;
    } catch (error) {
        console.error("Errore aggiornamento reaction:", error);
        return false;
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
    customSize,
    onOptimisticReactionChange,
}: ReactInputProps) {
    useReactionIconsPreload();
    const dispatch = useAppDispatch();
    const currentProfile = useAppSelector((state) => state.profile.currentProfile);
    const currentProfileId = currentProfile?.id;

    const fallbackTargetType = mapInputTemplateToTargetType(InputTemplateType);
    const ownedReactionData = isReactionOwnedByProfile(ReactionData, currentProfileId)
        ? ReactionData
        : undefined;

    const [inputState, setInputState] = useState<ReactionData | undefined>(() => {
        if (ownedReactionData) {
            return ownedReactionData;
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
        if (ownedReactionData) {
            setInputState(ownedReactionData);
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
    }, [ownedReactionData, fallbackTargetType, targetId, value]);

    const syncReactionInRedux = useCallback((payload: {
        previousReaction: ReactionData | undefined;
        nextReaction: ReactionData | undefined;
    }) => {
        const targetType = payload.nextReaction?.targetType
            ?? payload.previousReaction?.targetType
            ?? fallbackTargetType;
        const resolvedTargetId = payload.nextReaction?.targetId
            ?? payload.previousReaction?.targetId
            ?? targetId;

        if (
            !targetType ||
            typeof resolvedTargetId !== "string" ||
            resolvedTargetId.trim().length === 0
        ) {
            return;
        }

        if (payload.nextReaction) {
            const authorId = payload.nextReaction.authorId
                ?? payload.previousReaction?.authorId
                ?? currentProfile?.id;

            const reactionForStore: ReactionData = {
                ...payload.nextReaction,
                authorId: authorId && authorId.trim().length > 0 ? authorId : null,
                author:
                    payload.nextReaction.author.trim().length > 0
                        ? payload.nextReaction.author
                        : currentProfile?.username ?? payload.previousReaction?.author ?? "",
                authorAvatarUrl:
                    payload.nextReaction.authorAvatarUrl
                    ?? currentProfile?.avatarUrl
                    ?? payload.previousReaction?.authorAvatarUrl
                    ?? null,
                targetType,
                targetId: resolvedTargetId,
            };

            dispatch(
                upsertReactionInHomepagePosts({
                    targetType,
                    targetId: resolvedTargetId,
                    reaction: reactionForStore,
                })
            );
            return;
        }

        const authorId = payload.previousReaction?.authorId ?? currentProfile?.id;
        const reactionId = payload.previousReaction?.reactionId;
        if ((!authorId || authorId.trim().length === 0) && !reactionId) {
            return;
        }

        dispatch(
            removeReactionFromHomepagePosts({
                targetType,
                targetId: resolvedTargetId,
                authorId,
                reactionId,
            })
        );
    }, [currentProfile?.avatarUrl, currentProfile?.id, currentProfile?.username, dispatch, fallbackTargetType, targetId]);

    const handleShortClick = useCallback(() => {
        setIsModalOpen(false);

        if (inputState) {
            const currentReactionType = inputState.reactionType;
            const previousReaction = inputState;
            setInputState(undefined);
            onOptimisticReactionChange?.({
                previousReaction,
                nextReaction: undefined,
            });

            void (async () => {
                const hasSynced = await sendReactionRequest({
                    inputTemplateType: InputTemplateType,
                    currentReaction: inputState,
                    nextReactionType: currentReactionType,
                    shouldDelete: true,
                    fallbackTargetId: targetId,
                    fallbackTargetType,
                });

                if (hasSynced) {
                    syncReactionInRedux({
                        previousReaction,
                        nextReaction: undefined,
                    });
                    return;
                }

                setInputState(previousReaction);
                onOptimisticReactionChange?.({
                    previousReaction: undefined,
                    nextReaction: previousReaction,
                });
            })();

            return;
        }

        const defaultReaction = value ?? ReactionType.like;
        const nextReactionData = buildOptimisticReactionData(ownedReactionData, defaultReaction, {
            targetId,
            targetType: fallbackTargetType,
        });
        const previousReaction = inputState;
        setInputState(nextReactionData);
        onOptimisticReactionChange?.({
            previousReaction,
            nextReaction: nextReactionData,
        });

        void (async () => {
            const hasSynced = await sendReactionRequest({
                inputTemplateType: InputTemplateType,
                currentReaction: ownedReactionData,
                nextReactionType: defaultReaction,
                shouldDelete: false,
                fallbackTargetId: targetId,
                fallbackTargetType,
            });

            if (hasSynced) {
                syncReactionInRedux({
                    previousReaction,
                    nextReaction: nextReactionData,
                });
                return;
            }

            setInputState(previousReaction);
            onOptimisticReactionChange?.({
                previousReaction: nextReactionData,
                nextReaction: previousReaction,
            });
        })();
    }, [InputTemplateType, ownedReactionData, fallbackTargetType, inputState, onOptimisticReactionChange, syncReactionInRedux, targetId, value]);

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

        const previousReaction = inputState ?? ownedReactionData;
        const nextReactionData = buildOptimisticReactionData(inputState ?? ownedReactionData, reactionType, {
            targetId,
            targetType: fallbackTargetType,
        });
        setInputState(nextReactionData);
        setIsModalOpen(false);
        onOptimisticReactionChange?.({
            previousReaction,
            nextReaction: nextReactionData,
        });

        void (async () => {
            const hasSynced = await sendReactionRequest({
                inputTemplateType: InputTemplateType,
                currentReaction: inputState ?? ownedReactionData,
                nextReactionType: reactionType,
                shouldDelete: false,
                fallbackTargetId: targetId,
                fallbackTargetType,
            });

            if (hasSynced) {
                syncReactionInRedux({
                    previousReaction,
                    nextReaction: nextReactionData,
                });
                return;
            }

            setInputState(previousReaction);
            onOptimisticReactionChange?.({
                previousReaction: nextReactionData,
                nextReaction: previousReaction,
            });
        })();
    }, [InputTemplateType, ownedReactionData, fallbackTargetType, inputState, onOptimisticReactionChange, syncReactionInRedux, targetId]);

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
                        <ReactionIcon reactionType={selectedReactionType} size={customSize ?? 18} />
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
