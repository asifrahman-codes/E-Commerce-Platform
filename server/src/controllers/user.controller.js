import {
    getAuthenticatedUser,
    updateMyProfileService,
    changeMyPasswordService,
    deactivateMyAccountService,
} from "../services/user.service.js";

export const getMyProfile = async (req, res, next) => {
    try {
        const user = await getAuthenticatedUser(req.user.user_id);

        return res.status(200).json({
            success: true,
            message: "Profile fetched successfully",
            data: user,
        });
    } catch (error) {
        next(error);
    }
};

export const updateMyProfile = async (req, res, next) => {
    try {
        const user = await updateMyProfileService(
            req.user.user_id,
            req.body
        );

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            data: user,
        });
    } catch (error) {
        next(error);
    }
};

export const changeMyPassword = async (req, res, next) => {
    try {
        await changeMyPasswordService(
            req.user.user_id,
            req.body
        );

        return res.status(200).json({
            success: true,
            message: "Password changed successfully",
        });
    } catch (error) {
        next(error);
    }
};

export const deactivateMyAccount = async (req, res, next) => {
    try {
        await deactivateMyAccountService(
            req.user.user_id,
            req.body
        );

        return res.status(200).json({
            success: true,
            message: "Account deactivated successfully",
        });
    } catch (error) {
        next(error);
    }
};
