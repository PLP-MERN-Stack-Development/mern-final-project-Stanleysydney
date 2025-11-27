const router = require('express').Router();
const Report = require('../models/Report');
const upload = require('../middleware/upload');

// @route   GET api/reports
// @desc    Get all reports (Sorted by newest)
router.get('/', async (req, res) => {
  try {
    const reports = await Report.find().sort({ createdAt: -1 });
    res.json(reports);
  } catch (err) { res.status(500).json(err); }
});

// @route   POST api/reports
// @desc    Submit a Report (Anonymous or User)
router.post('/', upload.single('evidence'), async (req, res) => {
  try {
    // 1. Create Report Object
    const newReport = new Report({
      username: req.body.username || 'Anonymous',
      description: req.body.description,
      region: req.body.region,
      evidenceUrl: req.file ? req.file.path.replace(/\\/g, "/") : null // Normalize path for Windows/Linux
    });

    // 2. Save to DB
    const savedReport = await newReport.save();

    // 3. 🔥 REAL-TIME TRIGGER: Notify Frontend
    // This tells the frontend to update the feed immediately
    if (req.io) {
      req.io.emit('new_report', savedReport);
    }

    res.status(200).json(savedReport);
  } catch (err) { 
    console.error(err);
    res.status(500).json(err); 
  }
});

// @route   PUT api/reports/:id/like
// @desc    Like a report
router.put('/:id/like', async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    await report.updateOne({ $inc: { likes: 1 } });
    res.status(200).json("Liked");
  } catch (err) { res.status(500).json(err); }
});

// @route   PUT api/reports/:id/comment
// @desc    Add comment (Official or Public)
router.put('/:id/comment', async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    await report.updateOne({ $push: { comments: req.body } });
    
    // Fetch updated report to send back
    const updatedReport = await Report.findById(req.params.id);
    res.status(200).json(updatedReport);
  } catch (err) { res.status(500).json(err); }
});

module.exports = router;