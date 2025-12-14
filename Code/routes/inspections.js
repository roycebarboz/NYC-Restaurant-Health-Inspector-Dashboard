import { Router } from 'express';
import { loginRedirect } from "../middleware/Auth.js"
import { getInspectionsByRestaurantId } from '../data/inspections.js';
import { inspections as inspectionsCollection, restaurants } from '../config/mongoCollections.js';
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
 *  defailt: page=1, limit=50
 */
router.get('/', loginRedirect, async (req, res) => {
  try {
    const inspectionsCol = await inspectionsCollection();

    let { page, limit } = req.query;

    page = parseInt(page, 10);
    limit = parseInt(limit, 10);

    if (!Number.isInteger(page) || page <= 0) page = 1;
    if (!Number.isInteger(limit) || limit <= 0 || limit > 100) limit = 50;

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      inspectionsCol
        .find({})
        .sort({ inspectionDate: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      inspectionsCol.countDocuments()
    ]);

    return res.json({
      page,
      limit,
      total,
      data: items
    });
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

    const inspectionsCol = await inspectionsCollection();
    const inspection = await inspectionsCol.findOne({ _id: inspectionId });


    if (!inspection) {
      return res
        .status(404)
        .json({ error: `Inspection with id ${inspectionId} not found` });
    }

    const restaurantsCol = await restaurants();
    const restaurant = await restaurantsCol.findOne({
      _id: inspection.restaurantId
    });

    if (!restaurant) {
      return res
        .status(404)
        .json({ error: `Restaurant with id ${inspection.restaurantId} not found` });
    }

    return res.render('inspection_detail', {
      title: "Inspectify - Inspection Detail",
      inspection,
      restaurant
    });
  } catch (e) {
    console.error('Error in GET /inspections/:inspectionId:', e);
    const msg = e.toString();
    return res.status(400).json({
      error: {
        title: 'Inspectify - Error',
        error: msg
      }
    });
  }
});

export default router;