import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PhoneFrame from './components/PhoneFrame';
import SignupScreen from './screens/SignupScreen';
import OtpScreen from './screens/OtpScreen';
import HomeScreen from './screens/HomeScreen';
import ItemScreen from './screens/ItemScreen';
import PublicEnquiryModal from './components/PublicEnquiryModal';

const API_BASE = '/api';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('signup'); // 'signup' | 'otp' | 'home' | 'item'
  const [phone, setPhone] = useState('');
  const [counselor, setCounselor] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('crm_token') || '');
  const [fastorToken, setFastorToken] = useState(localStorage.getItem('fastor_token') || '');

  // Data states
  const [publicEnquiries, setPublicEnquiries] = useState([]);
  const [myEnquiries, setMyEnquiries] = useState([]);
  const [fastorRestaurants, setFastorRestaurants] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);

  // UI states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isPublicModalOpen, setIsPublicModalOpen] = useState(false);
  const [isFrameMode, setIsFrameMode] = useState(true);

  // Setup Axios Authorization header
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchCounselorProfile();
      fetchCRMData();
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Load Fastor catalog on startup or when logged in
  useEffect(() => {
    fetchFastorRestaurants();
  }, [fastorToken]);

  // 1. Fetch counselor profile
  const fetchCounselorProfile = async () => {
    try {
      const res = await axios.get(`${API_BASE}/auth/me`);
      if (res.data.success) {
        setCounselor(res.data.data);
        setCurrentScreen('home');
      }
    } catch (err) {
      console.warn('Session expired or not logged in:', err.message);
      logout();
    }
  };

  // 2. Fetch CRM Leads: Public & Claimed
  const fetchCRMData = async () => {
    setLoading(true);
    try {
      const [pubRes, myRes] = await Promise.all([
        axios.get(`${API_BASE}/enquiries/public`),
        axios.get(`${API_BASE}/enquiries/my-claims`)
      ]);
      setPublicEnquiries(pubRes.data.data || []);
      setMyEnquiries(myRes.data.data || []);
    } catch (err) {
      console.error('Error fetching CRM data:', err);
    } finally {
      setLoading(false);
    }
  };

  // 3. Fetch Fastor Restaurants (hitting backend curl endpoint)
  const fetchFastorRestaurants = async () => {
    try {
      const res = await axios.get(`${API_BASE}/fastor/restaurants?city_id=118`);
      setFastorRestaurants(res.data.data || []);
    } catch (err) {
      console.warn('Fastor restaurant load warning:', err.message);
    }
  };

  // 4. Handle Phone "Get OTP" (Hits Fastor register curl via backend)
  const handleGetOtp = async (targetPhone) => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${API_BASE}/auth/fastor-register`, {
        phone: targetPhone,
        dial_code: '+91'
      });
      console.log('Fastor OTP Response:', res.data);
      setCurrentScreen('otp');
    } catch (err) {
      console.error('Get OTP error:', err);
      setError(err?.response?.data?.message || 'Could not send OTP. Proceeding to verification.');
      // Proceed so user can enter OTP regardless of external downtime
      setCurrentScreen('otp');
    } finally {
      setLoading(false);
    }
  };

  // 5. Handle OTP Verification (Hits Fastor login curl & provisions counselor in CRM with JWT)
  const handleVerifyOtp = async (otpValue) => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${API_BASE}/auth/fastor-login`, {
        phone: phone,
        otp: otpValue,
        dial_code: '+91'
      });

      const { crmToken, fastorToken: fToken, ...employeeData } = res.data.data;

      setToken(crmToken);
      localStorage.setItem('crm_token', crmToken);
      if (fToken) {
        setFastorToken(fToken);
        localStorage.setItem('fastor_token', fToken);
      }
      setCounselor(employeeData);
      setCurrentScreen('home');
      fetchCRMData();
    } catch (err) {
      console.error('Verify OTP error:', err);
      setError(err?.response?.data?.message || 'Invalid OTP code. Please enter 123456.');
    } finally {
      setLoading(false);
    }
  };

  // 6. Handle Email Login
  const handleEmailLogin = async (email, password) => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${API_BASE}/auth/login`, { email, password });
      const { token: userToken, ...employeeData } = res.data.data;
      setToken(userToken);
      localStorage.setItem('crm_token', userToken);
      setCounselor(employeeData);
      setCurrentScreen('home');
      fetchCRMData();
    } catch (err) {
      console.error('Email login error:', err);
      setError(err?.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  // 7. Handle Email Register
  const handleEmailRegister = async (name, email, password, userPhone) => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${API_BASE}/auth/register`, {
        name,
        email,
        password,
        phone: userPhone
      });
      const { token: userToken, ...employeeData } = res.data.data;
      setToken(userToken);
      localStorage.setItem('crm_token', userToken);
      setCounselor(employeeData);
      setCurrentScreen('home');
      fetchCRMData();
    } catch (err) {
      setError(err?.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  // 8. Claim Lead (Exclusively assigns to this counselor)
  const handleClaimLead = async (leadId) => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/enquiries/${leadId}/claim`);
      alert(res.data.message || 'Lead claimed successfully! It is now private to your account.');
      await fetchCRMData();
      if (selectedItem && selectedItem._id === leadId) {
        setSelectedItem(res.data.data);
      }
    } catch (err) {
      console.error('Claim error:', err);
      alert(err?.response?.data?.message || 'Failed to claim enquiry');
    } finally {
      setLoading(false);
    }
  };

  // 9. Update Lead Status / Add Note
  const handleUpdateStatus = async (leadId, status, note) => {
    try {
      const res = await axios.patch(`${API_BASE}/enquiries/${leadId}`, {
        status,
        note
      });
      alert('Lead progress updated successfully!');
      await fetchCRMData();
      if (selectedItem && selectedItem._id === leadId) {
        setSelectedItem(res.data.data);
      }
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to update lead');
    }
  };

  // 10. Quick Switch Counselor (To demonstrate exclusivity)
  const handleSwitchCounselor = async () => {
    if (counselor?.email === 'karan@fastor.com') {
      await handleEmailLogin('priya@fastor.com', 'password123');
    } else {
      await handleEmailLogin('karan@fastor.com', 'password123');
    }
  };

  const logout = () => {
    setToken('');
    setCounselor(null);
    localStorage.removeItem('crm_token');
    localStorage.removeItem('fastor_token');
    setCurrentScreen('signup');
  };

  return (
    <>
      <PhoneFrame
        currentCounselor={counselor}
        onSwitchCounselor={handleSwitchCounselor}
        onOpenPublicForm={() => setIsPublicModalOpen(true)}
        onLogout={logout}
        isFrameMode={isFrameMode}
        setIsFrameMode={setIsFrameMode}
      >
        {currentScreen === 'signup' && (
          <SignupScreen
            phone={phone}
            setPhone={setPhone}
            onGetOtp={handleGetOtp}
            onEmailLogin={handleEmailLogin}
            onEmailRegister={handleEmailRegister}
            loading={loading}
            error={error}
          />
        )}

        {currentScreen === 'otp' && (
          <OtpScreen
            phone={phone}
            onVerifyOtp={handleVerifyOtp}
            onBack={() => setCurrentScreen('signup')}
            onResendOtp={() => handleGetOtp(phone)}
            loading={loading}
            error={error}
          />
        )}

        {currentScreen === 'home' && (
          <HomeScreen
            counselor={counselor}
            publicEnquiries={publicEnquiries}
            myEnquiries={myEnquiries}
            fastorRestaurants={fastorRestaurants}
            onClaimLead={handleClaimLead}
            onSelectLead={(lead) => {
              setSelectedItem(lead);
              setCurrentScreen('item');
            }}
            onSelectRestaurant={(restaurant) => {
              setSelectedItem(restaurant);
              setCurrentScreen('item');
            }}
            onOpenPublicForm={() => setIsPublicModalOpen(true)}
            onRefresh={fetchCRMData}
            loading={loading}
          />
        )}

        {currentScreen === 'item' && (
          <ItemScreen
            item={selectedItem}
            counselor={counselor}
            onBack={() => setCurrentScreen('home')}
            onClaimLead={handleClaimLead}
            onUpdateStatus={handleUpdateStatus}
            loading={loading}
          />
        )}
      </PhoneFrame>

      {/* Prospective Client Enquiry Modal (Accessible directly without auth) */}
      <PublicEnquiryModal
        isOpen={isPublicModalOpen}
        onClose={() => setIsPublicModalOpen(false)}
        onEnquiryCreated={(newLead) => {
          setPublicEnquiries((prev) => [newLead, ...prev]);
        }}
      />
    </>
  );
}

