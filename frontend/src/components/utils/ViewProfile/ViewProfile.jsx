import { React, useEffect, useState } from 'react'
import Axios from 'axios'
import { useNavigate, useParams } from 'react-router-dom'
import DataRow from './DataRow'
import { defaultUser } from './defaultUser'
import { useAlert } from '../../utils/AlertProvider'
import SkillRow from './SkillRow'
import PageHeading from '../../utils/PageHeading'
import { useLoading } from '../../utils/LoadingProvider'
import { useDispatch } from 'react-redux'
import { SetCurrentConversation } from '../../../redux/slices/conversation'
import { SelectConversation } from '../../../redux/slices/app'
import { useSocket } from "../../../context/SocketContext"

Axios.defaults.withCredentials = true


export default function ViewProfile({ children }) {
    const [userData, setUserData] = useState(defaultUser)
    const navigate = useNavigate()
    const { alert, setAlert } = useAlert()
    const { isLoading, setIsLoading } = useLoading()
    const { username } = useParams()
    const [currentUser, setCurrentUser] = useState(null)
    const dispatch = useDispatch()
    const socket = useSocket()

    // Fetch the current logged in user's profile to get their skills and interests for highlighting.
    useEffect(() => {
      async function fetchCurrentUser() {
        try {
          const res = await Axios.get(`${import.meta.env.VITE_BACKEND_URL}user/profile`)
          if (res.status === 200) {
            const fetchedUser = res.data
            // Transform skills and interests from objects to arrays of names.
            // fetchedUser.skills = fetchedUser.skills.map((skill) => skill.name);
            // fetchedUser.interests = fetchedUser.interests.map((interest) => interest.name);
            console.log('Current user:', fetchedUser)
            setCurrentUser(fetchedUser)
          }
        } catch (err) {
          console.error('Error fetching current user profile:', err.message)
        }
      }
      fetchCurrentUser()
    }, [])


    useEffect(() => {
        console.log("username :" , username)
        const handleFetch = async () => {
            setIsLoading(true)
            if (children) {
                setUsername(children)
                navigate(`/${username}`)
            }
            try {
                const response = await Axios.get(`${import.meta.env.VITE_BACKEND_URL}user/profile/${username}`);
                
                if (response.status === 200) {
                    console.log('Profile fetched successfully:', response.data);
                    setUserData(response.data);
                } else {
                    console.log('Fetch not working');
                    setAlert({
                        message: "Couldn't fetch profile."
                    });
                }
            } catch (err) {
                console.error('Error fetching recipient profile:', err.message);
                setAlert({
                    message: "Couldn't fetch profile."
                });
            }
            setIsLoading(false)
        }

        if(username)
            handleFetch()
    }, [])


    useEffect(() => {
        console.log('Updated userData:', userData);
    }, [userData])

    const isMatch = currentUser?.matches?.includes(userData.username);
    console.log("isMatch:", isMatch);
    console.log("currentUser:", currentUser); // me
    console.log("userData:", userData); // other user

    const handleStartChat = () => {
        console.log("Starting chat with:", {
            from: currentUser._id,
            to: userData._id
        });
        socket.emit("start_chat", { from: currentUser._id, to: userData._id }, (response) => {
            if (response.error) {
                console.error("Error starting chat:", response.error);
                return;
            }
            // Assume response is a full conversation object with a valid _id
            const conversationData = response;
            
            // Dispatch actions to update the conversation in your redux store.
            dispatch(SelectConversation({
                chat_type: 'direct_chat',
                room_id: conversationData._id,
                conversation: conversationData
            }));
            dispatch(SetCurrentConversation(conversationData));
            
            // Now navigate to the chat page.
            navigate("/chat", { state: { matchedUser: userData } });
        });
    };

    return (
        <div className="flex items-center justify-center w-full">

            <div className='flex flex-col my-5'>

                <PageHeading>{isMatch ? "Your Match" : "Profile"}</PageHeading>

                <div className="w-full max-w-lg border-2 border-blue-600 dark:border-blue-500 rounded-lg shadow bg-slate-200 dark:bg-gray-900 mb-5">
                    <div className="flex flex-col items-center p-10">

                    <div className="flex flex-col items-center mb-5">
                            <img
                                className="w-24 h-24 rounded-full shadow-lg mb-2"
                                src={
                                    userData.profilePic
                                        ? userData.profilePic
                                        : `https://i.pravatar.cc/150?u=${userData.username}`
                                }
                                alt="Profile picture"
                            />
                            <h1 className="text-xl font-bold text-blue-600 dark:text-blue-500">
                                @{userData.username.toLowerCase()}
                            </h1>
                            {isMatch && (
                                <button
                                    onClick={handleStartChat}
                                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                >
                                    Have a Chat
                                </button>
                            )}
                        </div>

                        <div className="flex flex-col items-center p-5">
                            {Object.keys(userData).map((myKey, itr) => {
                                if (myKey === 'profilePic') {
                                    return null;
                                } else if (myKey === 'skills' || myKey === 'interests') {
                                    return <SkillRow key={itr} dataType={myKey} dataVal={userData[myKey]} currentUser={currentUser} />
                                } else {
                                    return <DataRow key={itr} dataType={myKey} dataVal={userData[myKey]} />
                                }
                            })}
                        </div>

                    </div>
                </div>

            </div>
        </div>
    )
}
