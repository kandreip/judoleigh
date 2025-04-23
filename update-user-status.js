const axios = require('axios');

const userId = '46372e01-5c2f-4d77-809a-eff1524165db';

axios.put(`http://localhost:3001/api/users/${userId}/update-status`, {
  is_admin: true,
  is_approved: true
})
.then(response => {
  console.log('User status updated successfully:', response.data);
})
.catch(error => {
  console.error('Error updating user status:', error.response?.data || error.message);
}); 