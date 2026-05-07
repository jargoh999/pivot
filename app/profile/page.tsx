import ProfileForm from "./profile-form"

export default function ProfilePage() {
    return (
        <main className="min-h-screen w-full flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
            <div className="w-full max-w-md">
                <ProfileForm />
            </div>
        </main>
    )
}
