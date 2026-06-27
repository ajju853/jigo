const prisma = require('../config/database');

class LegalController {
  async getDocument(req, res) {
    try {
      const { type } = req.params;
      const validTypes = ['privacy', 'terms', 'safety'];
      
      if (!validTypes.includes(type)) {
        return res.status(404).json({
          success: false,
          error: 'Legal document not found'
        });
      }
      
      // In a real app, these could be fetched from a CMS or DB.
      // For now, we return static metadata.
      const documents = {
        privacy: {
          title: 'Privacy Policy',
          version: '1.0',
          lastUpdated: '2024-01-01',
          content: '...'
        },
        terms: {
          title: 'Terms of Service',
          version: '1.0',
          lastUpdated: '2024-01-01',
          content: '...'
        },
        safety: {
          title: 'Safety Guidelines',
          version: '1.0',
          lastUpdated: '2024-01-01',
          content: '...'
        }
      };
      
      return res.json({
        success: true,
        data: documents[type]
      });
    } catch (error) {
      console.error('Error fetching legal document:', error);
      return res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  async acceptPolicy(req, res) {
    try {
      const { documentType, version } = req.body;
      const userId = req.user.id;
      
      await prisma.userPolicyAcceptance.create({
        data: {
          userId,
          documentType,
          version,
          acceptedAt: new Date()
        }
      });
      
      return res.json({
        success: true,
        message: 'Policy accepted'
      });
    } catch (error) {
      console.error('Error accepting policy:', error);
      return res.status(500).json({ success: false, error: 'Failed to record acceptance' });
    }
  }
}

module.exports = new LegalController();
