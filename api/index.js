import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';

// We use an admin client if a service role key is provided, otherwise anon key.
// A service role key is highly recommended for backend admin tasks.
const supabaseAdminKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseKey;

const supabase = createClient(supabaseUrl, supabaseKey);
const supabaseAdmin = createClient(supabaseUrl, supabaseAdminKey);

// --- User Auth ---
app.post('/api/signup', async (req, res) => {
  const { name, roll_number, email, password, mobile_number, branch } = req.body;
  try {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return res.status(400).json({ error: error.message });
    
    if (data?.user) {
      const { error: dbError } = await supabaseAdmin.from('users').insert([{
        id: data.user.id,
        name,
        roll_number,
        email,
        mobile_number,
        branch
      }]);
      if (dbError) return res.status(400).json({ error: 'Profile creation failed: ' + dbError.message });
    }
    
    res.json({ message: 'User signed up successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return res.status(400).json({ error: error.message });
    
    const { data: profile } = await supabase.from('users').select('*').eq('id', data.user.id).single();
    
    res.json({ session: data.session, user: data.user, profile });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// --- User Items ---
app.get('/api/items', async (req, res) => {
  try {
    const { data, error } = await supabase.from('items').select('*, users(name)').order('created_at', { ascending: false });
    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/items', async (req, res) => {
  const { title, description, category, image_url, location_found, posted_by, questions } = req.body;
  try {
    // 1. Create item
    const { data: itemData, error: itemError } = await supabase.from('items').insert([{
      title, description, category, image_url, location_found, posted_by, status: 'found'
    }]).select().single();
    
    if (itemError) return res.status(400).json({ error: itemError.message });
    
    // 2. Create security questions
    if (questions && questions.length > 0) {
      const questionsData = questions.map(q => ({
        item_id: itemData.id,
        question: q.question,
        answer: q.answer,
        created_by: posted_by
      }));
      const { error: qError } = await supabase.from('security_questions').insert(questionsData);
      if (qError) return res.status(400).json({ error: 'Failed to create security questions: ' + qError.message });
    }
    
    res.json({ message: 'Item posted successfully', item: itemData });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get security questions for an item (without answers, for claim form)
app.get('/api/items/:id/questions', async (req, res) => {
  try {
    const { data, error } = await supabase.from('security_questions')
      .select('id, question, created_by')
      .eq('item_id', req.params.id);
    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// --- Claims ---
app.post('/api/claim', async (req, res) => {
  const { item_id, claimed_by, answers } = req.body; // answers is a JSON string or object
  try {
    const proof = JSON.stringify(answers);
    const { error } = await supabase.from('claims').insert([{
      item_id,
      claimed_by,
      proof,
      status: 'pending'
    }]);
    if (error) return res.status(400).json({ error: error.message });
    res.json({ message: 'Claim submitted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/claims/user/:userId', async (req, res) => {
  try {
    const { data, error } = await supabase.from('claims')
      .select('*, items(*)')
      .eq('claimed_by', req.params.userId)
      .order('created_at', { ascending: false });
    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// --- Admin ---
app.post('/api/admin/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const { data, error } = await supabaseAdmin.from('admins').select('*').eq('email', email).single();
    if (error) return res.status(400).json({ error: 'Admin not found' });
    
    const valid = await bcrypt.compare(password, data.password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid password' });
    
    // In a real app, generate a JWT. We'll return admin data as pseudo-session
    res.json({ message: 'Admin login successful', admin: { id: data.id, name: data.name, email: data.email } });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Setup Initial Admin Account Helper (Hidden Endpoint for demonstration if no admin exists)
app.post('/api/admin/setup', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const hash = await bcrypt.hash(password, 10);
    const { error } = await supabaseAdmin.from('admins').insert([{ name, email, password_hash: hash }]);
    if (error) return res.status(400).json({ error: error.message });
    res.json({ message: 'Admin created' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/admin/items', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.from('items').select('*, users(name, email, roll_number)').order('created_at', { ascending: false });
    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/admin/claims', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.from('claims')
      .select('*, items(*), users:claimed_by(name, email, roll_number, branch)')
      .order('created_at', { ascending: false });
    
    if (error) return res.status(400).json({ error: error.message });
    
    // Also fetch security questions to put alongside claims
    const itemIds = [...new Set(data.map(c => c.item_id))];
    const { data: questions } = await supabaseAdmin.from('security_questions').select('*').in('item_id', itemIds);
    
    const claimsWithQuestions = data.map(claim => {
      const qnA = questions?.filter(q => q.item_id === claim.item_id) || [];
      return { ...claim, security_questions: qnA };
    });
    
    res.json(claimsWithQuestions);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/admin/verify-claim', async (req, res) => {
  const { claim_id, item_id, status } = req.body; // status = 'approved' or 'rejected'
  try {
    const { error: claimError } = await supabaseAdmin.from('claims')
      .update({ status })
      .eq('id', claim_id);
    if (claimError) return res.status(400).json({ error: claimError.message });
    
    if (status === 'approved') {
      const { error: itemError } = await supabaseAdmin.from('items')
        .update({ status: 'claimed' })
        .eq('id', item_id);
      if (itemError) return res.status(400).json({ error: itemError.message });
    }
    
    res.json({ message: `Claim ${status}` });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default app;
