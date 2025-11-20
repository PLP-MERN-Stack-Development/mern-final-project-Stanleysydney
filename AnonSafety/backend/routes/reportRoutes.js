const router = require('express').Router();
const Report = require('../models/Report');
const multer = require('multer');

// Upload Config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// GET ALL REPORTS
router.get('/', async (req, res) => {
  try {
    const reports = await Report.find().sort({ createdAt: -1 });
    res.json(reports);
  } catch (err) { res.status(500).json(err); }
});

// POST REPORT
router.post('/', upload.single('evidence'), async (req, res) => {
  try {
    const newReport = new Report({
      username: req.body.username || 'Anonymous',
      description: req.body.description,
      region: req.body.region,
      evidenceUrl: req.file ? req.file.path : null
    });
    const savedReport = await newReport.save();
    res.status(200).json(savedReport);
  } catch (err) { res.status(500).json(err); }
});

// LIKE REPORT
router.put('/:id/like', async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    await report.updateOne({ $inc: { likes: 1 } });
    res.status(200).json("Liked");
  } catch (err) { res.status(500).json(err); }
});

// COMMENT ON REPORT
router.put('/:id/comment', async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    await report.updateOne({ $push: { comments: req.body } });
    res.status(200).json("Comment added");
  } catch (err) { res.status(500).json(err); }
});

module.exports = router;