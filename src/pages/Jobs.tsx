import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Jobs.scss';

export interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  skills: string[];
  postedDays: number;
  description?: string;
  requirements?: string[];
  benefits?: string[];
}

export const jobs: Job[] = [
  {
    id: 1,
    title: 'Junior Web Developer',
    company: 'TechZim Solutions',
    location: 'Harare (Remote)',
    type: 'Full-time',
    salary: '$400-600/month',
    skills: ['React', 'JavaScript', 'CSS'],
    postedDays: 2,
    description: 'We are looking for a passionate Junior Web Developer to join our team. You will work on exciting projects using modern web technologies.',
    requirements: ['Basic knowledge of HTML, CSS, JavaScript', 'Familiarity with React or similar framework', 'Strong problem-solving skills', 'Good communication skills'],
    benefits: ['Remote work flexibility', 'Learning & development budget', 'Health insurance', 'Performance bonuses'],
  },
  {
    id: 2,
    title: 'Data Entry Specialist',
    company: 'FinServe Africa',
    location: 'Bulawayo (On-site)',
    type: 'Part-time',
    salary: '$150-250/month',
    skills: ['Excel', 'Data Entry', 'Typing'],
    postedDays: 5,
    description: 'Join our data management team to help process and organize critical business information.',
    requirements: ['Proficiency in Microsoft Excel', 'Typing speed of 50+ WPM', 'Attention to detail', 'High school diploma or equivalent'],
    benefits: ['Flexible hours', 'Training provided', 'Career advancement opportunities'],
  },
  {
    id: 3,
    title: 'Social Media Manager',
    company: 'GrowZim Marketing',
    location: 'Remote',
    type: 'Remote',
    salary: '$300-400/month',
    skills: ['Social Media', 'Content Creation', 'Analytics'],
    postedDays: 1,
    description: 'Manage social media presence for multiple clients and create engaging content strategies.',
    requirements: ['Experience with major social platforms', 'Content creation skills', 'Understanding of analytics tools', 'Creative mindset'],
    benefits: ['100% remote work', 'Creative freedom', 'Portfolio building opportunities'],
  },
  {
    id: 4,
    title: 'AI Data Annotator',
    company: 'GlobalAI Labs',
    location: 'Remote (Global)',
    type: 'Freelance',
    salary: '$5-10/hour',
    skills: ['AI Basics', 'Attention to Detail', 'English'],
    postedDays: 3,
    description: 'Help train AI models by annotating and labeling data with high accuracy.',
    requirements: ['Strong attention to detail', 'Good English proficiency', 'Basic understanding of AI concepts', 'Reliable internet connection'],
    benefits: ['Work from anywhere', 'Flexible schedule', 'Learn about AI/ML'],
  },
  {
    id: 5,
    title: 'Customer Support Representative',
    company: 'EcoServices Zim',
    location: 'Harare (On-site)',
    type: 'Full-time',
    salary: '$250-350/month',
    skills: ['Communication', 'Problem Solving', 'CRM'],
    postedDays: 4,
    description: 'Provide excellent customer service and support to our growing customer base.',
    requirements: ['Excellent verbal communication', 'Customer service experience', 'Computer literacy', 'Patience and empathy'],
    benefits: ['Health benefits', 'Transport allowance', 'Performance bonuses'],
  },
];

export default function Jobs() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('All');
  const hasCertification = true;

  const filters = ['All', 'Full-time', 'Part-time', 'Remote', 'Freelance'];

  const filteredJobs = activeFilter === 'All' 
    ? jobs 
    : jobs.filter(job => job.type === activeFilter);

  const handleApply = (job: Job) => {
    navigate(`/jobs/apply/${job.id}`, { state: { job } });
  };

  if (!hasCertification) {
    return (
      <div className="jobs-page locked">
        <Link to="/dashboard" className="back-btn">
          <span className="material-symbols-outlined">arrow_back</span>
          Back
        </Link>
        <div className="lock-overlay">
          <span className="material-symbols-outlined">lock</span>
          <h2>Jobs Locked</h2>
          <p>Complete a certification to access job opportunities.</p>
          <Link to="/certify" className="unlock-btn">Get Certified</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="jobs-page">
      <div className="page-header">
        <h1>Job Opportunities</h1>
        <p>Explore job openings matched to your skills.</p>
      </div>

      <div className="filters">
        {filters.map((filter) => (
          <button 
            key={filter}
            className={`filter-btn ${activeFilter === filter ? 'active' : ''}`}
            onClick={() => setActiveFilter(filter)}
          >
            {filter}
          </button>
        ))}
      </div>

      <div className="jobs-list">
        {filteredJobs.map((job) => (
          <div key={job.id} className="job-card">
            <div className="job-header">
              <div>
                <h3>{job.title}</h3>
                <p className="company">{job.company}</p>
              </div>
              <span className="job-type">{job.type}</span>
            </div>
            
            <div className="job-meta">
              <span><span className="material-symbols-outlined">location_on</span> {job.location}</span>
              <span><span className="material-symbols-outlined">payments</span> {job.salary}</span>
            </div>

            <div className="skills">
              {job.skills.map((skill, i) => (
                <span key={i} className="skill-tag">{skill}</span>
              ))}
            </div>

            <div className="job-footer">
              <span className="posted">Posted {job.postedDays} days ago</span>
              <button className="apply-btn" onClick={() => handleApply(job)}>Apply Now</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
