import { useState, useEffect } from 'react';
import { GraduationCap, Search, Plus, Filter, Edit, Trash2, X } from 'lucide-react';
import { api } from '../../services/api';

interface Department {
  id: string;
  name: string;
  code: string;
}

interface Year {
  id: string;
  department_id: string;
  year_level: number;
  sections_count: number;
}

export default function AdminYears() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDeptId, setSelectedDeptId] = useState<string>('');
  const [years, setYears] = useState<Year[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingYear, setEditingYear] = useState<Year | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    department_id: '',
    year_level: 1
  });

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    if (selectedDeptId) {
      fetchYears(selectedDeptId);
    } else {
      setYears([]);
    }
  }, [selectedDeptId]);

  const fetchDepartments = async () => {
    try {
      const response = await api.get('/admin/departments');
      setDepartments(response.data);
      if (response.data.length > 0) {
        setSelectedDeptId(response.data[0].id);
      }
    } catch (error) {
      console.error('Failed to fetch departments:', error);
    }
  };

  const fetchYears = async (deptId: string) => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/departments/${deptId}/years`);
      setYears(response.data);
    } catch (error) {
      console.error('Failed to fetch years:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (year?: Year) => {
    if (year) {
      setEditingYear(year);
      setFormData({
        department_id: year.department_id,
        year_level: year.year_level
      });
    } else {
      setEditingYear(null);
      setFormData({ 
        department_id: selectedDeptId || (departments.length > 0 ? departments[0].id : ''), 
        year_level: 1 
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingYear(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingYear) {
        await api.put(`/admin/years/${editingYear.id}`, { year_level: formData.year_level });
      } else {
        await api.post('/admin/years', formData);
      }
      if (formData.department_id === selectedDeptId || !selectedDeptId) {
        if (!selectedDeptId) setSelectedDeptId(formData.department_id);
        else fetchYears(selectedDeptId);
      }
      handleCloseModal();
    } catch (error) {
      console.error('Failed to save year:', error);
      alert('Error saving year. Please check inputs.');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this year?')) {
      try {
        await api.delete(`/admin/years/${id}`);
        fetchYears(selectedDeptId);
      } catch (error) {
        console.error('Failed to delete year:', error);
        alert('Error deleting year. It may have associated sections.');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            Academic Years
          </h1>
          <p className="text-slate-500 mt-1">Configure academic years for departments.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => handleOpenModal()} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm">
            <Plus className="w-4 h-4" />
            Add Year
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
          <div className="flex gap-4 items-center">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Select Department:
            </label>
            <select
              value={selectedDeptId}
              onChange={(e) => setSelectedDeptId(e.target.value)}
              className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500"
            >
              <option value="">-- Select Department --</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>{dept.name} ({dept.code})</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-slate-500">Loading years...</div>
          ) : !selectedDeptId ? (
            <div className="p-8 text-center text-slate-500">Please select a department to view years.</div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-3.5 font-medium">Year Level</th>
                  <th className="px-6 py-3.5 font-medium">Total Sections</th>
                  <th className="px-6 py-3.5 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {years.map((year) => (
                  <tr key={year.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300">Year {year.year_level}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{year.sections_count}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleOpenModal(year)} className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-md transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(year.id)} className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {years.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-slate-500">
                      No years found for this department.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {editingYear ? 'Edit Year' : 'Add Year'}
              </h3>
              <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              {!editingYear && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Department
                  </label>
                  <select
                    required
                    value={formData.department_id}
                    onChange={(e) => setFormData({...formData, department_id: e.target.value})}
                    className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500"
                  >
                    <option value="">-- Select Department --</option>
                    {departments.map(dept => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Year Level (1-5)
                </label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  required
                  value={formData.year_level}
                  onChange={(e) => setFormData({...formData, year_level: parseInt(e.target.value)})}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500"
                />
              </div>
              
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
                >
                  Save Year
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
