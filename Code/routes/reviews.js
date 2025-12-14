import { Router } from 'express';
import { loginRedirect } from "../middleware/Auth.js"
import {
  CreateReview,
  GetReviewsByRestaurantId,
  GetReviewsByUserId,
  GetbyReviewID,
  UpdateReviews,
  DeleteReview
} from '../data/reviews.js';

const router = Router();

const validateId = (id, varName = 'id') => {
  if (typeof id !== 'string') {
    throw new Error(`${varName} must be a string`);
  }
  const trimmed = id.trim();
  if (!trimmed) {
    throw new Error(`${varName} cannot be an empty string or just spaces`);
  }
  return trimmed;
};

/**
 * POST /reviews
 *  - restaurantId
 *  - userId
 *  - rating
 *  - title
 *  - reviewText
 *  - visitDate
 */
router.get('/new/:restaurantId', loginRedirect, (req, res) => {
    res.render('review_writing', {
    title: 'Inspectify - Write Review',
    restaurantId: req.params.restaurantId
  });
});



router.post('/', loginRedirect, async (req, res) => {
  try {
    const {
      restaurantId,
      rating,
      title,
      reviewText,
      visitDate
    } = req.body;

    const userId = req.session.user._id;
    const username = req.session.user.username;

    const newReview = await CreateReview({
      restaurantId,
      userId,
      username,
      rating,
      title,
      reviewText,
      visitDate
    });

    return res.redirect(`/restaurants/${restaurantId}`);
  } catch (e) {
    console.error('Error in POST /reviews:', e);
    return res.status(400).render('review_writing', {
      title: 'Inspectify - Write Review',
      error: e.toString(),
      restaurantId: req.body.restaurantId
    });
  }
});

/**
 * GET /reviews/restaurant/:restaurantId
 */
router.get('/restaurant/:restaurantId', async (req, res) => {
  try {
    const restaurantId = validateId(req.params.restaurantId, 'restaurantId');

    const reviews = await GetReviewsByRestaurantId(restaurantId);

    return res.json(reviews);
  } catch (e) {
    console.error('Error in GET /reviews/restaurant/:restaurantId:', e);
    const msg = e.toString();
    if (msg.toLowerCase().includes('not found')) {
      return res.status(404).json({ error: msg });
    }
    return res.status(400).json({ error: msg });
  }
});

/**
 * GET /reviews/user/:userId
 */
router.get('/user/:userId', async (req, res) => {
  try {
    const userId = validateId(req.params.userId, 'userId');

    const reviews = await GetReviewsByUserId(userId);

    return res.json(reviews);
  } catch (e) {
    console.error('Error in GET /reviews/user/:userId:', e);
    const msg = e.toString();
    if (msg.toLowerCase().includes('not found')) {
      return res.status(404).json({ error: msg });
    }
    return res.status(400).json({ error: msg });
  }
});

/**
 * GET /reviews/:reviewId
 * oder is important here
 * need to be after /reviews/restaurant/:restaurantId and /reviews/user/:userId
 */
router.get('/:reviewId', async (req, res) => {
  try {
    const reviewId = validateId(req.params.reviewId, 'reviewId');

    const review = await GetbyReviewID(reviewId);

    return res.json(review);
  } catch (e) {
    console.error('Error in GET /reviews/:reviewId:', e);
    const msg = e.toString();
    if (msg.toLowerCase().includes('not found')) {
      return res.status(404).json({ error: msg });
    }
    return res.status(400).json({ error: msg });
  }
});

/**
 * PUT /reviews/:reviewId
 *  - rating
 *  - title
 *  - reviewText
 *  - visitDate
 */
router.put('/:reviewId', loginRedirect, async (req, res) => {
  try {
    const reviewId = validateId(req.params.reviewId, 'reviewId');
    const review = await GetbyReviewID(reviewId);
    if (review.userId !== req.session.user._id) {
      return res.status(405).json({ error: 'Unauthorized' });
    }
    const {
      rating,
      title,
      reviewText,
      visitDate
    } = req.body;

    const updated = await UpdateReviews({
      reviewId,
      rating,
      title,
      reviewText,
      visitDate
    });

    return res.json(updated);
  } catch (e) {
    console.error('Error in PUT /reviews/:reviewId:', e);
    const msg = e.toString();
    if (msg.toLowerCase().includes('not found')) {
      return res.status(404).json({ error: msg });
    }
    return res.status(400).json({ error: msg });
  }
});

/**
 * DELETE /reviews/:reviewId
 */
router.delete('/:reviewId', loginRedirect, async (req, res) => {
  try {
    const reviewId = validateId(req.params.reviewId, 'reviewId');
    const review = await GetbyReviewID(reviewId);
    if (review.userId !== req.session.user._id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    const deletedReview = await DeleteReview(reviewId);

    return res.json({
      deleted: true,
      review: deletedReview
    });
  } catch (e) {
    console.error('Error in DELETE /reviews/:reviewId:', e);
    const msg = e.toString();
    if (msg.toLowerCase().includes('not found')) {
      return res.status(404).json({ error: msg });
    }
    return res.status(400).json({ error: msg });
  }
});

export default router;