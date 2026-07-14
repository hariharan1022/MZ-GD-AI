import { useState, useEffect } from 'react';
import { Layers, Search, Plus, Filter, Edit, Trash2, X } from 'lucide-react';
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
}

interface Section {
  id: string;
  year_id: string;
  name: string;
  students_count: number;
}

export default function AdminSections() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDeptId, setSelectedDeptId] = useState<string>('');
  
  const [years, setYears] = useState<Year[]>([]);
  const [selectedYearId, setSelectedYearId] = useState<string>('');
  
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    year_id: '',
    name: ''
  });

  // Fetch departments on load
  useEffect(() => {
    fetchDepartments();
  }, []);

  // Fetch years when department changes
  useEffect(() => {
    if (selectedDeptId) {
      fetchYears(selectedDeptId);
    } else {
      setYears([]);
      setSelectedYearId('');
    }
  }, [selectedDeptId]);

  // Fetch sections when year changes
  useEffect(() => {
    if (selectedYearId) {
      fetchSections(selectedYearId);
    } else {
      setSections([]);
    }
  }, [selectedYearId]);

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
      const response = await api.get(`/admin/departments/${deptId}/years`);
      setYears(response.data);
      if (response.data.length > 0) {
        setSelectedYearId(response.data[0].id);
      } else {
        setSelectedYearId('');
      }
    } catch (error) {
      console.error('Failed to fetch years:', error);
    }
  };

  const fetchSections = async (yearId: string) => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/years/${yearId}/sections`);
      setSections(response.data);
    } catch (error) {
      console.error('Failed to fetch sections:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (section?: Section) => {
    if (section) {
      setEditingSection(section);
      setFormData({
        year_id: section.year_id,
        name: section.name
      });
    } else {
      setEditingSection(null);
      setFormData({ 
        year_id: selectedYearId || (years.length > 0 ? years[0].id : ''), 
        name: '' 
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSection(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSection) {
        await api.put(`/admin/sections/${editingSection.id}`, { name: formData.name });
      } else {
        await api.post('/admin/sections', formData);
      }
      
      if (formData.year_id === selectedYearId || !selectedYearId) {
        if (!selectedYearId) setSelectedYearId(formData.year_id);
        else fetchSections(selectedYearId);
      }
      handleCloseModal();
    } catch (error) {
      console.error('Failed to save section:', error);
      alert('Error saving section. Please check inputs.');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this section?')) {
      try {
        await api.delete(`/admin/sections/${id}`);
        fetchSections(selectedYearId);
      } catch (error) {
        console.error('Failed to delete section:', error);
        alert('Error deleting section. It may have associated students.');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            Sections Management
          </h1>
          <p className="text-slate-500 mt-1">Manage class sections and student distribution.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => handleOpenModal()} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm">
            <Plus className="w-4 h-4" />
            Add Section
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 flex flex-col sm:flex-row gap-4">
          <div className="flex gap-2 items-center">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
              Department:
            </label>
            <select
              value={selectedDeptId}
              onChange={(e) => setSelectedDeptId(e.target.value)}
              className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500 min-w-[200px]"
            >
              <option value="">-- Select --</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>{dept.name} ({dept.code})</option>
              ))}
            </select>
          </div>
          
          <div className="flex gap-2 items-center">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
              Year:
            </label>
            <select
              value={selectedYearId}
              onChange={(e) => setSelectedYearId(e.target.value)}
              className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500 min-w-[150px]"
              disabled={!selectedDeptId}
            >
              <option value="">-- Select --</option>
              {years.map(year => (
                <option key={year.id} value={year.id}>Year {year.year_level}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-slate-500">Loading sections...</div>
          ) : !selectedYearId ? (
            <div className="p-8 text-center text-slate-500">Please select a department and year to view sections.</div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-3.5 font-medium">Section Name</th>
                  <th className="px-6 py-3.5 font-medium">Total Students</th>
                  <th className="px-6 py-3.5 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {sections.map((section) => (
                  <tr key={section.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300">Section {section.name}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{section.students_count}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleOpenModal(section)} className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-md transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(section.id)} className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {sections.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-slate-500">
                      No sections found for this year.
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
                {editingSection ? 'Edit Section' : 'Add Section'}
              </h3>
              <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              {!editingSection && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Year
                  </label>
                  <select
                    required
                    value={formData.year_id}
                    onChange={(e) => setFormData({...formData, year_id: e.target.value})}
                    className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500"
                  >
                    <option value="">-- Select Year --</option>
                    {years.map(year => (
                      <option key={year.id} value={year.id}>Year {year.year_level}</option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Section Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500"
                  placeholder="e.g. A, B, C"
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
                  Save Section
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
