import { CommentReplyNotificationType, NotificationType, PostCommentNotificationType } from '@/app/utils/StorageDataTypes';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface NotificationSliceType {
    notifications: NotificationType[]
}

const initialState: NotificationSliceType = {
    notifications: []
};

const appStatusSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    initializeNotification: (state) => {
        state.notifications = []
    },
    setNotificationSeen: (state, action: PayloadAction<NotificationType>) => {
      const notification = state.notifications.find(notification => notification.id === action.payload.id);
      if (notification) {
        notification.seen = true;
      }
    },
    setAllNotificationsSeen: (state) => {
        state.notifications.forEach(notification => notification.seen = true);
    },
    createNotification: (state, action: PayloadAction<{ notificationTypeNumber: number, notificationBody: PostCommentNotificationType | CommentReplyNotificationType }>) => {
        const { notificationTypeNumber, notificationBody } = action.payload;
    
        let newNotification: NotificationType = {
            id: state.notifications.length + 1,
            type: notificationTypeNumber,
            seen: false,
            body: notificationBody
        };
    
        state.notifications.push(newNotification);
    },    
}
});

export const { initializeNotification, setNotificationSeen, setAllNotificationsSeen, createNotification } = appStatusSlice.actions;
export default appStatusSlice.reducer;
