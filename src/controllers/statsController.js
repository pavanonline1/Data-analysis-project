const { supabase } = require('../config/supabaseClient');

const getStats = async (req, res, next) => {
  try {
    const [
      { count: toursCount, error: toursError },
      { count: testimonialsCount, error: testimonialsError },
      { count: destinationsCount, error: destinationsError }
    ] = await Promise.all([
      supabase.from('tours').select('*', { count: 'exact', head: true }),
      supabase.from('testimonials').select('*', { count: 'exact', head: true }),
      supabase.from('destinations').select('*', { count: 'exact', head: true })
    ]);

    if (toursError) throw toursError;
    if (testimonialsError) throw testimonialsError;
    if (destinationsError) throw destinationsError;

    res.json({
      success: true,
      data: {
        tours: toursCount || 0,
        testimonials: testimonialsCount || 0,
        destinations: destinationsCount || 0,
        happyClients: (testimonialsCount || 0) * 10 + 50 // Mocked for premium feel
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStats
};
