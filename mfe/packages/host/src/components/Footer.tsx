import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 mt-auto">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between text-sm text-gray-400">
        <span>GymApp — Gym Management System</span>
        <span>{new Date().getFullYear()}</span>
      </div>
    </footer>
  );
}
