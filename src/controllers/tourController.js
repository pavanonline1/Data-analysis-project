const { supabase } = require('../config/supabaseClient');

const getAllTours = async (req, res, next) => {
  try {
    const { category, limit, featured } = req.query;
    
    let query = supabase
      .from('tours')
      .select('*, tour_pricing(*)')
      .order('created_at', { ascending: false });

    if (category) {
      query = query.eq('tour_type', category);
    }

    if (featured === 'true') {
      query = query.eq('featured', true);
    }

    if (limit) {
      query = query.limit(parseInt(limit));
    }


    const { data, error } = await query;
    if (error) throw error;
    
    // Map to camelCase for frontend compatibility
    const mappedData = data.map(tour => ({
      ...tour,
      durationDays: tour.duration_days,
      originalPrice: tour.original_price,
      reviewCount: tour.review_count,
      image: tour.image_url,
      type: tour.tour_type,
      pricing: tour.tour_pricing?.map(p => ({
        groupSize: p.group_size,
        pricePerPerson: p.price_per_person
      }))
    }));

    res.json({ success: true, data: mappedData });
  } catch (error) {
    next(error);
  }
};

const getTourById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('tours')
      .select('*, tour_pricing(*), itineraries(*), testimonials(*)')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ success: false, error: 'Tour not found' });

    // Map to camelCase
    const mappedData = {
      ...data,
      durationDays: data.duration_days,
      originalPrice: data.original_price,
      reviewCount: data.review_count,
      image: data.image_url,
      type: data.tour_type,
      itinerary: data.itineraries?.sort((a, b) => a.day - b.day),
      pricing: data.tour_pricing?.map(p => ({
        groupSize: p.group_size,
        pricePerPerson: p.price_per_person
      }))
    };

    res.json({ success: true, data: mappedData });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllTours,
  getTourById
};
