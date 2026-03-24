import { NotificationData } from "@/lib/interfaces/CommonInterfaces";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface NotificationsState {
    unreadNotifications: NotificationData[];
    lastUpdatedAt: number | null;
}

export const initialNotificationsState: NotificationsState = {
    unreadNotifications: [],
    lastUpdatedAt: null,
};

function sortNotificationsByRecency(notifications: NotificationData[]): NotificationData[] {
    return [...notifications].sort((a, b) => {
        const aTimestamp = Date.parse(a.createdAt);
        const bTimestamp = Date.parse(b.createdAt);
        const hasValidATimestamp = Number.isFinite(aTimestamp);
        const hasValidBTimestamp = Number.isFinite(bTimestamp);

        if (hasValidATimestamp && hasValidBTimestamp && aTimestamp !== bTimestamp) {
            return bTimestamp - aTimestamp;
        }

        return b.id - a.id;
    });
}

function mergeUniqueUnreadNotifications(
    baseNotifications: NotificationData[],
    incomingNotifications: NotificationData[]
): NotificationData[] {
    const byId = new Map<number, NotificationData>();

    for (const notification of [...baseNotifications, ...incomingNotifications]) {
        byId.set(notification.id, notification);
    }

    return sortNotificationsByRecency(Array.from(byId.values()));
}

const notificationsSlice = createSlice({
    name: "notifications",
    initialState: initialNotificationsState,
    reducers: {
        setUnreadNotifications(state, action: PayloadAction<NotificationData[]>) {
            state.unreadNotifications = mergeUniqueUnreadNotifications([], action.payload);
            state.lastUpdatedAt = Date.now();
        },
        mergeUnreadNotifications(state, action: PayloadAction<NotificationData[]>) {
            state.unreadNotifications = mergeUniqueUnreadNotifications(
                state.unreadNotifications,
                action.payload
            );
            state.lastUpdatedAt = Date.now();
        },
        removeUnreadNotificationById(state, action: PayloadAction<number>) {
            state.unreadNotifications = state.unreadNotifications.filter(
                (notification) => notification.id !== action.payload
            );
            state.lastUpdatedAt = Date.now();
        },
        clearUnreadNotifications(state) {
            state.unreadNotifications = [];
            state.lastUpdatedAt = null;
        },
    },
});

export const {
    setUnreadNotifications,
    mergeUnreadNotifications,
    removeUnreadNotificationById,
    clearUnreadNotifications,
} = notificationsSlice.actions;

export default notificationsSlice.reducer;
