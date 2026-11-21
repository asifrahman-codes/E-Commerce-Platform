import useAuth from "../../hooks/useAuth";
import ProfileForm from "../../components/account/ProfileForm";
import LoadingSpinner from "../../components/common/LoadingSpinner";

export default function MyProfile() {
    const { user, loading, refreshUser } = useAuth();

    if (loading) {
        return (
            <div className="shop-panel flex min-h-56 items-center justify-center">
                <LoadingSpinner />
            </div>
        );
    }

    return <ProfileForm user={user} onUpdate={refreshUser} />;
}