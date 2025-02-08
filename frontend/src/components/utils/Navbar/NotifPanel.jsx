import NotificationItem from "./NotificationItem";
import Axios from 'axios'
import { useUser } from '../../utils/UserProvider'
import { useAlert } from '../AlertProvider'
import { useLoading } from '../LoadingProvider.jsx'

export default function NotificationPanel({ userData, handleClick }) {
    const { setUserData } = useUser()
    const { setAlert } = useAlert()
    const { setIsLoading } = useLoading()

    const notifications = userData.notifications || []

    async function markAllAsRead() {
        setIsLoading(true)
        try {
            // Call the backend endpoint to mark all notifications as read.
            // Adjust the URL and HTTP method as needed for your API.
            const response = await Axios.patch(`${import.meta.env.VITE_BACKEND_URL}user/notifications/markAllRead`)
            if (response.status === 200) {
                // Update local state: set each notification's "read" property to true.
                const updatedNotifications = notifications.map(notif => ({ ...notif, read: true }))
                setUserData(prev => ({ ...prev, notifications: updatedNotifications }))
            } else {
                setAlert({ message: "Unable to mark notifications as read." })
            }
        } catch (error) {
            console.error("Error marking notifications as read", error)
            setAlert({ message: "Unable to mark notifications as read." })
        }
        setIsLoading(false)
    }

    const blurStyle = {
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        backgroundColor: 'rgba(0, 0, 0, 0.5)'
    }


    return (
        <>
            {/* blur screen */}
            <div aria-hidden="true" className="fixed z-40 w-screen h-screen top-0 left-0" style={blurStyle}></div>

            {/* panel */}
            <div aria-hidden="true" className="overflow-y-auto overflow-x-hidden absolute top-1/4 left-1/3 z-50 w-full max-h-full">
                <div className="relative p-4 w-full max-w-md max-h-full">
                    <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">

                        <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
                            {/* Heading */}
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Notifications
                            </h3>
                            {/* Close button */}
                            <button onClick={handleClick} className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm h-8 w-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white">
                                <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                                </svg>
                                <span className="sr-only">Close</span>
                            </button>
                        </div>

                        <div className="p-4 md:p-5">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-200">
                                    Notifications
                                </h2>
                                <button 
                                    onClick={markAllAsRead} 
                                    className="text-blue-500 hover:underline text-sm"
                                >
                                    Mark All as Read
                                </button>
                            </div>
                            <ul className="my-4 space-y-3">
                                {notifications.map((item, index) => (
                                    <NotificationItem key={index} item={item} />
                                )).reverse()}
                            </ul>
                            {/* <div>
                            <a href="#" className="inline-flex items-center text-xs font-normal text-gray-500 hover:underline dark:text-gray-400">
                                <svg className="w-3 h-3 me-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7.529 7.988a2.502 2.502 0 0 1 5 .191A2.441 2.441 0 0 1 10 10.582V12m-.01 3.008H10M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                </svg>
                                How do I turn off notifications
                            </a>
                        </div> */}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
