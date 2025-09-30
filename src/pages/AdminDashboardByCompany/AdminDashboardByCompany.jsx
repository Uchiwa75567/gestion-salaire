import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../services/api';

const AdminDashboardByCompany = () => {
  const { companyId } = useParams();
  const [company, setCompany] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [payruns, setPayruns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        setLoading(true);
        // Fetch company details
        const companyRes = await api.get(`/company/${companyId}`);
        setCompany(companyRes.data);

        // Fetch employees for this company
        const employeesRes = await api.get('/employees', {
          params: { companyId }
        });
        setEmployees(employeesRes.data || []);

        // Fetch payruns for this company
        const payrunsRes = await api.get('/payruns', {
          params: { companyId }
        });
        setPayruns(payrunsRes.data || []);
      } catch (err) {
        console.error('Failed to fetch admin dashboard data:', err);
        setError('Failed to load admin dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyData();
  }, [companyId]);

  if (loading) {
    return <div className="p-6">Loading admin dashboard...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-600">{error}</div>;
  }

  if (!company) {
    return <div className="p-6">Company not found.</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard for {company.name}</h1>
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Employees ({employees.length})</h2>
        <ul className="list-disc list-inside">
          {employees.map(emp => (
            <li key={emp.id}>{emp.fullName} - {emp.position}</li>
          ))}
        </ul>
      </section>
      <section>
        <h2 className="text-xl font-semibold mb-2">Pay Runs ({payruns.length})</h2>
        <ul className="list-disc list-inside">
          {payruns.map(pr => (
            <li key={pr.id}>{pr.name} - {new Date(pr.startDate).toLocaleDateString()} to {new Date(pr.endDate).toLocaleDateString()}</li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default AdminDashboardByCompany;
