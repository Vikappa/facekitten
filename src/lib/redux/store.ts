import { configureStore } from "@reduxjs/toolkit";
import profileReducer, {
    initialProfileState,
    type ProfileState,
    type UserProfile,
} from "./profileSlice";
import homepagePostsReducer, {
    type HomepagePostsState,
} from "./homepagePostsSlice";
import notificationsReducer from "./notificationsSlice";
import uiReducer from "./uiSlice";
import { type CommentData, type PostData, type ReactionData, ReactionType } from "@/lib/interfaces/CommonInterfaces";

const PROFILE_STORAGE_KEY = "fk_profile_state";
const HOMEPAGE_POSTS_STORAGE_KEY = "fk_homepage_posts_state";
export const LETTINO_OPTIONS = new Set<NonNullable<UserProfile["tipoCuccia"]>>([
    "Cuccia",
    "Scatola",
    "Cassetto dei calzini (scassinato)",
    "Strada",
    "Letto di umano (ospite)",
    "Letto di umano (espropriato)",
    "Divano",
    "Sedia",
    "Poltrona",
]);
const REACTION_TYPE_OPTIONS = new Set<number>([
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
]);

function isLettino(value: unknown): value is NonNullable<UserProfile["tipoCuccia"]> {
    return typeof value === "string" && LETTINO_OPTIONS.has(value as NonNullable<UserProfile["tipoCuccia"]>);
}

function isReactionType(value: unknown): value is ReactionType {
    return typeof value === "number" && REACTION_TYPE_OPTIONS.has(value);
}

function normalizeCommentData(value: unknown): CommentData | null {
    if (typeof value !== "object" || value === null) {
        return null;
    }

    const comment = value as Record<string, unknown>;
    if (
        typeof comment.authorId !== "string" ||
        typeof comment.authorName !== "string" ||
        typeof comment.commentedAt !== "string" ||
        typeof comment.reactions !== "string" ||
        typeof comment.reactionNumbers !== "number"
    ) {
        return null;
    }

    return {
        authorId: comment.authorId,
        authorName: comment.authorName,
        commentedAt: comment.commentedAt,
        reactions: comment.reactions,
        reactionNumbers: comment.reactionNumbers,
    };
}

function normalizeReactionData(value: unknown): ReactionData | null {
    if (typeof value !== "object" || value === null) {
        return null;
    }

    const reaction = value as Record<string, unknown>;
    if (
        typeof reaction.reactionId !== "string" ||
        typeof reaction.author !== "string" ||
        !isReactionType(reaction.reactionType)
    ) {
        return null;
    }

    return {
        reactionId: reaction.reactionId,
        reactionType: reaction.reactionType,
        author: reaction.author,
    };
}

function normalizePostData(value: unknown): PostData | null {
    if (typeof value !== "object" || value === null) {
        return null;
    }

    const post = value as Record<string, unknown>;
    if (
        typeof post.postId !== "string" ||
        typeof post.postType !== "string" ||
        typeof post.text !== "string" ||
        typeof post.authorId !== "string" ||
        typeof post.authorName !== "string" ||
        typeof post.postedAt !== "string" ||
        !Array.isArray(post.comments) ||
        !Array.isArray(post.reactions) ||
        typeof post.commentNumber !== "number" ||
        typeof post.reactionsNumber !== "number"
    ) {
        return null;
    }

    const normalizedComments = post.comments
        .map((comment) => normalizeCommentData(comment))
        .filter((comment): comment is CommentData => comment !== null);
    if (normalizedComments.length !== post.comments.length) {
        return null;
    }

    const normalizedReactions = post.reactions
        .map((reaction) => normalizeReactionData(reaction))
        .filter((reaction): reaction is ReactionData => reaction !== null);
    if (normalizedReactions.length !== post.reactions.length) {
        return null;
    }

    const sharePostId =
        typeof post.shares === "object" &&
        post.shares !== null &&
        typeof (post.shares as Record<string, unknown>).sharePostId === "number"
            ? (post.shares as Record<string, number>).sharePostId
            : null;
    if (sharePostId === null) {
        return null;
    }

    return {
        postId: post.postId,
        postType: post.postType as PostData["postType"],
        text: post.text,
        imageUrl: typeof post.imageUrl === "string" ? post.imageUrl : undefined,
        authorId: post.authorId,
        authorName: post.authorName,
        postImageUrl: typeof post.postImageUrl === "string" ? post.postImageUrl : undefined,
        postedAt: post.postedAt,
        comments: normalizedComments,
        commentNumber: post.commentNumber,
        reactions: normalizedReactions,
        reactionsNumber: post.reactionsNumber,
        shares: { sharePostId },
    };
}

function normalizeUserProfile(value: unknown): UserProfile | null {
    if (typeof value !== "object" || value === null) {
        return null;
    }

    const profile = value as Record<string, unknown>;
    const { id, email, username, avatarUrl, bannerUrl, bio, confirmedAccount } = profile;
    if (
        typeof id !== "string" ||
        typeof email !== "string" ||
        typeof username !== "string" ||
        typeof avatarUrl !== "string" ||
        typeof bannerUrl !== "string" ||
        typeof bio !== "string" ||
        typeof confirmedAccount !== "boolean"
    ) {
        return null;
    }

    const tipoCucciaRaw = profile.tipoCuccia;
    const tipoCuccia =
        tipoCucciaRaw === null || isLettino(tipoCucciaRaw)
            ? tipoCucciaRaw
            : null;

    return {
        id,
        email,
        username,
        avatarUrl,
        bannerUrl,
        bio,
        confirmedAccount,
        dataDiNascita:
            typeof profile.dataDiNascita === "string" || profile.dataDiNascita === null
                ? profile.dataDiNascita
                : null,
        giocattoloPreferito:
            typeof profile.giocattoloPreferito === "string" ? profile.giocattoloPreferito : "",
        location: typeof profile.location === "string" ? profile.location : "",
        tipoCuccia,
    };
}

function normalizeTimestamp(value: unknown): number | null {
    if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
        return null;
    }

    return Math.trunc(value);
}

function loadPersistedProfileState(): ProfileState | undefined {
    if (typeof window === "undefined") {
        return undefined;
    }

    const serializedState = window.localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!serializedState) {
        return undefined;
    }

    try {
        const parsedState = JSON.parse(serializedState) as Partial<ProfileState>;

        if (parsedState.currentProfile === null) {
            return initialProfileState;
        }

        const normalizedProfile = normalizeUserProfile(parsedState.currentProfile);
        if (normalizedProfile) {
            return { currentProfile: normalizedProfile };
        }
    } catch {
        return undefined;
    }

    return undefined;
}

function loadPersistedHomepagePostsState(): HomepagePostsState | undefined {
    if (typeof window === "undefined") {
        return undefined;
    }

    const serializedState = window.localStorage.getItem(HOMEPAGE_POSTS_STORAGE_KEY);
    if (!serializedState) {
        return undefined;
    }

    try {
        const parsedState = JSON.parse(serializedState) as Partial<HomepagePostsState>;
        if (!Array.isArray(parsedState.posts)) {
            return undefined;
        }

        const normalizedPosts = parsedState.posts
            .map((post) => normalizePostData(post))
            .filter((post): post is PostData => post !== null);

        if (normalizedPosts.length !== parsedState.posts.length) {
            return undefined;
        }

        return {
            posts: normalizedPosts,
            lastUpdatedAt: normalizeTimestamp(parsedState.lastUpdatedAt),
        };
    } catch {
        return undefined;
    }
}

function savePersistedProfileState(profileState: ProfileState) {
    if (typeof window === "undefined") {
        return;
    }

    if (!profileState.currentProfile) {
        window.localStorage.removeItem(PROFILE_STORAGE_KEY);
        return;
    }

    window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profileState));
}

function savePersistedHomepagePostsState(homepagePostsState: HomepagePostsState) {
    if (typeof window === "undefined") {
        return;
    }

    if (homepagePostsState.posts.length === 0 && homepagePostsState.lastUpdatedAt === null) {
        window.localStorage.removeItem(HOMEPAGE_POSTS_STORAGE_KEY);
        return;
    }

    window.localStorage.setItem(HOMEPAGE_POSTS_STORAGE_KEY, JSON.stringify(homepagePostsState));
}

export const makeStore = () => {
    const store = configureStore({
        reducer: {
            ui: uiReducer,
            profile: profileReducer,
            homepagePosts: homepagePostsReducer,
            notifications: notificationsReducer,
        },
    });

    let previousProfile = store.getState().profile.currentProfile;
    let previousHomepagePostsState = store.getState().homepagePosts;

    store.subscribe(() => {
        const state = store.getState();
        const currentProfile = state.profile.currentProfile;
        if (currentProfile !== previousProfile) {
            previousProfile = currentProfile;
            savePersistedProfileState(state.profile);
        }

        if (state.homepagePosts !== previousHomepagePostsState) {
            previousHomepagePostsState = state.homepagePosts;
            savePersistedHomepagePostsState(state.homepagePosts);
        }
    });

    return store;
};

export { loadPersistedHomepagePostsState, loadPersistedProfileState };

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
