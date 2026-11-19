import api from "./api";
import API_ENDPOINTS from "./endpoints";


const getData = (response) => {
    return response?.data?.data ?? response?.data ?? response;
};


/*
|--------------------------------------------------------------------------
| Get Admin Dashboard
|--------------------------------------------------------------------------
*/

export const getAdminDashboard = async () => {

    const response = await api.get(
        API_ENDPOINTS.ADMIN.DASHBOARD
    );

    return getData(response);

};