export const FRIENDSHIP_STATUS = {
  AMICO: "amico",
  NON_AMICO: "non amico",
  RICHIESTA_INVIATA: "richiesta inviata",
  RICHIESTA_RICEVUTA: "richiesta ricevuta",
} as const;

export type FriendshipStatus =
  (typeof FRIENDSHIP_STATUS)[keyof typeof FRIENDSHIP_STATUS];

export interface WithFriendshipStatus {
  friendshipStatus: FriendshipStatus;
}

const friendshipStatusValues = new Set<string>(Object.values(FRIENDSHIP_STATUS));

export function isFriendshipStatus(value: unknown): value is FriendshipStatus {
  return typeof value === "string" && friendshipStatusValues.has(value);
}
