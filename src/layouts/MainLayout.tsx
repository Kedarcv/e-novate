import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import './MainLayout.scss';

export default function MainLayout() {
  return (
    <div className="main-layout">
      <aside className="sidebar">
        <div className="logo-area">
          <img src="/econet-logo.png" alt="Econet" className="econet-logo" />
          <h1>U2M<br/><span>Unyanzvi 2 Mari</span></h1>
        </div>
        <nav>
          <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'active' : ''} end>
            <span className="material-symbols-outlined">dashboard</span>
            Dashboard
          </NavLink>
          <NavLink to="/learn" className={({ isActive }) => isActive ? 'active' : ''}>
            <span className="material-symbols-outlined">school</span>
            Learn
          </NavLink>
          <NavLink to="/certify" className={({ isActive }) => isActive ? 'active' : ''}>
            <span className="material-symbols-outlined">verified</span>
            Certify
          </NavLink>
          <NavLink to="/jobs" className={({ isActive }) => isActive ? 'active' : ''}>
            <span className="material-symbols-outlined">work</span>
            Jobs
          </NavLink>
          <NavLink to="/connect" className={({ isActive }) => isActive ? 'active' : ''}>
            <span className="material-symbols-outlined">groups</span>
            Connect
          </NavLink>
          <NavLink to="/wallet" className={({ isActive }) => isActive ? 'active' : ''}>
            <span className="material-symbols-outlined">account_balance_wallet</span>
            Wallet
          </NavLink>
          <div className="nav-divider"></div>
          <NavLink to="/client" className={({ isActive }) => isActive ? 'active' : ''}>
            <span className="material-symbols-outlined">business</span>
            Client Portal
          </NavLink>
        </nav>
        <div className="user-profile">
          <div className="avatar">MN</div>
          <div className="info">
            <span className="name">M. Nkomo</span>
            <span className="role">Learner</span>
          </div>
        </div>
      </aside>
      <main className="content-area">
        <header className="top-bar">
          <div className="search-bar">
            <span className="material-symbols-outlined">search</span>
            <input type="text" placeholder="Search skills, jobs, mentors..." />
          </div>
          <div className="actions">
            <button className="icon-btn"><span className="material-symbols-outlined">notifications</span></button>
            <button className="icon-btn"><span className="material-symbols-outlined">settings</span></button>
          </div>
        </header>
        <div className="page-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
