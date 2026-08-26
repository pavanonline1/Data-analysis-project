const { supabase } = require('../config/supabaseClient');

const getAllFaqs = async (req, res, next) => {
  try {
    const { category } = req.query;
    
    let query = supabase
      .from('faqs')
      .select('*')
      .order('display_order', { ascending: true });

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;
    if (error) throw error;
    
    // Group by category for frontend compatibility
    const groupedFaqs = data.reduce((acc, faq) => {
      const category = faq.category || 'General';
      let catObj = acc.find(c => c.category === category);
      if (!catObj) {
        catObj = { category, questions: [] };
        acc.push(catObj);
      }
      catObj.questions.push({ q: faq.question, a: faq.answer });
      return acc;
    }, []);

    res.json({ success: true, data: groupedFaqs });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllFaqs
};
