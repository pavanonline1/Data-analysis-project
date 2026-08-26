const { supabase } = require('../config/supabaseClient');

const getAllHeroSlides = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('hero_slides')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) throw error;
    
    // Map to frontend field names
    const mappedData = data.map(slide => ({
      ...slide,
      image: slide.image_url
    }));

    res.json({ success: true, data: mappedData });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllHeroSlides
};
