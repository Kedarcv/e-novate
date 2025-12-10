import React from 'react';
import { Link } from 'react-router-dom';
import './Notifications.scss';

const notifications = [
  {
    id: 1,
    type: 'job',
    title: 'New Job Match!',
    message: 'TechZim Solutions is hiring Junior Web Developers. 85% match with your skills!',
    time: '2 hours ago',
    read: false,
  },
  {
    id: 2,
    type: 'course',
    title: 'Continue Learning',
    message: 'You\'re 45% through Web Development. Keep going!',
    time: '5 hours ago',
    read: false,
  },
  {
    id: 3,
    type: 'achievement',
    title: 'Achievement Unlocked! 🎉',
    message: 'You earned 50 XP for completing the HTML module.',
    time: '1 day ago',
    read: true,
  },
  {
    id: 4,
    type: 'system',
    title: 'Welcome to Future Work Zimbabwe',
    message: 'Start your learning journey today and unlock job opportunities.',
    time: '2 days ago',
    read: true,
  },
];

const getIcon = (type: string) => {
  switch (type) {
    case 'job': return 'work';
    case 'course': return 'school';
    case 'achievement': return 'emoji_events';
    case 'system': return 'info';
    default: return 'notifications';
  }
};

export default function Notifications() {
  return (
    <div className="notifications-page">
      <div className="page-header">
        <Link to="/dashboard" className="back-btn">
          <span className="material-symbols-outlined">arrow_back</span>
          Back
        </Link>
        <h1>Notifications</h1>
        <button className="mark-all">Mark all as read</button>
      </div>

      <div className="notifications-list">
        {notifications.map((notif) => (
          <div key={notif.id} className={`notification-item ${notif.read ? 'read' : 'unread'}`}>
            <div className={`notif-icon ${notif.type}`}>
              <span className="material-symbols-outlined">{getIcon(notif.type)}</span>
            </div>
            <div className="notif-content">
              <h3>{notif.title}</h3>
              <p>{notif.message}</p>
              <span className="time">{notif.time}</span>
            </div>
            {!notif.read && <div className="unread-dot"></div>}
          </div>
        ))}
      </div>

      {notifications.length === 0 && (
        <div className="empty-state">
          <span className="material-symbols-outlined">notifications_off</span>
          <h3>No notifications</h3>
          <p>You're all caught up!</p>
        </div>
      )}
    </div>
  );
}
