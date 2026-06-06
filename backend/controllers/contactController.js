const { Op } = require('sequelize');
const { Submission } = require('../models');

// POST /api/contact - Public contact submission
exports.createSubmission = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    const submission = await Submission.create({
      name,
      email,
      message
    });

    return res.status(201).json({
      status: 'success',
      message: 'Form Submitted Successfully',
      data: {
        id: submission.id,
        name: submission.name,
        email: submission.email,
        message: submission.message,
        createdAt: submission.createdAt
      }
    });
  } catch (error) {
    console.error('Error creating contact submission:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error. Failed to submit contact form.'
    });
  }
};

// GET /api/contact - Admin only: Get all submissions (supports search & pagination)
exports.getSubmissions = async (req, res) => {
  try {
    const { search } = req.query;

    let queryOptions = {
      order: [['createdAt', 'DESC']]
    };

    // If search parameter is provided, search by name, email, or message
    if (search) {
      const escapedSearch = `%${search.trim()}%`;
      queryOptions.where = {
        [Op.or]: [
          { name: { [Op.like]: escapedSearch } },
          { email: { [Op.like]: escapedSearch } },
          { message: { [Op.like]: escapedSearch } }
        ]
      };
    }

    const submissions = await Submission.findAll(queryOptions);

    return res.status(200).json({
      status: 'success',
      total: submissions.length,
      data: submissions
    });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error. Failed to retrieve submissions.'
    });
  }
};

// DELETE /api/contact/:id - Admin only: Delete a submission by ID
exports.deleteSubmission = async (req, res) => {
  try {
    const { id } = req.params;

    const submission = await Submission.findByPk(id);

    if (!submission) {
      return res.status(404).json({
        status: 'error',
        message: 'Submission not found'
      });
    }

    await submission.destroy();

    return res.status(200).json({
      status: 'success',
      message: 'Submission deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting submission:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error. Failed to delete submission.'
    });
  }
};
