import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Wallet.scss';

interface Transaction {
  _id: string;
  type: 'deposit' | 'withdrawal' | 'earning' | 'payment' | 'gig' | 'tutoring' | 'voucher' | 'token_reward';
  amount: number;
  description: string;
  status: 'pending' | 'completed' | 'failed';
  date: string;
  reference?: string;
}

interface Gig {
  id: string;
  title: string;
  description: string;
  reward: number;
  deadline: string;
  status: 'available' | 'in_progress' | 'completed' | 'paid';
  category: string;
  estimatedTime: string;
}

interface Voucher {
  id: string;
  code: string;
  sponsor: string;
  amount: number;
  courses: string[];
  expiryDate: string;
  status: 'active' | 'redeemed' | 'expired';
}

interface TutoringSession {
  id: string;
  tutorName: string;
  subject: string;
  duration: number; // in minutes
  rate: number; // per hour
  scheduledDate: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

interface WalletData {
  balance: number;
  pendingBalance: number;
  xp: number;
  tokens: number;
  ecocashConnected: boolean;
  ecocashNumber?: string;
  transactions: Transaction[];
  availableGigs: Gig[];
  myGigs: Gig[];
  vouchers: Voucher[];
  tutoringSessions: TutoringSession[];
}

export default function Wallet() {
  const [walletData, setWalletData] = useState<WalletData>({
    balance: 0,
    pendingBalance: 0,
    xp: 0,
    tokens: 0,
    ecocashConnected: false,
    transactions: [],
    availableGigs: [],
    myGigs: [],
    vouchers: [],
    tutoringSessions: []
  });
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [showLoadFundsModal, setShowLoadFundsModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showGigModal, setShowGigModal] = useState(false);
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [showTutoringModal, setShowTutoringModal] = useState(false);
  const [selectedGig, setSelectedGig] = useState<Gig | null>(null);
  const [voucherCode, setVoucherCode] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'gigs' | 'vouchers' | 'tutoring' | 'tokens'>('overview');
  const [isLoading, setIsLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loadAmount, setLoadAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp' | 'success'>('phone');
  const [loadStep, setLoadStep] = useState<'amount' | 'confirm' | 'processing' | 'success'>('amount');
  const [error, setError] = useState('');

  const API_URL = process.env.REACT_APP_API_URL || '/api';
  const token = localStorage.getItem('authToken');

  useEffect(() => {
    fetchWalletData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchWalletData = async () => {
    try {
      const res = await fetch(`${API_URL}/wallet`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && data.wallet) {
        // Merge API wallet data with default values to ensure all arrays exist
        setWalletData(prev => ({
          ...prev,
          ...data.wallet,
          transactions: data.wallet.transactions || [],
          availableGigs: data.wallet.availableGigs || prev.availableGigs,
          myGigs: data.wallet.myGigs || prev.myGigs,
          vouchers: data.wallet.vouchers || prev.vouchers,
          tutoringSessions: data.wallet.tutoringSessions || prev.tutoringSessions
        }));
      }
    } catch (error) {
      console.error('Error fetching wallet:', error);
      // Set demo data
      setWalletData({
        balance: 125.50,
        pendingBalance: 25.00,
        xp: 1500,
        tokens: 350,
        ecocashConnected: false,
        transactions: [
          {
            _id: '1',
            type: 'earning',
            amount: 50,
            description: 'Completed Python Basics Course',
            status: 'completed',
            date: new Date().toISOString()
          },
          {
            _id: '2',
            type: 'deposit',
            amount: 100,
            description: 'EcoCash Deposit',
            status: 'completed',
            date: new Date(Date.now() - 86400000).toISOString(),
            reference: 'ECO123456'
          },
          {
            _id: '3',
            type: 'gig',
            amount: 75,
            description: 'Completed Logo Design Gig',
            status: 'completed',
            date: new Date(Date.now() - 172800000).toISOString()
          },
          {
            _id: '4',
            type: 'token_reward',
            amount: 50,
            description: 'Earned 50 tokens for completing module',
            status: 'completed',
            date: new Date(Date.now() - 259200000).toISOString()
          }
        ],
        availableGigs: [
          {
            id: 'g1',
            title: 'Build a Simple Landing Page',
            description: 'Create a responsive landing page for a local business using HTML, CSS, and JavaScript.',
            reward: 150,
            deadline: new Date(Date.now() + 604800000).toISOString(),
            status: 'available',
            category: 'Web Development',
            estimatedTime: '4-6 hours'
          },
          {
            id: 'g2',
            title: 'Data Entry Assistant',
            description: 'Help organize customer data into spreadsheets. Must be detail-oriented.',
            reward: 50,
            deadline: new Date(Date.now() + 259200000).toISOString(),
            status: 'available',
            category: 'Data Entry',
            estimatedTime: '2-3 hours'
          },
          {
            id: 'g3',
            title: 'Python Script for Automation',
            description: 'Write a Python script to automate daily report generation from CSV files.',
            reward: 200,
            deadline: new Date(Date.now() + 1209600000).toISOString(),
            status: 'available',
            category: 'Programming',
            estimatedTime: '5-8 hours'
          }
        ],
        myGigs: [
          {
            id: 'mg1',
            title: 'Mobile App UI Design',
            description: 'Design UI mockups for a fitness tracking app.',
            reward: 180,
            deadline: new Date(Date.now() + 432000000).toISOString(),
            status: 'in_progress',
            category: 'Design',
            estimatedTime: '6-10 hours'
          }
        ],
        vouchers: [
          {
            id: 'v1',
            code: 'ECONET2024',
            sponsor: 'Econet Wireless',
            amount: 100,
            courses: ['Data Science Learning Path', 'Python Mastery'],
            expiryDate: new Date(Date.now() + 2592000000).toISOString(),
            status: 'active'
          },
          {
            id: 'v2',
            code: 'TECHSTART50',
            sponsor: 'TechStart Zimbabwe',
            amount: 50,
            courses: ['Web Development Certification'],
            expiryDate: new Date(Date.now() + 1296000000).toISOString(),
            status: 'redeemed'
          }
        ],
        tutoringSessions: [
          {
            id: 't1',
            tutorName: 'Tatenda Moyo',
            subject: 'Python Programming',
            duration: 60,
            rate: 15,
            status: 'scheduled',
            scheduledDate: new Date(Date.now() + 86400000).toISOString()
          },
          {
            id: 't2',
            tutorName: 'Farai Chikwanha',
            subject: 'Data Analysis',
            duration: 45,
            rate: 12,
            status: 'completed',
            scheduledDate: new Date(Date.now() - 172800000).toISOString()
          }
        ]
      });
    }
  };

  const handleConnectEcoCash = async () => {
    if (step === 'phone') {
      if (!phoneNumber || !/^(\+263|0)7[1-9]\d{7}$/.test(phoneNumber)) {
        setError('Please enter a valid Zimbabwean phone number');
        return;
      }
      setIsLoading(true);
      setError('');
      
      try {
        // Call EcoCash API to send OTP
        const res = await fetch(`${API_URL}/wallet/ecocash/connect`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ phoneNumber })
        });
        const data = await res.json();
        
        if (data.success) {
          setStep('otp');
        } else {
          setError(data.error || 'Failed to send OTP');
        }
      } catch (err) {
        // Demo mode - simulate OTP sent
        console.log('Demo: OTP sent to', phoneNumber);
        setStep('otp');
      }
      setIsLoading(false);
    } else if (step === 'otp') {
      if (!otp || otp.length !== 4) {
        setError('Please enter the 4-digit OTP');
        return;
      }
      setIsLoading(true);
      setError('');

      try {
        const res = await fetch(`${API_URL}/wallet/ecocash/verify`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ phoneNumber, otp })
        });
        const data = await res.json();

        if (data.success) {
          setStep('success');
          setWalletData(prev => ({
            ...prev,
            ecocashConnected: true,
            ecocashNumber: phoneNumber
          }));
        } else {
          setError(data.error || 'Invalid OTP');
        }
      } catch (err) {
        // Demo mode - accept any OTP
        console.log('Demo: OTP verified');
        setStep('success');
        setWalletData(prev => ({
          ...prev,
          ecocashConnected: true,
          ecocashNumber: phoneNumber
        }));
      }
      setIsLoading(false);
    }
  };

  const handleLoadFunds = async () => {
    const amount = parseFloat(loadAmount);
    
    if (loadStep === 'amount') {
      if (!amount || amount < 1) {
        setError('Minimum deposit is $1.00');
        return;
      }
      if (amount > 1000) {
        setError('Maximum deposit is $1,000.00');
        return;
      }
      setError('');
      setLoadStep('confirm');
    } else if (loadStep === 'confirm') {
      setIsLoading(true);
      setLoadStep('processing');
      
      try {
        const res = await fetch(`${API_URL}/wallet/ecocash/deposit`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            amount,
            phoneNumber: walletData.ecocashNumber
          })
        });
        const data = await res.json();

        if (data.success) {
          // Simulate EcoCash USSD prompt delay
          setTimeout(() => {
            setLoadStep('success');
            setWalletData(prev => ({
              ...prev,
              balance: prev.balance + amount,
              transactions: [
                {
                  _id: Date.now().toString(),
                  type: 'deposit',
                  amount,
                  description: 'EcoCash Deposit',
                  status: 'completed',
                  date: new Date().toISOString(),
                  reference: data.reference || 'ECO' + Date.now()
                },
                ...prev.transactions
              ]
            }));
            setIsLoading(false);
          }, 3000);
        } else {
          setError(data.error || 'Deposit failed');
          setLoadStep('amount');
          setIsLoading(false);
        }
      } catch (err) {
        // Demo mode - simulate successful deposit
        console.log('Demo: Processing deposit of $', amount);
        setTimeout(() => {
          setLoadStep('success');
          setWalletData(prev => ({
            ...prev,
            balance: prev.balance + amount,
            transactions: [
              {
                _id: Date.now().toString(),
                type: 'deposit',
                amount,
                description: 'EcoCash Deposit',
                status: 'completed',
                date: new Date().toISOString(),
                reference: 'ECO' + Date.now()
              },
              ...prev.transactions
            ]
          }));
          setIsLoading(false);
        }, 3000);
      }
    }
  };

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    
    if (!amount || amount < 1) {
      setError('Minimum withdrawal is $1.00');
      return;
    }
    if (amount > walletData.balance) {
      setError('Insufficient balance');
      return;
    }
    
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_URL}/wallet/ecocash/withdraw`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount,
          phoneNumber: walletData.ecocashNumber
        })
      });
      const data = await res.json();

      if (data.success) {
        setWalletData(prev => ({
          ...prev,
          balance: prev.balance - amount,
          transactions: [
            {
              _id: Date.now().toString(),
              type: 'withdrawal',
              amount: -amount,
              description: 'EcoCash Withdrawal',
              status: 'completed',
              date: new Date().toISOString(),
              reference: data.reference
            },
            ...prev.transactions
          ]
        }));
        setShowWithdrawModal(false);
        setWithdrawAmount('');
        alert(`Successfully withdrawn $${amount.toFixed(2)} to ${walletData.ecocashNumber}`);
      } else {
        setError(data.error || 'Withdrawal failed');
      }
    } catch (err) {
      // Demo mode
      setWalletData(prev => ({
        ...prev,
        balance: prev.balance - amount,
        transactions: [
          {
            _id: Date.now().toString(),
            type: 'withdrawal',
            amount: -amount,
            description: 'EcoCash Withdrawal',
            status: 'completed',
            date: new Date().toISOString(),
            reference: 'ECO' + Date.now()
          },
          ...prev.transactions
        ]
      }));
      setShowWithdrawModal(false);
      setWithdrawAmount('');
      alert(`Successfully withdrawn $${amount.toFixed(2)} to ${walletData.ecocashNumber}`);
    }
    setIsLoading(false);
  };

  const resetConnectModal = () => {
    setShowConnectModal(false);
    setStep('phone');
    setPhoneNumber('');
    setOtp('');
    setError('');
  };

  const resetLoadFundsModal = () => {
    setShowLoadFundsModal(false);
    setLoadStep('amount');
    setLoadAmount('');
    setError('');
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit': return 'download';
      case 'withdrawal': return 'upload';
      case 'earning': return 'emoji_events';
      case 'payment': return 'credit_card';
      case 'gig': return 'work';
      case 'tutoring': return 'school';
      case 'voucher': return 'redeem';
      case 'token_reward': return 'toll';
      default: return 'payments';
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'deposit': return '#22c55e';
      case 'earning': return '#22c55e';
      case 'gig': return '#22c55e';
      case 'token_reward': return '#f59e0b';
      case 'voucher': return '#8b5cf6';
      case 'withdrawal': return '#ef4444';
      case 'payment': return '#ef4444';
      case 'tutoring': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  const handleApplyForGig = (gig: Gig) => {
    setSelectedGig(gig);
    setShowGigModal(true);
  };

  const handleRedeemVoucher = () => {
    if (!voucherCode.trim()) {
      setError('Please enter a voucher code');
      return;
    }
    // Demo: Add voucher
    setWalletData(prev => ({
      ...prev,
      balance: prev.balance + 25,
      transactions: [
        {
          _id: Date.now().toString(),
          type: 'voucher',
          amount: 25,
          description: `Redeemed voucher: ${voucherCode}`,
          status: 'completed',
          date: new Date().toISOString()
        },
        ...prev.transactions
      ]
    }));
    setVoucherCode('');
    setShowVoucherModal(false);
    alert('Voucher redeemed successfully!');
  };

  const confirmGigApplication = () => {
    if (selectedGig) {
      setWalletData(prev => ({
        ...prev,
        myGigs: [
          ...prev.myGigs,
          { ...selectedGig, status: 'in_progress' as const }
        ],
        availableGigs: prev.availableGigs.filter(g => g.id !== selectedGig.id)
      }));
      setShowGigModal(false);
      setSelectedGig(null);
      alert('Successfully applied for gig!');
    }
  };

  const handleBookTutoring = () => {
    setShowTutoringModal(true);
  };

  return (
    <div className="wallet-page">
      <div className="page-header">
        <Link to="/dashboard" className="back-btn">
          <span className="material-symbols-outlined">arrow_back</span>
          Back
        </Link>
        <h1>Wallet</h1>
        <p>Manage your earnings and rewards.</p>
      </div>

      <div className="balance-card">
        <div className="balance-info">
          <span className="label">Available Balance</span>
          <h2>${walletData.balance.toFixed(2)}</h2>
          {walletData.pendingBalance > 0 && (
            <span className="pending">+${walletData.pendingBalance.toFixed(2)} pending</span>
          )}
        </div>
        <div className="token-info">
          <span className="material-symbols-outlined">toll</span>
          <span className="token-count">{walletData.tokens} Tokens</span>
        </div>
        <div className="balance-actions">
          {walletData.ecocashConnected ? (
            <>
              <button className="action-btn primary" onClick={() => setShowLoadFundsModal(true)}>
                <span className="material-symbols-outlined">add</span>
                Load Funds
              </button>
              <button className="action-btn" onClick={() => setShowWithdrawModal(true)}>
                <span className="material-symbols-outlined">download</span>
                Withdraw
              </button>
            </>
          ) : (
            <button className="action-btn primary" onClick={() => setShowConnectModal(true)}>
              <span className="material-symbols-outlined">link</span>
              Connect EcoCash First
            </button>
          )}
          <button className="action-btn secondary">
            <span className="material-symbols-outlined">history</span>
            History
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="wallet-tabs">
        <button 
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <span className="material-symbols-outlined">dashboard</span>
          Overview
        </button>
        <button 
          className={`tab-btn ${activeTab === 'gigs' ? 'active' : ''}`}
          onClick={() => setActiveTab('gigs')}
        >
          <span className="material-symbols-outlined">work</span>
          Gigs
          {(walletData.availableGigs?.length || 0) > 0 && (
            <span className="badge">{walletData.availableGigs.length}</span>
          )}
        </button>
        <button 
          className={`tab-btn ${activeTab === 'vouchers' ? 'active' : ''}`}
          onClick={() => setActiveTab('vouchers')}
        >
          <span className="material-symbols-outlined">redeem</span>
          Vouchers
        </button>
        <button 
          className={`tab-btn ${activeTab === 'tutoring' ? 'active' : ''}`}
          onClick={() => setActiveTab('tutoring')}
        >
          <span className="material-symbols-outlined">school</span>
          Tutoring
        </button>
        <button 
          className={`tab-btn ${activeTab === 'tokens' ? 'active' : ''}`}
          onClick={() => setActiveTab('tokens')}
        >
          <span className="material-symbols-outlined">toll</span>
          Tokens
        </button>
      </div>

      <div className="wallet-sections">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            <section className="section">
              <h3>XP & Rewards</h3>
              <div className="xp-card">
                <div className="xp-amount">
                  <span className="material-symbols-outlined">star</span>
                  <span className="value">{walletData.xp.toLocaleString()} XP</span>
                </div>
                <p>Complete courses and quizzes to earn XP</p>
                <div className="xp-progress">
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${(walletData.xp % 1000) / 10}%` }}></div>
                  </div>
                  <span className="progress-text">{walletData.xp % 1000}/1000 XP to next level</span>
                </div>
              </div>
            </section>

            <section className="section">
              <h3>Payment Methods</h3>
              <div className={`payment-method ${walletData.ecocashConnected ? 'connected' : ''}`}>
                <div className="method-info">
                  <span className="material-symbols-outlined ecocash-logo">phone_android</span>
                  <div>
                    <h4>EcoCash</h4>
                    <p>{walletData.ecocashConnected 
                      ? `Connected: ${walletData.ecocashNumber}` 
                      : 'Not connected'}</p>
                  </div>
                </div>
                {walletData.ecocashConnected ? (
                  <div className="connected-badge">
                    <span className="material-symbols-outlined">check_circle</span>
                    Connected
                  </div>
                ) : (
                  <button className="connect-btn" onClick={() => setShowConnectModal(true)}>
                    Connect
                  </button>
                )}
              </div>

              {walletData.ecocashConnected && (
                <div className="quick-actions">
                  <button className="quick-btn" onClick={() => setShowLoadFundsModal(true)}>
                    <span className="material-symbols-outlined">add_circle</span>
                    Load Funds
                  </button>
                  <button className="quick-btn" onClick={() => setShowWithdrawModal(true)}>
                    <span className="material-symbols-outlined">download</span>
                    Withdraw
                  </button>
                </div>
              )}
            </section>

            <section className="section">
              <h3>Recent Transactions</h3>
              {(walletData.transactions?.length || 0) === 0 ? (
                <div className="empty-state">
                  <span className="material-symbols-outlined">receipt_long</span>
                  <p>No transactions yet</p>
                </div>
              ) : (
                <div className="transactions-list">
                  {(walletData.transactions || []).slice(0, 5).map(tx => (
                    <div key={tx._id} className="transaction-item">
                      <div className="tx-icon" style={{ backgroundColor: getTransactionColor(tx.type) + '20' }}>
                        <span className="material-symbols-outlined">{getTransactionIcon(tx.type)}</span>
                      </div>
                      <div className="tx-details">
                        <span className="tx-description">{tx.description}</span>
                        <span className="tx-date">{new Date(tx.date).toLocaleDateString()}</span>
                        {tx.reference && <span className="tx-ref">Ref: {tx.reference}</span>}
                      </div>
                      <div className="tx-amount" style={{ color: getTransactionColor(tx.type) }}>
                        {tx.amount >= 0 ? '+' : ''}${Math.abs(tx.amount).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}

        {/* Gigs Tab */}
        {activeTab === 'gigs' && (
          <>
            <section className="section">
              <div className="section-header">
                <h3>Available Gigs</h3>
                <span className="gig-count">{walletData.availableGigs?.length || 0} opportunities</span>
              </div>
              <p className="section-desc">Earn money by completing micro-tasks and freelance projects</p>
              
              {(walletData.availableGigs?.length || 0) === 0 ? (
                <div className="empty-state">
                  <span className="material-symbols-outlined">work_off</span>
                  <p>No gigs available right now</p>
                  <span className="hint">Check back later for new opportunities</span>
                </div>
              ) : (
                <div className="gigs-grid">
                  {(walletData.availableGigs || []).map(gig => (
                    <div key={gig.id} className="gig-card">
                      <div className="gig-header">
                        <span className="gig-category">{gig.category}</span>
                        <span className="gig-reward">${gig.reward}</span>
                      </div>
                      <h4 className="gig-title">{gig.title}</h4>
                      <p className="gig-description">{gig.description}</p>
                      <div className="gig-meta">
                        <span><span className="material-symbols-outlined">schedule</span> {gig.estimatedTime}</span>
                        <span><span className="material-symbols-outlined">event</span> {new Date(gig.deadline).toLocaleDateString()}</span>
                      </div>
                      <button className="apply-btn" onClick={() => handleApplyForGig(gig)}>
                        Apply Now
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="section">
              <h3>My Active Gigs</h3>
              {(walletData.myGigs?.length || 0) === 0 ? (
                <div className="empty-state">
                  <span className="material-symbols-outlined">assignment</span>
                  <p>No active gigs</p>
                  <span className="hint">Apply for gigs above to start earning</span>
                </div>
              ) : (
                <div className="my-gigs-list">
                  {(walletData.myGigs || []).map(gig => (
                    <div key={gig.id} className="my-gig-item">
                      <div className="my-gig-info">
                        <h4>{gig.title}</h4>
                        <div className="my-gig-meta">
                          <span className={`status ${gig.status}`}>{gig.status.replace('_', ' ')}</span>
                          <span className="deadline">Due: {new Date(gig.deadline).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="my-gig-reward">
                        <span className="amount">${gig.reward}</span>
                        {gig.status === 'in_progress' && (
                          <button className="submit-btn">Submit Work</button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}

        {/* Vouchers Tab */}
        {activeTab === 'vouchers' && (
          <>
            <section className="section">
              <div className="section-header">
                <h3>Sponsorship Vouchers</h3>
                <button className="redeem-btn" onClick={() => setShowVoucherModal(true)}>
                  <span className="material-symbols-outlined">add</span>
                  Redeem Code
                </button>
              </div>
              <p className="section-desc">Companies sponsor your learning through vouchers</p>
              
              {(walletData.vouchers?.length || 0) === 0 ? (
                <div className="empty-state">
                  <span className="material-symbols-outlined">redeem</span>
                  <p>No vouchers yet</p>
                  <span className="hint">Enter a voucher code to get sponsored learning</span>
                </div>
              ) : (
                <div className="vouchers-grid">
                  {(walletData.vouchers || []).map(voucher => (
                    <div key={voucher.id} className={`voucher-card ${voucher.status}`}>
                      <div className="voucher-sponsor">
                        <span className="material-symbols-outlined">business</span>
                        {voucher.sponsor}
                      </div>
                      <div className="voucher-amount">${voucher.amount}</div>
                      <div className="voucher-code">
                        <span className="material-symbols-outlined">confirmation_number</span>
                        {voucher.code}
                      </div>
                      <div className="voucher-courses">
                        <span className="label">Valid for:</span>
                        <ul>
                          {voucher.courses.map((course, idx) => (
                            <li key={idx}>{course}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="voucher-footer">
                        <span className={`voucher-status ${voucher.status}`}>
                          {voucher.status === 'active' ? 'Active' : voucher.status === 'redeemed' ? 'Redeemed' : 'Expired'}
                        </span>
                        <span className="voucher-expiry">
                          Expires: {new Date(voucher.expiryDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="section sponsors-section">
              <h3>Our Sponsors</h3>
              <p className="section-desc">These companies are investing in Zimbabwe's future tech talent</p>
              <div className="sponsors-list">
                <div className="sponsor-badge">
                  <span className="material-symbols-outlined">signal_cellular_alt</span>
                  Econet Wireless
                </div>
                <div className="sponsor-badge">
                  <span className="material-symbols-outlined">rocket_launch</span>
                  TechStart Zimbabwe
                </div>
                <div className="sponsor-badge">
                  <span className="material-symbols-outlined">account_balance</span>
                  CBZ Bank
                </div>
              </div>
            </section>
          </>
        )}

        {/* Tutoring Tab */}
        {activeTab === 'tutoring' && (
          <>
            <section className="section">
              <div className="section-header">
                <h3>Peer Tutoring</h3>
                <button className="book-btn" onClick={handleBookTutoring}>
                  <span className="material-symbols-outlined">add</span>
                  Book Session
                </button>
              </div>
              <p className="section-desc">Learn from peers or earn by tutoring others</p>
              
              <div className="tutoring-stats">
                <div className="stat-card">
                  <span className="material-symbols-outlined">school</span>
                  <div className="stat-info">
                    <span className="stat-value">{(walletData.tutoringSessions || []).filter(s => s.status === 'completed').length}</span>
                    <span className="stat-label">Sessions Completed</span>
                  </div>
                </div>
                <div className="stat-card">
                  <span className="material-symbols-outlined">schedule</span>
                  <div className="stat-info">
                    <span className="stat-value">{(walletData.tutoringSessions || []).filter(s => s.status === 'scheduled').length}</span>
                    <span className="stat-label">Upcoming</span>
                  </div>
                </div>
              </div>
            </section>

            <section className="section">
              <h3>Scheduled Sessions</h3>
              {(walletData.tutoringSessions || []).filter(s => s.status === 'scheduled').length === 0 ? (
                <div className="empty-state">
                  <span className="material-symbols-outlined">event</span>
                  <p>No upcoming sessions</p>
                  <span className="hint">Book a tutoring session to get personalized help</span>
                </div>
              ) : (
                <div className="sessions-list">
                  {(walletData.tutoringSessions || []).filter(s => s.status === 'scheduled').map(session => (
                    <div key={session.id} className="session-card">
                      <div className="session-info">
                        <h4>{session.subject}</h4>
                        <p className="tutor-name">with {session.tutorName}</p>
                        <div className="session-meta">
                          <span><span className="material-symbols-outlined">event</span> {new Date(session.scheduledDate).toLocaleDateString()}</span>
                          <span><span className="material-symbols-outlined">schedule</span> {session.duration} min</span>
                        </div>
                      </div>
                      <div className="session-price">
                        <span className="rate">${(session.rate * session.duration / 60).toFixed(2)}</span>
                        <button className="cancel-btn">Cancel</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="section">
              <h3>Past Sessions</h3>
              <div className="sessions-list past">
                {(walletData.tutoringSessions || []).filter(s => s.status === 'completed').map(session => (
                  <div key={session.id} className="session-card completed">
                    <div className="session-info">
                      <h4>{session.subject}</h4>
                      <p className="tutor-name">with {session.tutorName}</p>
                      <span className="completed-date">{new Date(session.scheduledDate).toLocaleDateString()}</span>
                    </div>
                    <div className="session-price">
                      <span className="rate paid">${(session.rate * session.duration / 60).toFixed(2)}</span>
                      <span className="material-symbols-outlined check">check_circle</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {/* Tokens Tab */}
        {activeTab === 'tokens' && (
          <>
            <section className="section">
              <div className="tokens-overview">
                <div className="tokens-balance">
                  <span className="material-symbols-outlined">toll</span>
                  <div className="tokens-info">
                    <span className="tokens-amount">{walletData.tokens}</span>
                    <span className="tokens-label">Total Tokens</span>
                  </div>
                </div>
                <div className="tokens-value">
                  <span className="label">Estimated Value</span>
                  <span className="value">${(walletData.tokens * 0.01).toFixed(2)}</span>
                </div>
              </div>
            </section>

            <section className="section">
              <h3>How to Earn Tokens</h3>
              <div className="earn-methods">
                <div className="earn-method">
                  <span className="material-symbols-outlined">school</span>
                  <div className="method-info">
                    <h4>Complete Courses</h4>
                    <p>Earn 50-200 tokens per course</p>
                  </div>
                </div>
                <div className="earn-method">
                  <span className="material-symbols-outlined">quiz</span>
                  <div className="method-info">
                    <h4>Perfect Quiz Score</h4>
                    <p>Earn 25 tokens for 100% score</p>
                  </div>
                </div>
                <div className="earn-method">
                  <span className="material-symbols-outlined">local_fire_department</span>
                  <div className="method-info">
                    <h4>Learning Streak</h4>
                    <p>Earn 10 tokens per day streak</p>
                  </div>
                </div>
                <div className="earn-method">
                  <span className="material-symbols-outlined">group_add</span>
                  <div className="method-info">
                    <h4>Refer Friends</h4>
                    <p>Earn 100 tokens per referral</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="section">
              <h3>Token History</h3>
              <div className="token-history">
                {walletData.transactions.filter(tx => tx.type === 'token_reward').length === 0 ? (
                  <div className="empty-state">
                    <span className="material-symbols-outlined">toll</span>
                    <p>No token rewards yet</p>
                    <span className="hint">Complete courses and quizzes to earn tokens</span>
                  </div>
                ) : (
                  <div className="transactions-list">
                    {walletData.transactions.filter(tx => tx.type === 'token_reward').map(tx => (
                      <div key={tx._id} className="transaction-item token">
                        <div className="tx-icon token">
                          <span className="material-symbols-outlined">toll</span>
                        </div>
                        <div className="tx-details">
                          <span className="tx-description">{tx.description}</span>
                          <span className="tx-date">{new Date(tx.date).toLocaleDateString()}</span>
                        </div>
                        <div className="tx-amount token">+{tx.amount} tokens</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

            <section className="section">
              <h3>Redeem Tokens</h3>
              <div className="redeem-options">
                <div className="redeem-option">
                  <span className="material-symbols-outlined">payments</span>
                  <div className="option-info">
                    <h4>Convert to Cash</h4>
                    <p>1000 tokens = $10</p>
                  </div>
                  <button className="redeem-action" disabled={walletData.tokens < 1000}>
                    Redeem
                  </button>
                </div>
                <div className="redeem-option">
                  <span className="material-symbols-outlined">card_giftcard</span>
                  <div className="option-info">
                    <h4>Course Discount</h4>
                    <p>500 tokens = 10% off</p>
                  </div>
                  <button className="redeem-action" disabled={walletData.tokens < 500}>
                    Apply
                  </button>
                </div>
              </div>
            </section>
          </>
        )}
      </div>

      {/* Connect EcoCash Modal */}
      {showConnectModal && (
        <div className="modal-overlay" onClick={resetConnectModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2><span className="material-symbols-outlined">phone_android</span> Connect EcoCash</h2>
              <button className="btn-close" onClick={resetConnectModal}>✕</button>
            </div>

            {step === 'phone' && (
              <div className="modal-body">
                <p className="modal-description">
                  Enter your EcoCash phone number to connect your account. 
                  We'll send you a verification code.
                </p>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+263 77X XXX XXX"
                    className="phone-input"
                  />
                </div>
                {error && <p className="error-text">{error}</p>}
                <button 
                  className="btn-primary" 
                  onClick={handleConnectEcoCash}
                  disabled={isLoading}
                >
                  {isLoading ? 'Sending OTP...' : 'Send Verification Code'}
                </button>
              </div>
            )}

            {step === 'otp' && (
              <div className="modal-body">
                <p className="modal-description">
                  Enter the 4-digit code sent to <strong>{phoneNumber}</strong>
                </p>
                <div className="form-group">
                  <label>Verification Code</label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    placeholder="XXXX"
                    className="otp-input"
                    maxLength={4}
                  />
                </div>
                {error && <p className="error-text">{error}</p>}
                <button 
                  className="btn-primary" 
                  onClick={handleConnectEcoCash}
                  disabled={isLoading}
                >
                  {isLoading ? 'Verifying...' : 'Verify & Connect'}
                </button>
                <button className="btn-secondary" onClick={() => setStep('phone')}>
                  Change Number
                </button>
              </div>
            )}

            {step === 'success' && (
              <div className="modal-body success-state">
                <div className="success-icon"><span className="material-symbols-outlined">check_circle</span></div>
                <h3>EcoCash Connected!</h3>
                <p>Your EcoCash account ({phoneNumber}) is now linked.</p>
                <p>You can now load funds and withdraw earnings.</p>
                <button className="btn-primary" onClick={resetConnectModal}>
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Load Funds Modal */}
      {showLoadFundsModal && (
        <div className="modal-overlay" onClick={resetLoadFundsModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2><span className="material-symbols-outlined">payments</span> Load Funds via EcoCash</h2>
              <button className="btn-close" onClick={resetLoadFundsModal}>✕</button>
            </div>

            {loadStep === 'amount' && (
              <div className="modal-body">
                <p className="modal-description">
                  Enter the amount you want to deposit from your EcoCash account.
                </p>
                <div className="form-group">
                  <label>Amount (USD)</label>
                  <div className="amount-input-wrapper">
                    <span className="currency">$</span>
                    <input
                      type="number"
                      value={loadAmount}
                      onChange={(e) => setLoadAmount(e.target.value)}
                      placeholder="0.00"
                      min="1"
                      max="1000"
                      step="0.01"
                    />
                  </div>
                  <span className="hint">Min: $1.00 | Max: $1,000.00</span>
                </div>
                <div className="quick-amounts">
                  {[10, 25, 50, 100].map(amt => (
                    <button key={amt} className="quick-amount" onClick={() => setLoadAmount(amt.toString())}>
                      ${amt}
                    </button>
                  ))}
                </div>
                {error && <p className="error-text">{error}</p>}
                <button 
                  className="btn-primary" 
                  onClick={handleLoadFunds}
                  disabled={!loadAmount || parseFloat(loadAmount) < 1}
                >
                  Continue
                </button>
              </div>
            )}

            {loadStep === 'confirm' && (
              <div className="modal-body">
                <div className="confirm-details">
                  <h3>Confirm Deposit</h3>
                  <div className="detail-row">
                    <span>Amount:</span>
                    <strong>${parseFloat(loadAmount).toFixed(2)}</strong>
                  </div>
                  <div className="detail-row">
                    <span>From:</span>
                    <strong>{walletData.ecocashNumber}</strong>
                  </div>
                  <div className="detail-row">
                    <span>Fee:</span>
                    <strong>$0.00</strong>
                  </div>
                  <div className="detail-row total">
                    <span>Total:</span>
                    <strong>${parseFloat(loadAmount).toFixed(2)}</strong>
                  </div>
                </div>
                <p className="info-text">
                  <span className="material-symbols-outlined">phone_android</span> You will receive an EcoCash USSD prompt on your phone. 
                  Enter your PIN to confirm the transaction.
                </p>
                <button 
                  className="btn-primary" 
                  onClick={handleLoadFunds}
                  disabled={isLoading}
                >
                  {isLoading ? 'Processing...' : 'Confirm & Pay'}
                </button>
                <button className="btn-secondary" onClick={() => setLoadStep('amount')}>
                  Back
                </button>
              </div>
            )}

            {loadStep === 'processing' && (
              <div className="modal-body processing-state">
                <div className="processing-spinner"></div>
                <h3>Processing Payment...</h3>
                <p>Please check your phone for the EcoCash prompt and enter your PIN.</p>
                <p className="small">Do not close this window.</p>
              </div>
            )}

            {loadStep === 'success' && (
              <div className="modal-body success-state">
                <div className="success-icon"><span className="material-symbols-outlined">check_circle</span></div>
                <h3>Deposit Successful!</h3>
                <p>${parseFloat(loadAmount).toFixed(2)} has been added to your wallet.</p>
                <div className="new-balance">
                  <span>New Balance:</span>
                  <strong>${walletData.balance.toFixed(2)}</strong>
                </div>
                <button className="btn-primary" onClick={resetLoadFundsModal}>
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div className="modal-overlay" onClick={() => setShowWithdrawModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2><span className="material-symbols-outlined">download</span> Withdraw to EcoCash</h2>
              <button className="btn-close" onClick={() => setShowWithdrawModal(false)}>✕</button>
            </div>

            <div className="modal-body">
              <div className="current-balance">
                <span>Available Balance:</span>
                <strong>${walletData.balance.toFixed(2)}</strong>
              </div>
              <div className="form-group">
                <label>Withdrawal Amount (USD)</label>
                <div className="amount-input-wrapper">
                  <span className="currency">$</span>
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="0.00"
                    min="1"
                    max={walletData.balance}
                    step="0.01"
                  />
                </div>
              </div>
              <div className="withdraw-to">
                <span>Withdraw to:</span>
                <strong><span className="material-symbols-outlined">phone_android</span> {walletData.ecocashNumber}</strong>
              </div>
              {error && <p className="error-text">{error}</p>}
              <button 
                className="btn-primary" 
                onClick={handleWithdraw}
                disabled={isLoading || !withdrawAmount || parseFloat(withdrawAmount) < 1 || parseFloat(withdrawAmount) > walletData.balance}
              >
                {isLoading ? 'Processing...' : `Withdraw $${withdrawAmount || '0.00'}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Gig Application Modal */}
      {showGigModal && selectedGig && (
        <div className="modal-overlay" onClick={() => { setShowGigModal(false); setSelectedGig(null); }}>
          <div className="modal-content gig-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2><span className="material-symbols-outlined">work</span> Apply for Gig</h2>
              <button className="btn-close" onClick={() => { setShowGigModal(false); setSelectedGig(null); }}>✕</button>
            </div>

            <div className="modal-body">
              <div className="gig-preview">
                <span className="gig-category">{selectedGig.category}</span>
                <h3>{selectedGig.title}</h3>
                <p>{selectedGig.description}</p>
                <div className="gig-details">
                  <div className="detail">
                    <span className="material-symbols-outlined">payments</span>
                    <span className="value">${selectedGig.reward}</span>
                    <span className="label">Reward</span>
                  </div>
                  <div className="detail">
                    <span className="material-symbols-outlined">schedule</span>
                    <span className="value">{selectedGig.estimatedTime}</span>
                    <span className="label">Est. Time</span>
                  </div>
                  <div className="detail">
                    <span className="material-symbols-outlined">event</span>
                    <span className="value">{new Date(selectedGig.deadline).toLocaleDateString()}</span>
                    <span className="label">Deadline</span>
                  </div>
                </div>
              </div>
              <div className="application-note">
                <span className="material-symbols-outlined">info</span>
                <p>By applying, you agree to complete this task by the deadline. Payment will be released upon successful completion and client approval.</p>
              </div>
              <button className="btn-primary" onClick={confirmGigApplication}>
                Confirm Application
              </button>
              <button className="btn-secondary" onClick={() => { setShowGigModal(false); setSelectedGig(null); }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Redeem Voucher Modal */}
      {showVoucherModal && (
        <div className="modal-overlay" onClick={() => { setShowVoucherModal(false); setVoucherCode(''); setError(''); }}>
          <div className="modal-content voucher-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2><span className="material-symbols-outlined">redeem</span> Redeem Voucher</h2>
              <button className="btn-close" onClick={() => { setShowVoucherModal(false); setVoucherCode(''); setError(''); }}>✕</button>
            </div>

            <div className="modal-body">
              <p className="modal-description">
                Enter your sponsorship voucher code to unlock funded learning opportunities.
              </p>
              <div className="form-group">
                <label>Voucher Code</label>
                <input
                  type="text"
                  value={voucherCode}
                  onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                  placeholder="e.g., ECONET2024"
                  className="voucher-input"
                />
              </div>
              {error && <p className="error-text">{error}</p>}
              <button className="btn-primary" onClick={handleRedeemVoucher}>
                Redeem Voucher
              </button>
              <div className="voucher-info">
                <span className="material-symbols-outlined">lightbulb</span>
                <p>Vouchers are provided by sponsors like Econet Wireless, TechStart, and more. Check your email or ask your sponsor for a code.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Book Tutoring Modal */}
      {showTutoringModal && (
        <div className="modal-overlay" onClick={() => setShowTutoringModal(false)}>
          <div className="modal-content tutoring-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2><span className="material-symbols-outlined">school</span> Book Tutoring Session</h2>
              <button className="btn-close" onClick={() => setShowTutoringModal(false)}>✕</button>
            </div>

            <div className="modal-body">
              <p className="modal-description">
                Connect with peer tutors for personalized learning support.
              </p>
              
              <div className="available-tutors">
                <h4>Available Tutors</h4>
                <div className="tutor-list">
                  <div className="tutor-card">
                    <div className="tutor-info">
                      <div className="tutor-avatar">TM</div>
                      <div className="tutor-details">
                        <h5>Tatenda Moyo</h5>
                        <p>Python, Data Science</p>
                        <div className="tutor-rating">
                          <span className="material-symbols-outlined">star</span>
                          4.9 (23 sessions)
                        </div>
                      </div>
                    </div>
                    <div className="tutor-rate">
                      <span>$15/hr</span>
                      <button className="book-tutor-btn">Book</button>
                    </div>
                  </div>
                  <div className="tutor-card">
                    <div className="tutor-info">
                      <div className="tutor-avatar">FC</div>
                      <div className="tutor-details">
                        <h5>Farai Chikwanha</h5>
                        <p>Web Development, JavaScript</p>
                        <div className="tutor-rating">
                          <span className="material-symbols-outlined">star</span>
                          4.8 (18 sessions)
                        </div>
                      </div>
                    </div>
                    <div className="tutor-rate">
                      <span>$12/hr</span>
                      <button className="book-tutor-btn">Book</button>
                    </div>
                  </div>
                  <div className="tutor-card">
                    <div className="tutor-info">
                      <div className="tutor-avatar">RN</div>
                      <div className="tutor-details">
                        <h5>Rumbidzai Nyoni</h5>
                        <p>UI/UX Design, Figma</p>
                        <div className="tutor-rating">
                          <span className="material-symbols-outlined">star</span>
                          5.0 (31 sessions)
                        </div>
                      </div>
                    </div>
                    <div className="tutor-rate">
                      <span>$18/hr</span>
                      <button className="book-tutor-btn">Book</button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="become-tutor">
                <span className="material-symbols-outlined">person_add</span>
                <div>
                  <h5>Become a Tutor</h5>
                  <p>Share your skills and earn money by tutoring others</p>
                </div>
                <button className="apply-tutor-btn">Apply</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
