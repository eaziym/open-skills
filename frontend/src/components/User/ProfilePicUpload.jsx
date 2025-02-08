import React, { useRef } from 'react';
import Axios from 'axios';

function ProfilePicUpload({ currentUser, setCurrentUser }) {
  const fileInputRef = useRef(null);

  const handleUpload = async (file) => {
    const formData = new FormData();
    formData.append('profilePic', file);
    try {
      const res = await Axios.post(
        `${import.meta.env.VITE_BACKEND_URL}user/upload-profile-pic`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      if (res.status === 200) {
        // Update the current user's profile picture in the state
        setCurrentUser({ ...currentUser, profilePic: res.data.profilePic });
        alert("Profile picture updated successfully!");
      }
    } catch (err) {
      console.error("Error uploading profile picture:", err.message);
      alert("Error uploading profile picture");
    }
  };

  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      await handleUpload(file);
    }
  };

  const openFileDialog = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="flex flex-col items-center">
      <button
        onClick={openFileDialog}
        className="py-2 px-4 text-sm font-medium text-white bg-blue-700 rounded-lg hover:bg-blue-800"
      >
        {currentUser && currentUser.profilePic ? "Change Profile Picture" : "Upload Profile Picture"}
      </button>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        ref={fileInputRef}
        style={{ display: 'none' }}
      />
    </div>
  );
}

export default ProfilePicUpload; 