import { useState, useEffect } from "react";
import "./user.css";
import { Container } from "@mui/material";

interface Profile {
  image?: string;
  name?: string;
}

function UserProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [image, setImage] = useState<File | null>(null);

  // 1️⃣ Handle image selection ONLY
  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
    }
  };

  // 2️⃣ Upload image to Django
  const uploadImage = async () => {
    if (!image) return;

    const formData = new FormData();
    formData.append("image", image);

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/upload-profile-image/",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();
      console.log(data);

      // refresh profile after upload
      fetchProfile();
    } catch (error) {
      console.error("Upload failed", error);
    }
  };

  // 3️⃣ Fetch profile data
  const fetchProfile = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/profile/");
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
      }
    } catch (error) {
      console.error("Failed to fetch profile", error);
    }
  };

  // 4️⃣ Load profile when page opens
  useEffect(() => {
    fetchProfile();
  }, []);

  return (
    <Container className="user profile">
      <label>
        <div className="avatar">
          {image ? (
            <img src={URL.createObjectURL(image)} alt="profile" />
          ) : profile?.image ? (
            <img src={profile.image} alt="profile" />
          ) : (
            <span>Upload</span>
          )}
        </div>

        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          hidden
        />
      </label>

      <button onClick={uploadImage}>Save Image</button>

      <div>
        {profile && <h2>{profile.name}</h2>}
      </div>
    </Container>
  );
}

export default UserProfile;
