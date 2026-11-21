import api from "./api";

import API_ENDPOINTS from "./endpoints";

const getData = (response) => {
    return response?.data?.data ?? response?.data ?? response;
};

export const getMyNotifications = async (params = {}) => {
    const response = await api.get(API_ENDPOINTS.NOTIFICATIONS.BASE, {
        params,
    });

    return getData(response);
};

export const getUnreadCount = async () => {
    const response = await api.get(
        API_ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT
    );

    return getData(response);
};

export const markAsRead = async (notificationId) => {
    const response = await api.patch(
        API_ENDPOINTS.NOTIFICATIONS.READ(notificationId)
    );

    return getData(response);
};

export const markAllAsRead = async () => {
    const response = await api.patch(
        API_ENDPOINTS.NOTIFICATIONS.READ_ALL
    );

    return getData(response);
};

export const deleteNotification = async (notificationId) => {
    const response = await api.delete(
        API_ENDPOINTS.NOTIFICATIONS.DELETE(notificationId)
    );

    return getData(response);
};

export const clearAllNotifications = async () => {
    const response = await api.delete(
        API_ENDPOINTS.NOTIFICATIONS.CLEAR
    );

    return getData(response);
};
