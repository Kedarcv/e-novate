import React, { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Job, jobs } from './Jobs';
import './JobApplication.scss';

interface ApplicationForm {
  fullName: string;
  email: string;
  phone: string;
  coverLetter: string;
  resumeFile: File | null;
  portfolioUrl: string;
  yearsExperience: string;
  availability: string;
  expectedSalary: string;
}

export default function JobApplication() {
  const { jobId } = useParams<{ jobId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get job from location state or find from jobs array
  const job: Job | undefined = location.state?.job || jobs.find(j => j.id === Number(jobId));

  const [form, setForm] = useState<ApplicationForm>({
    fullName: '',
    email: '',
    phone: '',
    coverLetter: '',
    resumeFile: null,
    portfolioUrl: '',
    yearsExperience: '',
    availability: 'immediate',
    expectedSalary: '',
  });

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!job) {
    return (
      <div className="job-application-page">
        <div className="error-state">
          <span className="material-symbols-outlined">error</span>
          <h2>Job Not Found</h2>
          <p>The job you're looking for doesn't exist.</p>
          <button onClick={() => navigate('/jobs')} className="back-btn-primary">
            Back to Jobs
          </button>
        </div>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setForm({ ...form, resumeFile: e.target.files[0] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  const isStep1Valid = form.fullName && form.email && form.phone;
  const isStep2Valid = form.coverLetter.length >= 50;
  const isStep3Valid = form.yearsExperience && form.availability;

  if (isSubmitted) {
    return (
      <div className="job-application-page">
        <div className="success-state">
          <div className="success-icon">
            <span className="material-symbols-outlined">check_circle</span>
          </div>
          <h2>Application Submitted!</h2>
          <p>Your application for <strong>{job.title}</strong> at <strong>{job.company}</strong> has been submitted successfully.</p>
          <div className="success-details">
            <div className="detail-item">
              <span className="material-symbols-outlined">schedule</span>
              <span>We'll review your application within 3-5 business days</span>
            </div>
            <div className="detail-item">
              <span className="material-symbols-outlined">mail</span>
              <span>Check your email for confirmation</span>
            </div>
          </div>
          <div className="success-actions">
            <button onClick={() => navigate('/jobs')} className="primary-btn">
              Browse More Jobs
            </button>
            <button onClick={() => navigate('/dashboard')} className="secondary-btn">
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="job-application-page">
      <header className="application-header">
        <button className="back-btn" onClick={() => navigate('/jobs')}>
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div className="header-info">
          <h1>Apply for Job</h1>
          <p>Step {step} of 3</p>
        </div>
      </header>

      {/* Job Summary Card */}
      <div className="job-summary">
        <div className="job-info">
          <h2>{job.title}</h2>
          <p className="company">{job.company}</p>
          <div className="job-meta">
            <span><span className="material-symbols-outlined">location_on</span> {job.location}</span>
            <span><span className="material-symbols-outlined">payments</span> {job.salary}</span>
          </div>
        </div>
        <span className="job-type">{job.type}</span>
      </div>

      {/* Progress Indicator */}
      <div className="progress-steps">
        <div className={`step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
          <div className="step-dot">
            {step > 1 ? <span className="material-symbols-outlined">check</span> : '1'}
          </div>
          <span>Personal Info</span>
        </div>
        <div className="step-line"></div>
        <div className={`step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
          <div className="step-dot">
            {step > 2 ? <span className="material-symbols-outlined">check</span> : '2'}
          </div>
          <span>Cover Letter</span>
        </div>
        <div className="step-line"></div>
        <div className={`step ${step >= 3 ? 'active' : ''}`}>
          <div className="step-dot">3</div>
          <span>Details</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="application-form">
        {/* Step 1: Personal Information */}
        {step === 1 && (
          <div className="form-step">
            <h3>Personal Information</h3>
            <p className="step-description">Tell us about yourself</p>

            <div className="form-group">
              <label htmlFor="fullName">
                <span className="material-symbols-outlined">person</span>
                Full Name *
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={form.fullName}
                onChange={handleInputChange}
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">
                <span className="material-symbols-outlined">mail</span>
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={form.email}
                onChange={handleInputChange}
                placeholder="your.email@example.com"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">
                <span className="material-symbols-outlined">phone</span>
                Phone Number *
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={form.phone}
                onChange={handleInputChange}
                placeholder="+263 77 XXX XXXX"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="portfolioUrl">
                <span className="material-symbols-outlined">link</span>
                Portfolio / LinkedIn URL (Optional)
              </label>
              <input
                type="url"
                id="portfolioUrl"
                name="portfolioUrl"
                value={form.portfolioUrl}
                onChange={handleInputChange}
                placeholder="https://yourportfolio.com"
              />
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="next-btn"
                onClick={() => setStep(2)}
                disabled={!isStep1Valid}
              >
                Continue
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Cover Letter & Resume */}
        {step === 2 && (
          <div className="form-step">
            <h3>Cover Letter & Resume</h3>
            <p className="step-description">Tell us why you're a great fit</p>

            <div className="form-group">
              <label htmlFor="coverLetter">
                <span className="material-symbols-outlined">edit_note</span>
                Cover Letter *
              </label>
              <textarea
                id="coverLetter"
                name="coverLetter"
                value={form.coverLetter}
                onChange={handleInputChange}
                placeholder="Tell us why you're interested in this position and what makes you a great candidate..."
                rows={6}
                required
              />
              <span className="char-count">{form.coverLetter.length} / 50 minimum characters</span>
            </div>

            <div className="form-group">
              <label htmlFor="resume">
                <span className="material-symbols-outlined">upload_file</span>
                Upload Resume (Optional)
              </label>
              <div className="file-upload">
                <input
                  type="file"
                  id="resume"
                  name="resume"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx"
                />
                <div className="file-upload-label">
                  <span className="material-symbols-outlined">cloud_upload</span>
                  <span>{form.resumeFile ? form.resumeFile.name : 'Click to upload PDF, DOC, or DOCX'}</span>
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button type="button" className="back-btn-secondary" onClick={() => setStep(1)}>
                <span className="material-symbols-outlined">arrow_back</span>
                Back
              </button>
              <button
                type="button"
                className="next-btn"
                onClick={() => setStep(3)}
                disabled={!isStep2Valid}
              >
                Continue
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Additional Details */}
        {step === 3 && (
          <div className="form-step">
            <h3>Additional Details</h3>
            <p className="step-description">Help us understand your availability</p>

            <div className="form-group">
              <label htmlFor="yearsExperience">
                <span className="material-symbols-outlined">work_history</span>
                Years of Experience *
              </label>
              <select
                id="yearsExperience"
                name="yearsExperience"
                value={form.yearsExperience}
                onChange={handleInputChange}
                required
              >
                <option value="">Select experience level</option>
                <option value="0-1">0-1 years</option>
                <option value="1-2">1-2 years</option>
                <option value="2-5">2-5 years</option>
                <option value="5+">5+ years</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="availability">
                <span className="material-symbols-outlined">calendar_today</span>
                Availability *
              </label>
              <select
                id="availability"
                name="availability"
                value={form.availability}
                onChange={handleInputChange}
                required
              >
                <option value="immediate">Immediate</option>
                <option value="2-weeks">2 Weeks Notice</option>
                <option value="1-month">1 Month Notice</option>
                <option value="negotiable">Negotiable</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="expectedSalary">
                <span className="material-symbols-outlined">attach_money</span>
                Expected Salary (Optional)
              </label>
              <input
                type="text"
                id="expectedSalary"
                name="expectedSalary"
                value={form.expectedSalary}
                onChange={handleInputChange}
                placeholder="e.g., $400-500/month"
              />
            </div>

            <div className="form-actions">
              <button type="button" className="back-btn-secondary" onClick={() => setStep(2)}>
                <span className="material-symbols-outlined">arrow_back</span>
                Back
              </button>
              <button
                type="submit"
                className="submit-btn"
                disabled={!isStep3Valid || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner"></span>
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit Application
                    <span className="material-symbols-outlined">send</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </form>

      {/* Job Description Section */}
      <div className="job-details-section">
        <h3>About This Role</h3>
        <p>{job.description}</p>

        {job.requirements && (
          <>
            <h4>Requirements</h4>
            <ul>
              {job.requirements.map((req, i) => (
                <li key={i}>
                  <span className="material-symbols-outlined">check_circle</span>
                  {req}
                </li>
              ))}
            </ul>
          </>
        )}

        {job.benefits && (
          <>
            <h4>Benefits</h4>
            <ul className="benefits-list">
              {job.benefits.map((benefit, i) => (
                <li key={i}>
                  <span className="material-symbols-outlined">stars</span>
                  {benefit}
                </li>
              ))}
            </ul>
          </>
        )}

        <div className="skills-required">
          <h4>Skills Required</h4>
          <div className="skills">
            {job.skills.map((skill, i) => (
              <span key={i} className="skill-tag">{skill}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
