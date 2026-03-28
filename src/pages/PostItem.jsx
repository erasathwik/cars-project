import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Camera, Image as ImageIcon, Plus, Trash2, CheckCircle2 } from 'lucide-react';

export default function PostItem() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '', description: '', category: 'Electronics', location_found: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [questions, setQuestions] = useState([{ question: '', answer: '' }]);
  const [loading, setLoading] = useState(false);

  const categories = ['Electronics', 'Accessories', 'Documents', 'Clothing', 'Other'];

  const handleChange = (e) => setFormData(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleQuestionChange = (index, field, value) => {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
  };

  const addQuestion = () => {
    if (questions.length < 3) {
      setQuestions([...questions, { question: '', answer: '' }]);
    }
  };

  const removeQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    let image_url = null;
    try {
      if (imageFile) {
        // Upload image to Supabase
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `items/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('cars_bucket')
          .upload(filePath, imageFile);

        if (uploadError) throw new Error('Image upload failed: ' + uploadError.message);

        const { data: publicUrlData } = supabase.storage
          .from('cars_bucket')
          .getPublicUrl(filePath);
        
        image_url = publicUrlData.publicUrl;
      }

      // Backend expects: title, description, category, image_url, location_found, posted_by, questions
      const payload = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        image_url,
        location_found: formData.location_found,
        posted_by: user.id,
        questions: questions.filter(q => q.question && q.answer) // Remove empty ones
      };

      await axios.post('/api/items', payload);
      alert('Item posted successfully!');
      navigate('/dashboard/items');
    } catch (err) {
      alert(err.response?.data?.error || err.message || 'Failed to post item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: 800, margin: '0 auto' }}>
      <header className="page-header">
        <h1 className="page-title">Post a Found Item</h1>
      </header>
      
      <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: '2rem' }}>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '1.1rem' }}>
          Help return lost items to their rightful owners by providing accurate details.
        </p>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div className="form-group">
            <label>Item Name/Title</label>
            <input required className="form-input" name="title" value={formData.title} onChange={handleChange} placeholder="e.g. Black iPhone 13" />
          </div>
          <div className="form-group">
            <label>Category</label>
            <select required className="form-input" name="category" value={formData.category} onChange={handleChange}>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>Location Found</label>
          <input required className="form-input" name="location_found" value={formData.location_found} onChange={handleChange} placeholder="e.g. Library, 2nd Floor" />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea required className="form-input" name="description" value={formData.description} onChange={handleChange} rows={4} placeholder="Describe any unique characteristics (marks, cover color, etc.)" />
        </div>

        <div className="form-group">
          <label>Item Image (Optional but recommended)</label>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <div style={{
              width: 150, height: 150, borderRadius: 12, border: '2px dashed var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', background: 'rgba(0,0,0,0.2)'
            }}>
              {imagePreview ? (
                <img src={imagePreview} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Preview" />
              ) : (
                <ImageIcon size={40} color="var(--text-muted)" />
              )}
              <input type="file" accept="image/*" onChange={handleImageChange} style={{ opacity: 0, position: 'absolute', inset: 0, cursor: 'pointer' }} />
            </div>
            <div style={{ flex: 1, color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.5rem' }}>
              <p>Upload a clear photo of the item.</p>
              <p>Supported formats: JPG, PNG, WEBP.</p>
              <button type="button" className="btn-secondary" style={{ marginTop: '1rem', position: 'relative' }}>
                <Camera size={16} /> Choose Image
                <input type="file" accept="image/*" onChange={handleImageChange} style={{ opacity: 0, position: 'absolute', inset: 0, cursor: 'pointer' }} />
              </button>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--glass-border)' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--primary)' }}>Verification Security Questions</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
            To ensure the item returns to its true owner, add 1 to 3 secret questions that only the owner would know. Provide the answer you expect them to give. Admin will verify claims based on these exact questions.
          </p>

          {questions.map((q, idx) => (
            <div key={idx} style={{ background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: 12, marginBottom: '1rem', position: 'relative' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Question {idx + 1}</label>
                  <input required className="form-input" placeholder="e.g. What is the lock screen wallpaper?" value={q.question} onChange={(e) => handleQuestionChange(idx, 'question', e.target.value)} />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Expected Answer</label>
                  <input required className="form-input" placeholder="e.g. A dog wearing sunglasses" value={q.answer} onChange={(e) => handleQuestionChange(idx, 'answer', e.target.value)} />
                </div>
              </div>
              {questions.length > 1 && (
                <button type="button" onClick={() => removeQuestion(idx)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', color: 'var(--danger)' }}>
                  <Trash2 size={18} />
                </button>
              )}
            </div>
          ))}
          
          {questions.length < 3 && (
            <button type="button" onClick={addQuestion} className="btn-secondary" style={{ fontSize: '0.875rem' }}>
              <Plus size={16} /> Add Another Question
            </button>
          )}
        </div>

        <div style={{ marginTop: '3rem', textAlign: 'right' }}>
          <button type="submit" className="btn-primary" disabled={loading} style={{ fontSize: '1.1rem', padding: '1rem 2rem' }}>
            {loading ? 'Posting Item...' : <><CheckCircle2 size={20} /> Post Found Item</>}
          </button>
        </div>
      </form>
    </div>
  );
}
