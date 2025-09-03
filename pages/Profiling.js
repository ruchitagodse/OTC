'use client';

import React, { useEffect, useState } from 'react';
import {
  collection,
  getDocs,
  doc,
  updateDoc,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebaseConfig';

const UserProfileForm = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [allUsers, setAllUsers] = useState([]);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [userData, setUserData] = useState(null);
  const [formData, setFormData] = useState({});
  const [docId, setDocId] = useState('');
  const [profilePic, setProfilePic] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      const snapshot = await getDocs(collection(db, 'userdetails'));
      const users = [];

      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        users.push({
          name: (data[' Name'] || '').trim(),
          id: docSnap.id,
          data,
        });
      });

      setAllUsers(users);
    };

    fetchUsers();
  }, []);

  const handleSearchInput = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    const suggestions = allUsers.filter((user) =>
      user.name.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredSuggestions(suggestions);
  };

  const handleSelectSuggestion = (user) => {
    setSearchTerm(user.name);
    setFilteredSuggestions([]);
    setUserData(user.data);
    setFormData(user.data);
    setDocId(user.id);
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'Upload Photo') {
      setProfilePic(files[0]);
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleMultiSelect = (name, value) => {
    const existing = formData[name] || [];
    if (existing.includes(value)) {
      setFormData((prev) => ({
        ...prev,
        [name]: existing.filter((v) => v !== value),
      }));
    } else if (name === 'Skills' && existing.length >= 4) {
      alert('You can select up to 4 skills');
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: [...existing, value],
      }));
    }
  };

  const uploadProfilePhoto = async () => {
    if (!profilePic || !docId) return '';
    const fileRef = ref(storage, `profilePhotos/${docId}/${profilePic.name}`);
    await uploadBytes(fileRef, profilePic);
    return await getDownloadURL(fileRef);
  };

  const handleSubmit = async () => {
    try {
      const downloadURL = await uploadProfilePhoto();
      const updatedData = {
        ...formData,
        ...(downloadURL && { 'Profile Photo URL': downloadURL }),
      };

      const userRef = doc(db, 'userdetails', docId);
      await updateDoc(userRef, updatedData);

      alert('Profile updated successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to update profile');
    }
  };

  const dropdowns = {
    Gender: ['Male', 'Female', 'Transgender', 'Prefer not to say'],
    'ID Type': ['Aadhaar', 'PAN', 'Passport', 'Driving License'],
    'Interest Area': ['Business', 'Education', 'Wellness', 'Technology', 'Art', 'Environment', 'Other'],
    'Current Health Condition': ['Excellent', 'Good', 'Average', 'Needs Attention'],
    'Marital Status': ['Single', 'Married', 'Widowed', 'Divorced'],
    'Educational Background': ['SSC', 'HSC', 'Graduate', 'Post-Graduate', 'PhD', 'Other'],
    'Profile Status': ['Pending', 'In process', 'Submitted', 'Verified', 'Inactive'],
    'Business Details (Nature & Type)': ['Product', 'Service', 'Both; Proprietorship', 'LLP', 'Pvt Ltd'],
  };

  const skillsOptions = ['Leadership', 'Communication', 'Management', 'Design', 'Coding', 'Marketing'];
  const contributionOptions = ['Referrals', 'Volunteering', 'RHW Activities', 'Content Creation', 'Mentorship'];

  const orbiterFields = [
    'ID Type', 'ID Number', 'Address (City, State)', 'Upload Photo',
    'Hobbies', 'Interest Area', 'Skills', 'Exclusive Knowledge',
    'Aspirations', 'Health Parameters', 'Current Health Condition',
    'Family History Summary', 'Marital Status', 'Professional History',
    'Current Profession', 'Educational Background', 'Languages Known',
    'Contribution Area in UJustBe', 'Immediate Desire', 'Mastery',
    'Special Social Contribution', 'Profile Status',
  ];

  const cosmorbiterFields = [
    ...orbiterFields,
    'Business Name', 'Business Details (Nature & Type)', 'Business History',
    'Noteworthy Achievements', 'Clientele Base', 'Business Social Media Pages',
    'Website', 'Locality', 'Area of Services', 'USP', 'Business Logo',
    'Tag Line',
  ];

  const getFields = () => {
    if (!userData?.Category) return [];
    return userData.Category.toLowerCase() === 'cosmorbiter'
      ? cosmorbiterFields
      : orbiterFields;
  };

  const renderInput = (field) => {
    if (field === 'Skills') {
      return (
        <div className="multi-select">
          {skillsOptions.map((skill) => (
            <label key={skill}>
              <input
                type="checkbox"
                checked={formData[field]?.includes(skill) || false}
                onChange={() => handleMultiSelect(field, skill)}
              />
              {skill}
            </label>
          ))}
        </div>
      );
    }

    if (field === 'Contribution Area in UJustBe') {
      return (
        <div className="multi-select">
          {contributionOptions.map((item) => (
            <label key={item}>
              <input
                type="checkbox"
                checked={formData[field]?.includes(item) || false}
                onChange={() => handleMultiSelect(field, item)}
              />
              {item}
            </label>
          ))}
        </div>
      );
    }

    if (dropdowns[field]) {
      return (
        <select name={field} value={formData[field] || ''} onChange={handleChange}>
          <option value="">Select {field}</option>
          {dropdowns[field].map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      );
    }

    if (field.toLowerCase().includes('upload') || field.toLowerCase().includes('logo')) {
      return <input type="file" name={field} onChange={handleChange} />;
    }

    return (
      <input
        type="text"
        name={field}
        value={formData[field] || ''}
        onChange={handleChange}
      />
    );
  };

  return (
    <div className="profile-form">
      <h2>Admin Profile Setup</h2>

      <div className="search-box">
        <input
          type="text"
          placeholder="Search user by name"
          value={searchTerm}
          onChange={handleSearchInput}
        />
        {filteredSuggestions.length > 0 && (
          <ul className="suggestions-list">
            {filteredSuggestions.map((user, index) => (
              <li key={index} onClick={() => handleSelectSuggestion(user)}>
                {user.name}
              </li>
            ))}
          </ul>
        )}
      </div>

      {userData && (
        <>
          <h3>Autofilled Info</h3>
          <p><strong>Name:</strong> {userData[' Name']}</p>
          <p><strong>Category:</strong> {userData.Category}</p>
          <p><strong>Email:</strong> {userData.Email}</p>
          <p><strong>Mobile:</strong> {userData['Mobile no']}</p>

          <h3>Additional Fields</h3>
          {getFields().map((field, i) => (
            <div key={i} className="form-group">
              <label>{field}</label>
              {renderInput(field)}
            </div>
          ))}

          <button onClick={handleSubmit}>Submit</button>
        </>
      )}
    </div>
  );
};

export default UserProfileForm;
