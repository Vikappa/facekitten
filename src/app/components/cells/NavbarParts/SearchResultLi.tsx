import Image from "next/image";
import Link from "next/link";

export interface SearchResultProfile {
    id: string;
    avatarUrl: string | null;
    username: string | null;
}

interface SearchResultLiProps {
    data: SearchResultProfile;
    onSelect?: () => void;
}

export function SearchResultLi({ data, onSelect }: SearchResultLiProps) {
    const username = data.username?.trim() || "Profilo senza nome";
    const avatarUrl = data.avatarUrl?.trim() || "/assets/blankprofile.png";

    return (
        <li>
            <Link
                href={`/profile/${encodeURIComponent(data.id)}`}
                onClick={onSelect}
                className="flex min-w-0 items-center gap-3 px-3 py-2 transition-colors hover:bg-tertiary focus-visible:bg-tertiary focus-visible:outline-none"
            >
                <span className="relative block h-9 w-9 shrink-0 overflow-hidden rounded-full bg-tertiary">
                    <Image
                        src={avatarUrl}
                        alt={`Immagine profilo di ${username}`}
                        fill
                        sizes="36px"
                        className="object-cover"
                    />
                </span>
                <span className="min-w-0 truncate text-sm font-semibold text-dark-400">
                    {username}
                </span>
            </Link>
        </li>
    );
}
