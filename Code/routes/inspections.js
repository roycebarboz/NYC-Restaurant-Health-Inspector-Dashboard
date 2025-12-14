import { Router } from 'express';
import { loginRedirect } from '../middleware/Auth.js';
import {
  getInspectionsByRestaurantId,
  getAllInspections,
  getInspectionWithRestaurant
} from '../data/inspections.js';

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
 * GET /inspections
 *  paginated list of all inspections
 *  default: page=1, limit=50
 */
router.get('/', loginRedirect, async (req, res) => {
  try {
    const { page, limit } = req.query;

    const result = await getAllInspections(page, limit);

    return res.json(result);
  } catch (e) {
    console.error('Error in GET /inspections:', e);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});


/**
 * GET /inspections/restaurant/:restaurantId
 *   all inspections for a specific restaurant
 */
router.get('/restaurant/:restaurantId', async (req, res) => {
  try {
    const restaurantId = validateId(req.params.restaurantId, 'restaurantId');

    const inspections = await getInspectionsByRestaurantId(restaurantId);

    return res.json(inspections);
  } catch (e) {
    console.error('Error in GET /inspections/restaurant/:restaurantId:', e);
    const msg = e.toString();

    if (msg.toLowerCase().includes('not found')) {
      return res.status(404).json({ error: msg });
    }

    return res.status(400).json({ error: msg });
  }
});

/**
 * GET /inspections/:inspectionId
 */
router.get('/:inspectionId', loginRedirect, async (req, res) => {
  try {
    const inspectionId = validateId(req.params.inspectionId, 'inspectionId');

    const { inspection, restaurant } = await getInspectionWithRestaurant(inspectionId);

    return res.render('inspection_detail', {
      title: 'Inspectify - Inspection Detail',
      inspection,
      restaurant
    });
  } catch (e) {
    console.error('Error in GET /inspections/:inspectionId:', e);
    const msg = e.toString();

    if (msg.toLowerCase().includes('not found')) {
      return res.status(404).render('error', {
        title: 'Inspectify - Error',
        error: msg
      });
    }

    return res.status(400).render('error', {
      title: 'Inspectify - Error',
      error: msg
    });
  }
});


export default router;