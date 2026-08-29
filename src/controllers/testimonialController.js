const { supabase } = require('../config/supabaseClient');

// Actual DB columns: id, name, location, photo_url, rating, tour_name, review, created_at
const getAllTestimonials = async (req, res, next) => {
  try {
    const { tour_id } = req.query;
    
    let query = supabase
      .from('testimonials')
      .select('*')
      .order('created_at', { ascending: false });

    // Table uses tour_name (text), not tour_id foreign key
    if (tour_id) {
      query = query.eq('tour_name', tour_id);
    }

    const { data, error } = await query;
    if (error) throw error;
    
    // Map to frontend-friendly field names
    const mappedData = data.map(t => ({
      id: t.id,
      author_name: t.name,
      author_location: t.location,
      content: t.review,
      rating: t.rating,
      image_url: t.photo_url,
      tour_name: t.tour_name,
      created_at: t.created_at,
    }));

    res.json({ success: true, data: mappedData });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllTestimonials
};
