const { supabase } = require('../config/supabaseClient');

const getAllDestinations = async (req, res, next) => {
  try {
    const { featured } = req.query;
    
    let query = supabase
      .from('destinations')
      .select('*')
      .order('name', { ascending: true });

    if (featured === 'true') {
      query = query.eq('featured', true);
    }

    const { data, error } = await query;
    if (error) throw error;
    
    // Map to camelCase
    const mappedData = data.map(dest => ({
      ...dest,
      image: dest.image_url,
      tourCount: dest.tour_count
    }));

    res.json({ success: true, data: mappedData });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllDestinations
};
