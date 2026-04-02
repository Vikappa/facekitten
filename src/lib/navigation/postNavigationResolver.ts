const INTERNAL_BASE_URL = "https://facekitten.local";

export type ResolvedPostNavigationTarget = {
    href: string;
    postId: string;
    commentId: string | null;
    replyId: string | null;
};

function normalizeNonEmptyString(value: string | null | undefined): string | null {
    if (!value) {
        return null;
    }

    const normalized = value.trim();
    return normalized.length > 0 ? normalized : null;
}

function decodePathSegment(value: string): string {
    try {
        return decodeURIComponent(value);
    } catch {
        return value;
    }
}

function toRelativeInternalHref(rawNavigation: string): string {
    const normalizedNavigation = rawNavigation.trim();
    if (normalizedNavigation.length === 0) {
        return "";
    }

    try {
        const url = new URL(normalizedNavigation, INTERNAL_BASE_URL);
        return `${url.pathname}${url.search}${url.hash}`;
    } catch {
        return normalizedNavigation;
    }
}

export function resolvePostNavigationTarget(
    rawNavigation: string
): ResolvedPostNavigationTarget | null {
    const normalizedNavigation = rawNavigation.trim();
    if (normalizedNavigation.length === 0) {
        return null;
    }

    let url: URL;
    try {
        url = new URL(normalizedNavigation, INTERNAL_BASE_URL);
    } catch {
        return null;
    }

    const pathSegments = url.pathname
        .split("/")
        .filter((segment) => segment.length > 0)
        .map((segment) => decodePathSegment(segment));

    const postSegmentIndex = pathSegments.findIndex(
        (segment) => segment === "post" || segment === "posts"
    );

    let postId = normalizeNonEmptyString(url.searchParams.get("postId"));
    if (!postId && postSegmentIndex >= 0) {
        postId = normalizeNonEmptyString(pathSegments[postSegmentIndex + 1]);
    }

    if (!postId) {
        return null;
    }

    const commentId = normalizeNonEmptyString(url.searchParams.get("commentId"));
    const replyId = normalizeNonEmptyString(
        url.searchParams.get("replyId") ?? url.searchParams.get("commentReplyId")
    );

    const canonicalParams = new URLSearchParams();
    if (commentId) {
        canonicalParams.set("commentId", commentId);
    }
    if (replyId) {
        canonicalParams.set("replyId", replyId);
    }

    const encodedPostId = encodeURIComponent(postId);
    const canonicalSearch = canonicalParams.toString();
    const href =
        canonicalSearch.length > 0
            ? `/post/${encodedPostId}?${canonicalSearch}`
            : `/post/${encodedPostId}`;

    return {
        href,
        postId,
        commentId,
        replyId,
    };
}

export function normalizeNavigationHref(rawNavigation: string): string {
    const resolvedPostNavigation = resolvePostNavigationTarget(rawNavigation);
    if (resolvedPostNavigation) {
        return resolvedPostNavigation.href;
    }

    return toRelativeInternalHref(rawNavigation);
}

