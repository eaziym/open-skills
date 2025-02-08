import React, { useState, useEffect } from 'react';
import maleAvatar from '../../assets/avatar/male-default-avatar.png'
import Axios from 'axios'
import { useAlert } from '../utils/AlertProvider'
import { useLoading } from '../utils/LoadingProvider';
import { useNavigate } from 'react-router-dom'

const UserProfileCard = ({ currProfile, currentUser, showNext }) => {

    const [isAccepted, setIsAccepted] = useState('')
    const { alert, setAlert } = useAlert()
    const [id, setid] = useState(Date.now());
    const { setIsLoading } = useLoading()
    const navigate = useNavigate()

    // Use the uploaded profile pic if available, else generate one based on username
    const profilePic = currProfile.profilePic || `https://i.pravatar.cc/150?u=${currProfile.username}`;

    function handleAccept() {
        console.log("Handling acceptance.")
        setIsAccepted(true)
        setid(Date.now());
    }

    function handleReject() {
        console.log("Handling rejection.")
        setIsAccepted(false)
        setid(Date.now());
    }

    function handleClick() {
        navigate(`/${currProfile.username}`)
    }

    // Helper function to decide the class based on a match
    const getHighlightClass = (item, myItems) => {
        return myItems && myItems.includes(item)
            ? 'rounded-full bg-green-600 text-white px-4 py-2 text-sm mr-2 mb-2 hover:bg-green-700'
            : 'rounded-full bg-blue-400 text-gray-900 px-4 py-2 text-sm mr-2 mb-2 hover:bg-blue-300';
    };

    useEffect(() => {
        const sendResults = async () => {
            console.log(`isAccepted : ${isAccepted}`) //////
            console.log(`username : ${currProfile.username}`) //////
            if (isAccepted !== '' && currProfile.username !== 'DEFAULT_USERNAME') {
                setIsLoading(true)
                try {
                    const response = await Axios.post(`${import.meta.env.VITE_BACKEND_URL}swipe`, {
                        username: currProfile.username,
                        isAccepted: isAccepted
                    })
                    if (response.status === 200) {
                        console.log("Swipe results SUCCESSfully sent to backend.")
                        console.log(response.data.message)
                        setAlert({
                            message: response.data.message,
                            type: "success"
                        })
                        showNext()
                    }
                } catch (err) {
                    console.error('Sending swipe results to backend FAILED. :', err.message)
                }
                setIsLoading(false)
            }
            else {
                console.log("isAccepted is blank or Default_user is set.")
            }
        }

        sendResults()

    }, [id])


    return (
        <div className="w-full max-w-md border-2 border-blue-600 dark:border-blue-500 rounded-lg shadow bg-slate-200 dark:bg-gray-900 my-10">
            <div className="flex flex-col items-center p-10">
                <div className="flex flex-col items-center p-5">
                    <img
                        className="w-24 h-24 mb-3 rounded-full shadow-lg"
                        src={profilePic}
                        alt="Profile picture"
                    />

                    <button onClick={handleClick} className="mb-1 text-xl font-medium text-blue-600 dark:text-blue-500">{`@ ${currProfile.username.toLowerCase()}`}</button>

                    <span className="text-sm text-gray-500 dark:text-gray-300">{`${currProfile.fname} ${currProfile.lname}`}</span>
                </div>

                <div className='flex flex-col justify-left mt-1'>
                    <div className='flex flex-col justify-left'>
                        <span className="text-sm text-gray-500 mb-3">About</span>
                        <span className="text-sm text-black dark:text-gray-200">{`${currProfile.bio}`}</span>
                    </div>

                    <div className='flex flex-col justify-left my-5'>
                        <span className="text-sm text-gray-500 mb-3">Skills</span>
                        <div className="flex flex-wrap justify-left">
                            {currProfile.skills.map((element, key) => {
                                return <label key={key} className={getHighlightClass(element, currentUser?.interests)}>{element}</label>
                            })}
                        </div>
                    </div>

                    <div className='flex flex-col justify-between'>
                        <span className="text-sm text-gray-500 mb-3">Interests</span>
                        <div className="flex flex-wrap justify-left">
                            {currProfile.interests.map((element, key) => {
                                return <label key={key} className={getHighlightClass(element, currentUser?.skills)}>{element}</label>
                            })}
                        </div>
                    </div>
                </div>

                <div className="flex mt-4 md:mt-6">
                    <button
                        onClick={handleReject}
                        className="py-2 px-4 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
                    >
                        Not interested
                    </button>

                    <button
                        onClick={handleAccept}
                        className="inline-flex items-center px-4 py-2 ms-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                    >
                        Swap Skills
                    </button>

                </div>
            </div>
        </div>
    );
};

export default UserProfileCard;
