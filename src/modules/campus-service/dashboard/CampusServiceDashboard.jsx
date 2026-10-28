import React from 'react';
import StudentFacultyDashboard from '../../services/screens/StudentFacultyDashboard';

export default function CampusServiceDashboard(props) {
  return <StudentFacultyDashboard {...props} role="SERVICES" from="services" />;
}
