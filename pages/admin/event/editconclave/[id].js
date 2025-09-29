import { useState, useEffect } from 'react';
import { db } from '../../../../firebaseConfig';
import {
  doc,
  getDoc,getDocs,
  collection,
  addDoc,
  Timestamp
} from 'firebase/firestore';
import { useRouter } from 'next/router';
import Layout from '../../../../component/Layout';
import "../../../../pages/feedback.css";
import "../../../../src/app/styles/main.scss";




const EditAdminEvent = () => {
  const router = useRouter();
  const { id } = router.query;
const [meetings, setMeetings] = useState([]);

  const [activeTab, setActiveTab] = useState(0);
  const [eventData, seteventData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showMeetingForm, setShowMeetingForm] = useState(false); // 🔁 NEW

  const [meetingForm, setMeetingForm] = useState({
    meetingName: '',
    datetime: '',
    agenda: '',
    mode: 'online',
    link: '',
    venue: ''
  });

  useEffect(() => {
    const fetchConclave = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const docRef = doc(db, 'Conclaves', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          seteventData(docSnap.data());
        }
      } catch (error) {
        console.error('Error fetching conclave:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchConclave();
  }, [id]);
useEffect(() => {
  const fetchConclave = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const docRef = doc(db, 'Conclaves', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        seteventData(docSnap.data());
      }

      // 🔁 Fetch meetings
      const meetingsRef = collection(db, 'Conclaves', id, 'meetings');
      const snapshot = await getDocs(meetingsRef);
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMeetings(data);
    } catch (error) {
      console.error('Error fetching conclave or meetings:', error);
    } finally {
      setLoading(false);
    }
  };
  fetchConclave();
}, [id]);

  const handleMeetingChange = (e) => {
    setMeetingForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleMeetingSubmit = async (e) => {
    e.preventDefault();
    const { meetingName, datetime, agenda, mode, link, venue } = meetingForm;

    if (
      !meetingName || !datetime || !agenda ||
      (mode === 'online' && !link) ||
      (mode === 'offline' && !venue)
    ) {
      alert('Please fill all required fields');
      return;
    }

    try {
      const meetingData = {
        meetingName,
        datetime: Timestamp.fromDate(new Date(datetime)),
        agenda,
        mode,
        link: mode === 'online' ? link : '',
        venue: mode === 'offline' ? venue : '',
        createdAt: Timestamp.now()
      };

      const meetingRef = collection(db, 'Conclaves', id, 'meetings');
      await addDoc(meetingRef, meetingData);

      alert('Meeting added successfully!');
      setMeetingForm({
        meetingName: '',
        datetime: '',
        agenda: '',
        mode: 'online',
        link: '',
        venue: ''
      });
      setShowMeetingForm(false); // ⛔ close form after submission
    } catch (error) {
      console.error("Error adding meeting:", error);
      alert("Failed to add meeting.");
    }
  };

  return (
    <Layout>
      <div className="step-form-container"></div>

      <section className='c-form box'>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <>
            {activeTab === 0 && (
              <>
               <div style={{ marginTop: "2rem" }}>
                  <button
                    className="submitbtn"
                    onClick={() => setShowMeetingForm(!showMeetingForm)}
                  >
                    {showMeetingForm ? "Cancel" : "➕ Add Meeting"}
                  </button>
                </div>

           
               
                {showMeetingForm && (
                  <>
                    <hr style={{ margin: '2rem 0' }} />
                    <h3>Add New Meeting</h3>
                    <form onSubmit={handleMeetingSubmit}>
                      <ul>
                        <li className="form-row">
                          <h4>Meeting Name<sup>*</sup></h4>
                          <div className="multipleitem">
                            <input
                              type="text"
                              name="meetingName"
                              value={meetingForm.meetingName}
                              onChange={handleMeetingChange}
                              required
                            />
                          </div>
                        </li>

                        <li className="form-row">
                          <h4>Date & Time<sup>*</sup></h4>
                          <div className="multipleitem">
                            <input
                              type="datetime-local"
                              name="datetime"
                              value={meetingForm.datetime}
                              onChange={handleMeetingChange}
                              required
                            />
                          </div>
                        </li>

                        <li className="form-row">
                          <h4>Agenda<sup>*</sup></h4>
                          <div className="multipleitem">
                            <textarea
                              name="agenda"
                              value={meetingForm.agenda}
                              onChange={handleMeetingChange}
                              required
                            />
                          </div>
                        </li>

                        <li className="form-row">
                          <h4>Mode<sup>*</sup></h4>
                          <div className="multipleitem">
                            <select
                              name="mode"
                              value={meetingForm.mode}
                              onChange={handleMeetingChange}
                            >
                              <option value="online">Online</option>
                              <option value="offline">Offline</option>
                            </select>
                          </div>
                        </li>

                        {meetingForm.mode === 'online' && (
                          <li className="form-row">
                            <h4>Meeting Link<sup>*</sup></h4>
                            <div className="multipleitem">
                              <input
                                type="url"
                                name="link"
                                value={meetingForm.link}
                                onChange={handleMeetingChange}
                                required
                              />
                            </div>
                          </li>
                        )}

                        {meetingForm.mode === 'offline' && (
                          <li className="form-row">
                            <h4>Venue<sup>*</sup></h4>
                            <div className="multipleitem">
                              <input
                                type="text"
                                name="venue"
                                value={meetingForm.venue}
                                onChange={handleMeetingChange}
                                required
                              />
                            </div>
                          </li>
                        )}

                        <li className="form-row">
                          <div className="multipleitem">
                            <button type="submit" className="submitbtn">Add Meeting</button>
                          </div>
                        </li>
                      </ul>
                    </form>
                  </>
                )}
                     <Edit data={eventData} id={id} />

              </>
            )}
          <hr style={{ margin: '2rem 0' }} />
<h3>Existing Meetings</h3>
{meetings.length === 0 ? (
  <p>No meetings added yet.</p>
) : (
  <table className="table-class">
    <thead>
      <tr>
        <th>Meeting Name</th>
        <th>Mode</th>
        <th>Date & Time</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      {meetings.map((meeting) => (
        <tr key={meeting.id}>
          <td>{meeting.meetingName}</td>
          <td>{meeting.mode}</td>
          <td>
            {meeting.datetime?.seconds
              ? new Date(meeting.datetime.seconds * 1000).toLocaleString()
              : 'N/A'}
          </td>
          <td>
         <button
  className="btn-edit"
  onClick={() =>
    router.push(`/admin/event/addmeeting/${meeting.id}?conclaveId=${id}`)
  }
>
  ✎ Edit
</button>

          </td>
        </tr>
      ))}
    </tbody>
  </table>
)}

          </>
        )}
      </section>
    </Layout>
  );
};

export default EditAdminEvent;
