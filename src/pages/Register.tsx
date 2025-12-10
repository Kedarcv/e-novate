import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDatabase } from '../contexts/DatabaseContext';
import AnimatedBackground from '../components/animated-background/AnimatedBackground';
import './Register.scss';

interface FormData {
  name: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
  role: 'student' | 'client' | 'admin';
  agreeToTerms: boolean;
}

interface FormErrors {
  name?: string;
  email?: string;
  phoneNumber?: string;
  password?: string;
  confirmPassword?: string;
  agreeToTerms?: string;
  general?: string;
}

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useDatabase();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    agreeToTerms: false
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);

  const validateStep1 = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (formData.phoneNumber && !/^\+?[\d\s-]{10,}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and number';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep2()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3001/api'}/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phoneNumber: formData.phoneNumber || undefined,
          password: formData.password,
          role: formData.role
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      // Store token
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('userRole', data.user.role);

      // Login via context
      await login(formData.email);

      // Redirect based on role
      switch (data.user.role) {
        case 'admin':
          navigate('/admin');
          break;
        case 'client':
          navigate('/client-portal');
          break;
        default:
          navigate('/dashboard');
      }
    } catch (error: any) {
      setErrors({ general: error.message || 'Registration failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleRoleSelect = (role: 'student' | 'client' | 'admin') => {
    setFormData(prev => ({ ...prev, role }));
  };

  const getPasswordStrength = (): { strength: number; label: string; color: string } => {
    const password = formData.password;
    let strength = 0;

    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;

    if (strength <= 2) return { strength, label: 'Weak', color: '#ef4444' };
    if (strength <= 3) return { strength, label: 'Medium', color: '#f59e0b' };
    if (strength <= 4) return { strength, label: 'Strong', color: '#22c55e' };
    return { strength, label: 'Very Strong', color: '#10b981' };
  };

  const passwordStrength = getPasswordStrength();

  return (
    <div className="register-page">
      <AnimatedBackground variant="neural" />

      <div className="register-container">
        <div className="register-header">
          <div className="logo">
            <img src="/econet-logo.png" alt="Econet" className="econet-logo" />
            <span className="logo-text">U2M</span>
          </div>
          <h1>Create Your Account</h1>
          <p>Join thousands of learners on their journey to success</p>
        </div>

        <div className="progress-indicator">
          <div className={`step ${step >= 1 ? 'active' : ''}`}>
            <span className="step-number">1</span>
            <span className="step-label">Profile</span>
          </div>
          <div className="step-line" />
          <div className={`step ${step >= 2 ? 'active' : ''}`}>
            <span className="step-number">2</span>
            <span className="step-label">Security</span>
          </div>
        </div>

        {errors.general && (
          <div className="error-banner">
            <span className="material-symbols-outlined error-icon">warning</span>
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} className="register-form">
          {step === 1 && (
            <div className="form-step step-1">
              <div className="role-selector">
                <h3>I am a...</h3>
                <div className="role-options">
                  <button
                    type="button"
                    className={`role-option ${formData.role === 'student' ? 'selected' : ''}`}
                    onClick={() => handleRoleSelect('student')}
                  >
                    <span className="material-symbols-outlined role-icon">school</span>
                    <span className="role-title">Student</span>
                    <span className="role-desc">Learn new skills & earn certifications</span>
                  </button>
                  <button
                    type="button"
                    className={`role-option ${formData.role === 'client' ? 'selected' : ''}`}
                    onClick={() => handleRoleSelect('client')}
                  >
                    <span className="material-symbols-outlined role-icon">business_center</span>
                    <span className="role-title">Client/Employer</span>
                    <span className="role-desc">Hire talent & post job opportunities</span>
                  </button>
                  <button
                    type="button"
                    className={`role-option ${formData.role === 'admin' ? 'selected' : ''}`}
                    onClick={() => handleRoleSelect('admin')}
                  >
                    <span className="material-symbols-outlined role-icon">settings</span>
                    <span className="role-title">Administrator</span>
                    <span className="role-desc">Manage platform & create content</span>
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <div className="input-wrapper">
                  <span className="material-symbols-outlined input-icon">person</span>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    className={errors.name ? 'error' : ''}
                  />
                </div>
                {errors.name && <span className="error-message">{errors.name}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <div className="input-wrapper">
                  <span className="material-symbols-outlined input-icon">mail</span>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    className={errors.email ? 'error' : ''}
                  />
                </div>
                {errors.email && <span className="error-message">{errors.email}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="phoneNumber">Phone Number (Optional)</label>
                <div className="input-wrapper">
                  <span className="material-symbols-outlined input-icon">phone_android</span>
                  <input
                    type="tel"
                    id="phoneNumber"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    placeholder="+263 77 123 4567"
                    className={errors.phoneNumber ? 'error' : ''}
                  />
                </div>
                {errors.phoneNumber && <span className="error-message">{errors.phoneNumber}</span>}
              </div>

              <button type="button" className="btn-primary" onClick={handleNext}>
                Continue
                <span className="btn-arrow">→</span>
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="form-step step-2">
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className="input-wrapper">
                  <span className="material-symbols-outlined input-icon">lock</span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create a strong password"
                    className={errors.password ? 'error' : ''}
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <span className="material-symbols-outlined">{showPassword ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
                {formData.password && (
                  <div className="password-strength">
                    <div className="strength-bars">
                      {[1, 2, 3, 4, 5].map(i => (
                        <div
                          key={i}
                          className={`strength-bar ${i <= passwordStrength.strength ? 'filled' : ''}`}
                          style={{ backgroundColor: i <= passwordStrength.strength ? passwordStrength.color : undefined }}
                        />
                      ))}
                    </div>
                    <span className="strength-label" style={{ color: passwordStrength.color }}>
                      {passwordStrength.label}
                    </span>
                  </div>
                )}
                {errors.password && <span className="error-message">{errors.password}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <div className="input-wrapper">
                  <span className="material-symbols-outlined input-icon">lock</span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm your password"
                    className={errors.confirmPassword ? 'error' : ''}
                  />
                </div>
                {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
              </div>

              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onChange={handleChange}
                  />
                  <span className="checkmark" />
                  <span>
                    I agree to the <Link to="/terms">Terms of Service</Link> and{' '}
                    <Link to="/privacy">Privacy Policy</Link>
                  </span>
                </label>
                {errors.agreeToTerms && <span className="error-message">{errors.agreeToTerms}</span>}
              </div>

              <div className="button-group">
                <button type="button" className="btn-secondary" onClick={() => setStep(1)}>
                  <span className="btn-arrow">←</span>
                  Back
                </button>
                <button type="submit" className="btn-primary" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <span className="spinner" />
                      Creating Account...
                    </>
                  ) : (
                    <>
                      Create Account
                      <span className="btn-arrow">→</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </form>

        <div className="register-footer">
          <p>
            Already have an account? <Link to="/login">Sign In</Link>
          </p>
        </div>

        <div className="social-login">
          <div className="divider">
            <span>or continue with</span>
          </div>
          <div className="social-buttons">
            <button type="button" className="social-btn google">
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Google
            </button>
            <button type="button" className="social-btn github">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              GitHub
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
