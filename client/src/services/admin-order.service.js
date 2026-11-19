import api from "./api";
import API_ENDPOINTS from "./endpoints";

const unwrap = (response) => {
    return response?.data?.data ?? response?.data ?? response;
};


/*
|--------------------------------------------------------------------------
| Get All Orders
|--------------------------------------------------------------------------
*/

const getOrders = async (params = {}) => {

    const response = await api.get(
        API_ENDPOINTS.ADMIN_ORDERS.BASE,
        { params }
    );

    return unwrap(response);

};


/*
|--------------------------------------------------------------------------
| Get Order Details
|--------------------------------------------------------------------------
*/

const getOrderById = async (orderId) => {

    const response = await api.get(
        API_ENDPOINTS.ADMIN_ORDERS.DETAILS(orderId)
    );

    return unwrap(response);

};


/*
|--------------------------------------------------------------------------
| Shipping Methods
|--------------------------------------------------------------------------
*/

const getShippingMethods = async () => {

    const response = await api.get(
        API_ENDPOINTS.SHIPPING.METHODS
    );

    return unwrap(response);

};


/*
|--------------------------------------------------------------------------
| Create Shipment
|--------------------------------------------------------------------------
*/

const createShipment = async (data) => {

    const response = await api.post(
        API_ENDPOINTS.SHIPPING.ADMIN_SHIPMENTS,
        data
    );

    return unwrap(response);

};


/*
|--------------------------------------------------------------------------
| Update Shipment Status
|--------------------------------------------------------------------------
*/

const updateShipmentStatus = async (
    shipmentId,
    data
) => {

    const response = await api.patch(
        API_ENDPOINTS.SHIPPING.UPDATE_SHIPMENT(shipmentId),
        data
    );

    return unwrap(response);

};


/*
|--------------------------------------------------------------------------
| Get Shipment Tracking
|--------------------------------------------------------------------------
*/

const getShipmentTracking = async (shipmentId) => {

    const response = await api.get(
        API_ENDPOINTS.SHIPPING.TRACKING(shipmentId)
    );

    return unwrap(response);

};


const adminOrderService = {
    getOrders,
    getOrderById,
    getShippingMethods,
    createShipment,
    updateShipmentStatus,
    getShipmentTracking
};

export default adminOrderService;