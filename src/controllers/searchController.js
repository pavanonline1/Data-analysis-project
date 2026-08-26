const { supabase } = require('../config/supabaseClient');

const search = async (req, res, next) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({ success: false, error: 'Query parameter q is required' });
    }

    // Searching across tours and destinations using ilike
    const [
      { data: tours, error: toursError },
      { data: destinations, error: destinationsError }
    ] = await Promise.all([
      supabase.from('tours').select('*').or(`title.ilike.%${q}%,description.ilike.%${q}%`),
      supabase.from('destinations').select('*').ilike('name', `%${q}%`)
    ]);

    if (toursError) throw toursError;
    if (destinationsError) throw destinationsError;


    res.json({
      success: true,
      data: {
        tours,
        destinations
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  search
};
