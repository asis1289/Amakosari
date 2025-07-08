const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();

const prisma = new PrismaClient();

// Submit contact form
router.post('/submit', async (req, res) => {
  try {
    const { fullName, phone, email, message } = req.body;

    // Validation
    if (!fullName || !phone || !email || !message) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address' });
    }

    // Phone validation (more flexible - accept various formats)
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{8,}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ error: 'Please enter a valid phone number' });
    }

    // Generate subject from message (first 50 characters)
    const subject = message.length > 50 ? message.substring(0, 50) + '...' : message;

    // Create contact inquiry
    const inquiry = await prisma.contact.create({
      data: {
        name: fullName, // Map fullName to name field
        phone,
        email,
        subject,
        message,
        isRead: false
      }
    });

    // Emit real-time event
    const io = req.app.get('io');
    if (io) {
      io.emit('new-inquiry', {
        id: inquiry.id,
        fullName: inquiry.name,
        email: inquiry.email,
        phone: inquiry.phone,
        message: inquiry.message,
        createdAt: inquiry.createdAt
      });
    }

    res.status(201).json({
      message: 'Thank you for your enquiry! We will get back to you soon!',
      inquiry
    });

  } catch (error) {
    console.error('Contact submission error:', error);
    res.status(500).json({ error: 'Failed to submit contact form' });
  }
});

// Get all contact inquiries (admin only)
router.get('/inquiries', async (req, res) => {
  try {
    const inquiries = await prisma.contact.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Map the database fields to match the frontend interface
    const mappedInquiries = inquiries.map(inquiry => ({
      id: inquiry.id,
      fullName: inquiry.name, // Map 'name' to 'fullName' for frontend
      email: inquiry.email,
      phone: inquiry.phone,
      message: inquiry.message,
      status: inquiry.isRead ? 'READ' : 'UNREAD', // Map 'isRead' to 'status'
      createdAt: inquiry.createdAt
    }));

    res.json(mappedInquiries);
  } catch (error) {
    console.error('Error fetching inquiries:', error);
    res.status(500).json({ error: 'Failed to fetch inquiries' });
  }
});

// Mark inquiry as read
router.patch('/inquiries/:id/read', async (req, res) => {
  try {
    const { id } = req.params;

    const inquiry = await prisma.contact.update({
      where: { id },
      data: { isRead: true }
    });

    res.json(inquiry);
  } catch (error) {
    console.error('Error marking inquiry as read:', error);
    res.status(500).json({ error: 'Failed to update inquiry status' });
  }
});

// Get unread inquiry count
router.get('/inquiries/unread/count', async (req, res) => {
  try {
    const count = await prisma.contact.count({
      where: { isRead: false }
    });

    res.json({ count });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ error: 'Failed to fetch unread count' });
  }
});

// Delete inquiry by id
router.delete('/inquiries/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.contact.delete({ where: { id } });
    res.json({ message: 'Inquiry deleted successfully' });
  } catch (error) {
    console.error('Error deleting inquiry:', error);
    res.status(500).json({ error: 'Failed to delete inquiry' });
  }
});

module.exports = router; 