import { useEffect, useState } from "react";
import axios from "axios";

// Helper: Get token from localStorage
const getAuthHeader = () => {
  const token = localStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const AdminUsers = () => {
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch all pending farmer applicants
  const fetchApplicants = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:4000/users/farmers-applicants", {
        headers: getAuthHeader(),
      });
      setApplicants(res.data.applicants);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch applicants");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicants();
  }, []);

  // Approve a farmer
  const approveFarmer = async (id) => {
    try {
      await axios.put(`http://localhost:4000/users/approve-farmer/${id}`, {}, {
        headers: getAuthHeader(),
      });
      fetchApplicants(); // Refresh list
    } catch (err) {
      alert(err.response?.data?.error || "Failed to approve farmer");
    }
  };

  // Reject a farmer
  const rejectFarmer = async (id) => {
    try {
      await axios.put(`http://localhost:4000/users/reject-farmer/${id}`, {}, {
        headers: getAuthHeader(),
      });
      fetchApplicants(); // Refresh list
    } catch (err) {
      alert(err.response?.data?.error || "Failed to reject farmer");
    }
  };

  // Determine status badge
  const getStatus = (user) => {
    if (user.isApproved) return { text: "Approved", color: "success" };
    if (!user.isApproved && !user.hasAppliedFarmer) return { text: "Rejected", color: "danger" };
    return { text: "Pending", color: "warning" };
  };

  if (loading) return <p>Loading applicants...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div className="container mt-4">
      <h2>Farmer Applications</h2>
      {applicants.length === 0 ? (
        <p>No pending farmer applications</p>
      ) : (
        <div className="row">
          {applicants.map((user) => {
            const status = getStatus(user);
            const isActionDisabled = status.text !== "Pending";

            return (
              <div className="col-md-4 mb-3" key={user._id}>
                <div className="card shadow-sm">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <h5 className="card-title">{user.firstName} {user.lastName}</h5>
                      <span className={`badge bg-${status.color}`}>{status.text}</span>
                    </div>
                    <p className="card-text">
                      <strong>Email:</strong> {user.email || "N/A"} <br />
                      <strong>Contact:</strong> {user.contactNumber} <br />
                      <strong>Address:</strong> {user.address}
                    </p>
                    <div className="d-flex justify-content-between">
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => approveFarmer(user._id)}
                        disabled={isActionDisabled}
                      >
                        Approve
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => rejectFarmer(user._id)}
                        disabled={isActionDisabled}
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
