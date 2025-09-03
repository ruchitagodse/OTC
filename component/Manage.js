import { useEffect, useState } from 'react';
import { db } from '../firebaseConfig';
import { collection, getDocs ,doc, deleteDoc} from 'firebase/firestore';

import { format } from 'date-fns';
import { CiEdit } from "react-icons/ci";
import { useRouter } from 'next/router';

const ManageEvents = () => {
    const router = useRouter();
    const [prospects, setProspects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProspects = async () => {
            try {
                const prospectCollection = collection(db, 'Prospects'); // Ensure 'Prospects' is the correct collection name
                const snapshot = await getDocs(prospectCollection);
                const prospectList = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setProspects(prospectList);
                console.log("prospect", prospectList);  // This will log the fetched prospects data
                
            } catch (err) {
                console.error('Error fetching prospects:', err);
                setError('Error fetching prospects. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchProspects();
    }, []);

    const handleEdit = (id) => {
        router.push(`/admin/event/edit/${id}`);
    };

    const formatDate = (timestamp) => {
        if (timestamp && timestamp.seconds) {
            return format(new Date(timestamp.seconds * 1000), 'dd/MM/yyyy');
        }
        return 'N/A';  // Return 'N/A' if there's no valid timestamp
    };
    const handleDelete = async (id) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this prospect?");
        if (!confirmDelete) return;
    
        try {
            await deleteDoc(doc(db, "Prospects", id));
            setProspects(prev => prev.filter(p => p.id !== id));
            alert("Prospect deleted successfully.");
        } catch (error) {
            console.error("Error deleting prospect:", error);
            alert("Failed to delete prospect. Please try again.");
        }
    };
    
    return (
        <>
            {loading && <div className='loader'><span className="loader2"></span></div>}
            <section className='c-userslist box'>
                <h2>Prospects Listing</h2>
                <button className="m-button-5" onClick={() => window.history.back()}>
                    Back
                </button>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <table className='table-class'>
                    <thead>
                        <tr>
                            <th>Sr no</th>
                            <th>Prospect Name</th>
                        
                            <th>Occupation</th>
                            <th>Orbiter Name</th>
                           
                          
                            <th>Date</th>
                            <th>Type</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                 <tbody>
  {prospects.length > 0 ? (
    [...prospects]
      .sort((a, b) => a.prospectName.localeCompare(b.prospectName))
      .map((item, index) => (
        <tr key={item.id}>
          <td>{index + 1}</td>
          <td>{item.prospectName}</td>
          <td>{item.occupation}</td>
          <td>{item.orbiterName}</td>
          <td>{item.date}</td>
          <td>{item.userType === 'orbiter' ? 'ETU' : 'NTU'}</td>
          <td>
            <div className='twobtn'>                  
              <button
                className="btn-edit"
                onClick={() => handleEdit(item.id)}
              >
                ✎ Edit
              </button>
              <button
                className="btn-delete"
                onClick={() => handleDelete(item.id)}
              >
                🗑 Delete
              </button>
            </div>
          </td>

                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="10" style={{ textAlign: 'center' }}>No prospects found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </section>
        </>
    );
};

export default ManageEvents;
