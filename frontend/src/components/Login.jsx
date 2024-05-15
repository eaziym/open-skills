import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import Axios from 'axios';
import { useNavigate } from 'react-router-dom';
import PageHeading from './PageHeading';
import Alert from './Alert.jsx'

function Login() {

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [alertMsg, setAlertMsg] = useState('')
    const [alertType, setAlertType] = useState('')  // success or warning

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await Axios.post('http://localhost:3000/user/login', {
                email: email,
                password: password,
            })

            if (response.status === 200) {
                navigate("/user/profile")
            } else {
                console.log("Redirect not working")
            }

            console.log('Logged in successfully - fe', response.data)
            setAlertType('success')
            setAlertMsg("Login successful !")

        } catch (error) {
            console.error('Login failed', error.message)
            setAlertType('warning')
            setAlertMsg("Login Failed : " + error)
            // Handle error (e.g., show error message to user)
        }
    };

    return (
        <form className="min-w-96 max-w-sm mx-auto py-10">


            <PageHeading>Login</PageHeading>
            <Alert message={alertMsg} type={alertType}></Alert>


            <div className="mb-5">
                <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    Your email
                </label>
                <input
                    type="email"
                    id="email"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    placeholder="name@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
            </div>
            <div className="mb-5">
                <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    Your password
                </label>
                <input
                    type="password"
                    id="password"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
            </div>

            <div className="flex items-start mb-5">
                <Link to="/user/register" className="underline ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                    Sign up!
                </Link>
            </div>

            <button
                onClick={handleSubmit}
                type="submit"
                className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            >
                Submit
            </button>
        </form>
    );
};

export default Login
