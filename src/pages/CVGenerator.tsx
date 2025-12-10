import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import AnimatedBackground from '../components/animated-background/AnimatedBackground';
import './CVGenerator.scss';

interface CVData {
  // Personal Info
  fullName: string;
  headline: string;
  email: string;
  phone: string;
  location: string;
  website?: string;
  linkedin?: string;
  github?: string;
  profileSummary: string;
  
  // Experience
  experience: {
    title: string;
    company: string;
    location: string;
    startDate: string;
    endDate: string;
    current: boolean;
    description: string;
    achievements: string[];
  }[];
  
  // Education
  education: {
    institution: string;
    degree: string;
    field: string;
    startDate: string;
    endDate: string;
    grade?: string;
  }[];
  
  // Skills
  technicalSkills: string[];
  softSkills: string[];
  languages: { name: string; level: string }[];
  
  // Certifications
  certifications: {
    name: string;
    issuer: string;
    date: string;
  }[];
  
  // Projects
  projects: {
    name: string;
    description: string;
    technologies: string[];
  }[];
}

type CVTemplate = 'professional' | 'modern' | 'minimal' | 'creative';

export default function CVGenerator() {
  const navigate = useNavigate();
  const userName = localStorage.getItem('userName') || 'User';
  const cvPreviewRef = useRef<HTMLDivElement>(null);
  
  const [activeStep, setActiveStep] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState<CVTemplate>('professional');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  
  const [cvData, setCvData] = useState<CVData>({
    fullName: userName,
    headline: '',
    email: '',
    phone: '',
    location: 'Harare, Zimbabwe',
    website: '',
    linkedin: '',
    github: '',
    profileSummary: '',
    experience: [],
    education: [],
    technicalSkills: [],
    softSkills: [],
    languages: [{ name: 'English', level: 'Professional' }, { name: 'Shona', level: 'Native' }],
    certifications: [],
    projects: [],
  });

  const steps = [
    { id: 0, title: 'Personal Info', icon: 'person' },
    { id: 1, title: 'Experience', icon: 'work' },
    { id: 2, title: 'Education', icon: 'school' },
    { id: 3, title: 'Skills', icon: 'psychology' },
    { id: 4, title: 'Projects', icon: 'code' },
    { id: 5, title: 'Template', icon: 'palette' },
  ];

  const templates: { id: CVTemplate; name: string; description: string; preview: string }[] = [
    { id: 'professional', name: 'Professional', description: 'Clean and traditional layout perfect for corporate roles', preview: 'professional' },
    { id: 'modern', name: 'Modern', description: 'Contemporary design with bold sections and visual hierarchy', preview: 'modern' },
    { id: 'minimal', name: 'Minimal', description: 'Simple and elegant, focusing on content', preview: 'minimal' },
    { id: 'creative', name: 'Creative', description: 'Stand out with unique colors and layouts', preview: 'creative' },
  ];

  // Load from portfolio if available
  useEffect(() => {
    const portfolioData = localStorage.getItem('userPortfolio');
    if (portfolioData) {
      try {
        const portfolio = JSON.parse(portfolioData);
        setCvData(prev => ({
          ...prev,
          fullName: portfolio.name || prev.fullName,
          headline: portfolio.headline || prev.headline,
          email: portfolio.email || prev.email,
          phone: portfolio.phone || prev.phone,
          location: portfolio.location || prev.location,
          website: portfolio.website || prev.website,
          linkedin: portfolio.linkedin || prev.linkedin,
          github: portfolio.github || prev.github,
          profileSummary: portfolio.bio || prev.profileSummary,
          technicalSkills: portfolio.skills?.filter((s: any) => s.category === 'technical').map((s: any) => s.name) || [],
          softSkills: portfolio.skills?.filter((s: any) => s.category === 'soft').map((s: any) => s.name) || [],
          experience: portfolio.experience?.map((exp: any) => ({
            title: exp.title,
            company: exp.company,
            location: exp.location,
            startDate: exp.startDate,
            endDate: exp.endDate || '',
            current: exp.current,
            description: exp.description,
            achievements: [],
          })) || [],
          education: portfolio.education?.map((edu: any) => ({
            institution: edu.institution,
            degree: edu.degree,
            field: edu.field,
            startDate: edu.startDate,
            endDate: edu.endDate || '',
            grade: edu.grade,
          })) || [],
          certifications: portfolio.certifications?.map((cert: any) => ({
            name: cert.name,
            issuer: cert.issuer,
            date: cert.issueDate,
          })) || [],
          projects: portfolio.projects?.map((proj: any) => ({
            name: proj.title,
            description: proj.description,
            technologies: proj.technologies,
          })) || [],
        }));
      } catch (e) {
        console.error('Failed to load portfolio:', e);
      }
    }
  }, []);

  const generateAISuggestions = async (section: string) => {
    setIsGenerating(true);
    // Simulate AI suggestions
    setTimeout(() => {
      const suggestions: Record<string, string[]> = {
        profileSummary: [
          `Results-driven ${cvData.headline || 'professional'} with a passion for innovation and continuous learning. Proven track record of delivering high-quality solutions through the U2M platform.`,
          `Dynamic and detail-oriented developer skilled in modern technologies. Committed to creating impactful solutions and driving business growth.`,
          `Self-motivated learner with hands-on experience in software development. Eager to apply skills gained from U2M certifications to real-world challenges.`,
        ],
        achievements: [
          'Increased team productivity by 30% through process automation',
          'Successfully delivered 5+ projects on time and within budget',
          'Mentored 3 junior developers, improving team skill levels',
          'Reduced application load time by 40% through optimization',
        ],
      };
      setAiSuggestions(suggestions[section] || []);
      setIsGenerating(false);
    }, 1500);
  };

  const handleAddExperience = () => {
    setCvData(prev => ({
      ...prev,
      experience: [...prev.experience, {
        title: '',
        company: '',
        location: '',
        startDate: '',
        endDate: '',
        current: false,
        description: '',
        achievements: [],
      }],
    }));
  };

  const handleAddEducation = () => {
    setCvData(prev => ({
      ...prev,
      education: [...prev.education, {
        institution: '',
        degree: '',
        field: '',
        startDate: '',
        endDate: '',
        grade: '',
      }],
    }));
  };

  const handleAddProject = () => {
    setCvData(prev => ({
      ...prev,
      projects: [...prev.projects, {
        name: '',
        description: '',
        technologies: [],
      }],
    }));
  };

  const handleRemoveExperience = (index: number) => {
    setCvData(prev => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index),
    }));
  };

  const handleRemoveEducation = (index: number) => {
    setCvData(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index),
    }));
  };

  const handleRemoveProject = (index: number) => {
    setCvData(prev => ({
      ...prev,
      projects: prev.projects.filter((_, i) => i !== index),
    }));
  };

  const handleGenerateCV = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setShowPreview(true);
    }, 2000);
  };

  const handleDownloadCV = async () => {
    if (!cvPreviewRef.current) {
      // If preview isn't shown, show it first
      if (!showPreview) {
        setShowPreview(true);
        setTimeout(() => handleDownloadCV(), 500);
        return;
      }
      return;
    }

    setIsDownloading(true);

    try {
      const element = cvPreviewRef.current;
      
      // Create canvas from the CV preview
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      // Create PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      // Add first page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add additional pages if needed
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Download the PDF
      const fileName = `${cvData.fullName.replace(/\s+/g, '_')}_CV.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const renderStep = () => {
    switch (activeStep) {
      case 0:
        return (
          <div className="step-content personal-info">
            <h2><span className="material-symbols-outlined">person</span> Personal Information</h2>
            <p className="step-description">Let's start with your basic information. This will appear at the top of your CV.</p>
            
            <div className="form-grid">
              <div className="form-group full-width">
                <label>Full Name *</label>
                <input 
                  type="text" 
                  value={cvData.fullName}
                  onChange={(e) => setCvData(prev => ({ ...prev, fullName: e.target.value }))}
                  placeholder="e.g., John Moyo"
                />
              </div>
              
              <div className="form-group full-width">
                <label>Professional Headline *</label>
                <input 
                  type="text" 
                  value={cvData.headline}
                  onChange={(e) => setCvData(prev => ({ ...prev, headline: e.target.value }))}
                  placeholder="e.g., Full Stack Developer | Python Expert"
                />
              </div>
              
              <div className="form-group">
                <label>Email *</label>
                <input 
                  type="email" 
                  value={cvData.email}
                  onChange={(e) => setCvData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="john@example.com"
                />
              </div>
              
              <div className="form-group">
                <label>Phone *</label>
                <input 
                  type="tel" 
                  value={cvData.phone}
                  onChange={(e) => setCvData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+263 77 123 4567"
                />
              </div>
              
              <div className="form-group">
                <label>Location</label>
                <input 
                  type="text" 
                  value={cvData.location}
                  onChange={(e) => setCvData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="e.g., Harare, Zimbabwe"
                />
              </div>
              
              <div className="form-group">
                <label>Website (Optional)</label>
                <input 
                  type="url" 
                  value={cvData.website}
                  onChange={(e) => setCvData(prev => ({ ...prev, website: e.target.value }))}
                  placeholder="https://yoursite.com"
                />
              </div>
              
              <div className="form-group">
                <label>LinkedIn (Optional)</label>
                <input 
                  type="url" 
                  value={cvData.linkedin}
                  onChange={(e) => setCvData(prev => ({ ...prev, linkedin: e.target.value }))}
                  placeholder="linkedin.com/in/yourname"
                />
              </div>
              
              <div className="form-group">
                <label>GitHub (Optional)</label>
                <input 
                  type="url" 
                  value={cvData.github}
                  onChange={(e) => setCvData(prev => ({ ...prev, github: e.target.value }))}
                  placeholder="github.com/yourname"
                />
              </div>
              
              <div className="form-group full-width">
                <label>Professional Summary</label>
                <div className="textarea-with-ai">
                  <textarea 
                    value={cvData.profileSummary}
                    onChange={(e) => setCvData(prev => ({ ...prev, profileSummary: e.target.value }))}
                    placeholder="Write a brief summary of your professional background and goals..."
                    rows={4}
                  />
                  <button 
                    className="btn-ai-generate"
                    onClick={() => generateAISuggestions('profileSummary')}
                    disabled={isGenerating}
                  >
                    <span className="material-symbols-outlined">{isGenerating ? 'sync' : 'auto_awesome'}</span>
                    {isGenerating ? 'Generating...' : 'AI Suggest'}
                  </button>
                </div>
                
                {aiSuggestions.length > 0 && (
                  <div className="ai-suggestions">
                    <h4><span className="material-symbols-outlined">lightbulb</span> AI Suggestions</h4>
                    {aiSuggestions.map((suggestion, i) => (
                      <div 
                        key={i} 
                        className="suggestion-card"
                        onClick={() => {
                          setCvData(prev => ({ ...prev, profileSummary: suggestion }));
                          setAiSuggestions([]);
                        }}
                      >
                        <p>{suggestion}</p>
                        <button className="btn-use">Use This</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
        
      case 1:
        return (
          <div className="step-content experience">
            <h2><span className="material-symbols-outlined">work</span> Work Experience</h2>
            <p className="step-description">Add your work history, starting with your most recent position.</p>
            
            {cvData.experience.map((exp, index) => (
              <div key={index} className="experience-card">
                <div className="card-header">
                  <span>Experience {index + 1}</span>
                  <button className="btn-remove" onClick={() => handleRemoveExperience(index)}>
                    <span className="material-symbols-outlined">delete</span>
                  </button>
                </div>
                
                <div className="form-grid">
                  <div className="form-group">
                    <label>Job Title *</label>
                    <input 
                      type="text" 
                      value={exp.title}
                      onChange={(e) => {
                        const updated = [...cvData.experience];
                        updated[index].title = e.target.value;
                        setCvData(prev => ({ ...prev, experience: updated }));
                      }}
                      placeholder="e.g., Software Developer"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Company *</label>
                    <input 
                      type="text" 
                      value={exp.company}
                      onChange={(e) => {
                        const updated = [...cvData.experience];
                        updated[index].company = e.target.value;
                        setCvData(prev => ({ ...prev, experience: updated }));
                      }}
                      placeholder="e.g., Tech Solutions Zim"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Location</label>
                    <input 
                      type="text" 
                      value={exp.location}
                      onChange={(e) => {
                        const updated = [...cvData.experience];
                        updated[index].location = e.target.value;
                        setCvData(prev => ({ ...prev, experience: updated }));
                      }}
                      placeholder="e.g., Harare, Zimbabwe"
                    />
                  </div>
                  
                  <div className="form-group checkbox-inline">
                    <label>
                      <input 
                        type="checkbox" 
                        checked={exp.current}
                        onChange={(e) => {
                          const updated = [...cvData.experience];
                          updated[index].current = e.target.checked;
                          if (e.target.checked) updated[index].endDate = '';
                          setCvData(prev => ({ ...prev, experience: updated }));
                        }}
                      />
                      Currently working here
                    </label>
                  </div>
                  
                  <div className="form-group">
                    <label>Start Date</label>
                    <input 
                      type="month" 
                      value={exp.startDate}
                      onChange={(e) => {
                        const updated = [...cvData.experience];
                        updated[index].startDate = e.target.value;
                        setCvData(prev => ({ ...prev, experience: updated }));
                      }}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>End Date</label>
                    <input 
                      type="month" 
                      value={exp.endDate}
                      onChange={(e) => {
                        const updated = [...cvData.experience];
                        updated[index].endDate = e.target.value;
                        setCvData(prev => ({ ...prev, experience: updated }));
                      }}
                      disabled={exp.current}
                    />
                  </div>
                  
                  <div className="form-group full-width">
                    <label>Description</label>
                    <textarea 
                      value={exp.description}
                      onChange={(e) => {
                        const updated = [...cvData.experience];
                        updated[index].description = e.target.value;
                        setCvData(prev => ({ ...prev, experience: updated }));
                      }}
                      placeholder="Describe your responsibilities and achievements..."
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            ))}
            
            <button className="btn-add" onClick={handleAddExperience}>
              <span className="material-symbols-outlined">add</span> Add Experience
            </button>
          </div>
        );
        
      case 2:
        return (
          <div className="step-content education">
            <h2><span className="material-symbols-outlined">school</span> Education</h2>
            <p className="step-description">Add your educational background and certifications from U2M.</p>
            
            {cvData.education.map((edu, index) => (
              <div key={index} className="education-card">
                <div className="card-header">
                  <span>Education {index + 1}</span>
                  <button className="btn-remove" onClick={() => handleRemoveEducation(index)}>
                    <span className="material-symbols-outlined">delete</span>
                  </button>
                </div>
                
                <div className="form-grid">
                  <div className="form-group full-width">
                    <label>Institution *</label>
                    <input 
                      type="text" 
                      value={edu.institution}
                      onChange={(e) => {
                        const updated = [...cvData.education];
                        updated[index].institution = e.target.value;
                        setCvData(prev => ({ ...prev, education: updated }));
                      }}
                      placeholder="e.g., University of Zimbabwe"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Degree</label>
                    <input 
                      type="text" 
                      value={edu.degree}
                      onChange={(e) => {
                        const updated = [...cvData.education];
                        updated[index].degree = e.target.value;
                        setCvData(prev => ({ ...prev, education: updated }));
                      }}
                      placeholder="e.g., Bachelor of Science"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Field of Study</label>
                    <input 
                      type="text" 
                      value={edu.field}
                      onChange={(e) => {
                        const updated = [...cvData.education];
                        updated[index].field = e.target.value;
                        setCvData(prev => ({ ...prev, education: updated }));
                      }}
                      placeholder="e.g., Computer Science"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Start Year</label>
                    <input 
                      type="month" 
                      value={edu.startDate}
                      onChange={(e) => {
                        const updated = [...cvData.education];
                        updated[index].startDate = e.target.value;
                        setCvData(prev => ({ ...prev, education: updated }));
                      }}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>End Year</label>
                    <input 
                      type="month" 
                      value={edu.endDate}
                      onChange={(e) => {
                        const updated = [...cvData.education];
                        updated[index].endDate = e.target.value;
                        setCvData(prev => ({ ...prev, education: updated }));
                      }}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Grade (Optional)</label>
                    <input 
                      type="text" 
                      value={edu.grade}
                      onChange={(e) => {
                        const updated = [...cvData.education];
                        updated[index].grade = e.target.value;
                        setCvData(prev => ({ ...prev, education: updated }));
                      }}
                      placeholder="e.g., 2.1 Upper"
                    />
                  </div>
                </div>
              </div>
            ))}
            
            <button className="btn-add" onClick={handleAddEducation}>
              <span className="material-symbols-outlined">add</span> Add Education
            </button>
            
            {/* U2M Certifications */}
            <div className="certifications-section">
              <h3><span className="material-symbols-outlined">workspace_premium</span> U2M Certifications</h3>
              <p>Your certifications earned through U2M will be automatically included.</p>
              
              <div className="cert-list">
                {cvData.certifications.map((cert, i) => (
                  <div key={i} className="cert-item">
                    <span className="material-symbols-outlined">verified</span>
                    <div className="cert-info">
                      <span className="cert-name">{cert.name}</span>
                      <span className="cert-issuer">{cert.issuer} • {new Date(cert.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
                {cvData.certifications.length === 0 && (
                  <p className="no-certs">Complete courses on U2M to earn certifications!</p>
                )}
              </div>
            </div>
          </div>
        );
        
      case 3:
        return (
          <div className="step-content skills">
            <h2><span className="material-symbols-outlined">psychology</span> Skills</h2>
            <p className="step-description">Highlight your technical and soft skills to stand out.</p>
            
            <div className="skills-section">
              <h3>Technical Skills</h3>
              <div className="skills-input">
                <input 
                  type="text" 
                  placeholder="Add a skill and press Enter..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.currentTarget.value) {
                      setCvData(prev => ({
                        ...prev,
                        technicalSkills: [...prev.technicalSkills, e.currentTarget.value],
                      }));
                      e.currentTarget.value = '';
                    }
                  }}
                />
              </div>
              <div className="skills-tags">
                {cvData.technicalSkills.map((skill, i) => (
                  <span key={i} className="skill-tag">
                    {skill}
                    <button onClick={() => setCvData(prev => ({
                      ...prev,
                      technicalSkills: prev.technicalSkills.filter((_, idx) => idx !== i),
                    }))}>×</button>
                  </span>
                ))}
              </div>
              <div className="suggested-skills">
                <span className="label">Suggested:</span>
                {['JavaScript', 'Python', 'React', 'Node.js', 'SQL', 'Git'].map(skill => (
                  !cvData.technicalSkills.includes(skill) && (
                    <button 
                      key={skill} 
                      className="suggestion"
                      onClick={() => setCvData(prev => ({
                        ...prev,
                        technicalSkills: [...prev.technicalSkills, skill],
                      }))}
                    >
                      + {skill}
                    </button>
                  )
                ))}
              </div>
            </div>
            
            <div className="skills-section">
              <h3>Soft Skills</h3>
              <div className="skills-input">
                <input 
                  type="text" 
                  placeholder="Add a soft skill and press Enter..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.currentTarget.value) {
                      setCvData(prev => ({
                        ...prev,
                        softSkills: [...prev.softSkills, e.currentTarget.value],
                      }));
                      e.currentTarget.value = '';
                    }
                  }}
                />
              </div>
              <div className="skills-tags soft">
                {cvData.softSkills.map((skill, i) => (
                  <span key={i} className="skill-tag">
                    {skill}
                    <button onClick={() => setCvData(prev => ({
                      ...prev,
                      softSkills: prev.softSkills.filter((_, idx) => idx !== i),
                    }))}>×</button>
                  </span>
                ))}
              </div>
              <div className="suggested-skills">
                <span className="label">Suggested:</span>
                {['Leadership', 'Communication', 'Problem Solving', 'Teamwork', 'Time Management'].map(skill => (
                  !cvData.softSkills.includes(skill) && (
                    <button 
                      key={skill} 
                      className="suggestion"
                      onClick={() => setCvData(prev => ({
                        ...prev,
                        softSkills: [...prev.softSkills, skill],
                      }))}
                    >
                      + {skill}
                    </button>
                  )
                ))}
              </div>
            </div>
            
            <div className="skills-section languages">
              <h3>Languages</h3>
              {cvData.languages.map((lang, i) => (
                <div key={i} className="language-row">
                  <input 
                    type="text" 
                    value={lang.name}
                    onChange={(e) => {
                      const updated = [...cvData.languages];
                      updated[i].name = e.target.value;
                      setCvData(prev => ({ ...prev, languages: updated }));
                    }}
                    placeholder="Language"
                  />
                  <select 
                    value={lang.level}
                    onChange={(e) => {
                      const updated = [...cvData.languages];
                      updated[i].level = e.target.value;
                      setCvData(prev => ({ ...prev, languages: updated }));
                    }}
                  >
                    <option value="Native">Native</option>
                    <option value="Professional">Professional</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Basic">Basic</option>
                  </select>
                  <button 
                    className="btn-remove-lang"
                    onClick={() => setCvData(prev => ({
                      ...prev,
                      languages: prev.languages.filter((_, idx) => idx !== i),
                    }))}
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>
              ))}
              <button 
                className="btn-add-lang"
                onClick={() => setCvData(prev => ({
                  ...prev,
                  languages: [...prev.languages, { name: '', level: 'Professional' }],
                }))}
              >
                <span className="material-symbols-outlined">add</span> Add Language
              </button>
            </div>
          </div>
        );
        
      case 4:
        return (
          <div className="step-content projects">
            <h2><span className="material-symbols-outlined">code</span> Projects</h2>
            <p className="step-description">Showcase your best work and personal projects.</p>
            
            {cvData.projects.map((project, index) => (
              <div key={index} className="project-card">
                <div className="card-header">
                  <span>Project {index + 1}</span>
                  <button className="btn-remove" onClick={() => handleRemoveProject(index)}>
                    <span className="material-symbols-outlined">delete</span>
                  </button>
                </div>
                
                <div className="form-grid">
                  <div className="form-group full-width">
                    <label>Project Name *</label>
                    <input 
                      type="text" 
                      value={project.name}
                      onChange={(e) => {
                        const updated = [...cvData.projects];
                        updated[index].name = e.target.value;
                        setCvData(prev => ({ ...prev, projects: updated }));
                      }}
                      placeholder="e.g., E-Commerce Platform"
                    />
                  </div>
                  
                  <div className="form-group full-width">
                    <label>Description</label>
                    <textarea 
                      value={project.description}
                      onChange={(e) => {
                        const updated = [...cvData.projects];
                        updated[index].description = e.target.value;
                        setCvData(prev => ({ ...prev, projects: updated }));
                      }}
                      placeholder="Describe what you built and its impact..."
                      rows={3}
                    />
                  </div>
                  
                  <div className="form-group full-width">
                    <label>Technologies Used</label>
                    <input 
                      type="text" 
                      value={project.technologies.join(', ')}
                      onChange={(e) => {
                        const updated = [...cvData.projects];
                        updated[index].technologies = e.target.value.split(',').map(t => t.trim()).filter(Boolean);
                        setCvData(prev => ({ ...prev, projects: updated }));
                      }}
                      placeholder="e.g., React, Node.js, MongoDB (comma-separated)"
                    />
                  </div>
                </div>
              </div>
            ))}
            
            <button className="btn-add" onClick={handleAddProject}>
              <span className="material-symbols-outlined">add</span> Add Project
            </button>
          </div>
        );
        
      case 5:
        return (
          <div className="step-content template">
            <h2><span className="material-symbols-outlined">palette</span> Choose Template</h2>
            <p className="step-description">Select a template that best represents your professional brand.</p>
            
            <div className="templates-grid">
              {templates.map(template => (
                <div 
                  key={template.id}
                  className={`template-card ${selectedTemplate === template.id ? 'selected' : ''}`}
                  onClick={() => setSelectedTemplate(template.id)}
                >
                  <div className={`template-preview ${template.id}`}>
                    <div className="preview-header" />
                    <div className="preview-content">
                      <div className="preview-line" />
                      <div className="preview-line short" />
                      <div className="preview-line" />
                    </div>
                  </div>
                  <div className="template-info">
                    <h4>{template.name}</h4>
                    <p>{template.description}</p>
                  </div>
                  {selectedTemplate === template.id && (
                    <span className="check-badge">
                      <span className="material-symbols-outlined">check</span>
                    </span>
                  )}
                </div>
              ))}
            </div>
            
            <div className="generate-section">
              <button 
                className="btn-generate"
                onClick={handleGenerateCV}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <span className="material-symbols-outlined spinning">sync</span>
                    Generating CV...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined">auto_awesome</span>
                    Generate CV
                  </>
                )}
              </button>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="cv-generator-page">
      <AnimatedBackground variant="gradient" primaryColor="#3b82f6" secondaryColor="#1e1b4b" />
      
      {/* Header */}
      <header className="cv-header">
        <button className="btn-back" onClick={() => navigate('/portfolio')}>
          <span className="material-symbols-outlined">arrow_back</span> Back to Portfolio
        </button>
        <h1><span className="material-symbols-outlined">description</span> CV Generator</h1>
        <div className="header-actions">
          {showPreview && (
            <button className="btn-download" onClick={handleDownloadCV} disabled={isDownloading}>
              <span className="material-symbols-outlined">{isDownloading ? 'hourglass_empty' : 'download'}</span> 
              {isDownloading ? 'Generating...' : 'Download PDF'}
            </button>
          )}
        </div>
      </header>
      
      {/* Progress Steps */}
      <nav className="steps-nav">
        {steps.map((step, i) => (
          <div 
            key={step.id}
            className={`step ${activeStep === i ? 'active' : ''} ${activeStep > i ? 'completed' : ''}`}
            onClick={() => setActiveStep(i)}
          >
            <div className="step-indicator">
              {activeStep > i ? (
                <span className="material-symbols-outlined">check</span>
              ) : (
                <span className="material-symbols-outlined">{step.icon}</span>
              )}
            </div>
            <span className="step-title">{step.title}</span>
          </div>
        ))}
      </nav>
      
      {/* Main Content */}
      <main className="cv-content">
        {!showPreview ? (
          <>
            {renderStep()}
            
            <div className="nav-buttons">
              {activeStep > 0 && (
                <button className="btn-prev" onClick={() => setActiveStep(prev => prev - 1)}>
                  <span className="material-symbols-outlined">arrow_back</span> Previous
                </button>
              )}
              {activeStep < steps.length - 1 && (
                <button className="btn-next" onClick={() => setActiveStep(prev => prev + 1)}>
                  Next <span className="material-symbols-outlined">arrow_forward</span>
                </button>
              )}
            </div>
          </>
        ) : (
          <div className="cv-preview">
            <div className="preview-actions">
              <button className="btn-edit-cv" onClick={() => setShowPreview(false)}>
                <span className="material-symbols-outlined">edit</span> Edit CV
              </button>
              <button className="btn-download-cv" onClick={handleDownloadCV} disabled={isDownloading}>
                <span className="material-symbols-outlined">{isDownloading ? 'hourglass_empty' : 'download'}</span> 
                {isDownloading ? 'Generating PDF...' : 'Download PDF'}
              </button>
              <button className="btn-share-cv">
                <span className="material-symbols-outlined">share</span> Share
              </button>
            </div>
            
            <div ref={cvPreviewRef} className={`cv-document ${selectedTemplate}`}>
              <div className="cv-header-section">
                <h1>{cvData.fullName}</h1>
                <p className="headline">{cvData.headline}</p>
                <div className="contact-info">
                  <span><span className="material-symbols-outlined">mail</span> {cvData.email}</span>
                  <span><span className="material-symbols-outlined">phone</span> {cvData.phone}</span>
                  <span><span className="material-symbols-outlined">location_on</span> {cvData.location}</span>
                </div>
              </div>
              
              {cvData.profileSummary && (
                <div className="cv-section">
                  <h2>Professional Summary</h2>
                  <p>{cvData.profileSummary}</p>
                </div>
              )}
              
              {cvData.experience.length > 0 && (
                <div className="cv-section">
                  <h2>Experience</h2>
                  {cvData.experience.map((exp, i) => (
                    <div key={i} className="cv-item">
                      <div className="item-header">
                        <strong>{exp.title}</strong>
                        <span className="dates">{exp.startDate} - {exp.current ? 'Present' : exp.endDate}</span>
                      </div>
                      <p className="company">{exp.company} • {exp.location}</p>
                      <p className="description">{exp.description}</p>
                    </div>
                  ))}
                </div>
              )}
              
              {cvData.education.length > 0 && (
                <div className="cv-section">
                  <h2>Education</h2>
                  {cvData.education.map((edu, i) => (
                    <div key={i} className="cv-item">
                      <div className="item-header">
                        <strong>{edu.degree} in {edu.field}</strong>
                        <span className="dates">{edu.startDate} - {edu.endDate}</span>
                      </div>
                      <p className="institution">{edu.institution}</p>
                      {edu.grade && <p className="grade">Grade: {edu.grade}</p>}
                    </div>
                  ))}
                </div>
              )}
              
              {(cvData.technicalSkills.length > 0 || cvData.softSkills.length > 0) && (
                <div className="cv-section skills">
                  <h2>Skills</h2>
                  {cvData.technicalSkills.length > 0 && (
                    <p><strong>Technical:</strong> {cvData.technicalSkills.join(', ')}</p>
                  )}
                  {cvData.softSkills.length > 0 && (
                    <p><strong>Soft Skills:</strong> {cvData.softSkills.join(', ')}</p>
                  )}
                </div>
              )}
              
              {cvData.certifications.length > 0 && (
                <div className="cv-section">
                  <h2>Certifications</h2>
                  {cvData.certifications.map((cert, i) => (
                    <div key={i} className="cv-cert">
                      <span className="cert-name">{cert.name}</span> - {cert.issuer} ({new Date(cert.date).getFullYear()})
                    </div>
                  ))}
                </div>
              )}
              
              {cvData.projects.length > 0 && (
                <div className="cv-section">
                  <h2>Projects</h2>
                  {cvData.projects.map((proj, i) => (
                    <div key={i} className="cv-item">
                      <strong>{proj.name}</strong>
                      <p className="description">{proj.description}</p>
                      {proj.technologies.length > 0 && (
                        <p className="tech"><em>Technologies: {proj.technologies.join(', ')}</em></p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
