import { ObjectId } from 'mongodb';
import {
  reviews as reviewsCollection,
  restaurants as restaurantsCollection,
  users as usersCollection
} from '../config/mongoCollections.js';

const checkNonEmptyString = (value, varName) => {
    if (typeof value !== 'string') {
        throw new Error(`${varName} must be a string`);
    }
    const trimmed = value.trim();
    if (!trimmed) {
        throw new Error(`${varName} cannot be an empty string or just spaces`);
    }
    return trimmed;
};

const validateRating = (rating) => {
    if (rating === undefined || rating === null) {
        throw new Error('rating is required');
    }

    let num = rating;
    if (typeof num === 'string') {
        num = num.trim();
        if (!num) throw new Error('rating cannot be an empty string');
        num = Number(num);
    }

    if (!Number.isFinite(num)) {
        throw new Error('rating must be a number');
    }

    if (num < 1 || num > 5) {
        throw new Error('rating must be between 1.0 and 5.0');
    }

    return num;
};

const normalizeVisitDate = (value) => {
    if (value === undefined || value === null || value === '') {
        return null;
    }

    if (typeof value !== 'string') {
        throw new Error('visitDate must be a string if provided');
    }

    const trimmed = value.trim();
    if (!trimmed) return null;

    const d = new Date(trimmed);
    if (Number.isNaN(d.getTime())) {
        throw new Error('visitDate is not a valid date string');
    }

    return d.toISOString().split('T')[0];
};

// update RESTAURANTS：
//   - averageUserRating
//   - totalReviews
//   - reviewIds
// for CreateReview / UpdateReview / DeleteReview
const updateRestaurantReviewDetails = async (restaurantId) => {
    const restaurantsCol = await restaurantsCollection();
    const reviewsCol = await reviewsCollection();

    const restaurant = await restaurantsCol.findOne({ _id: restaurantId });
    if (!restaurant) {
        throw new Error(`Restaurant with id ${restaurantId} not found`);
    }

    const allReviews = await reviewsCol
    .find({ restaurantId })
    .toArray();

    const totalReviews = allReviews.length;

    let averageUserRating = 0;
    let reviewIds = [];

    if (totalReviews > 0) {
        let sum = 0;
        reviewIds = allReviews.map((r) => r._id);

        for (const r of allReviews) {
        if (typeof r.rating === 'number') {
            sum += r.rating;
        }
    }

    const avgRaw = sum / totalReviews;
    averageUserRating = Number(avgRaw.toFixed(2));
  }

    const today = new Date().toISOString().split('T')[0];

    await restaurantsCol.updateOne(
        { _id: restaurantId },
        {
            $set: {
                averageUserRating,
                totalReviews,
                reviewIds,
                updatedAt: today
            }
        }
    );

    return {
        averageUserRating,
        totalReviews,
        reviewIds
    };
};


// Function starts here

// ========== core methods ==========

/**
 * CreateReview - add new review in db
 *
 * review：
 * {
 *   _id: string,
 *   restaurantId: string,
 *   userId: string,
 *   username: string,
 *   rating: number (1.0 - 5.0),
 *   title: string,
 *   reviewText: string,
 *   visitDate: string | null,
 *   createdAt: string (YYYY-MM-DD),
 *   updatedAt: string (YYYY-MM-DD),
 *   helpfulCount: number,
 *   reportCount: number
 * }
 *
 *  reviewData at least has：
 *  - restaurantId (string)
 *  - userId (string)
 *  - rating (number 1.0-5.0)
 *  - title (string)
 *  - reviewText (string)
 *  - visitDate (string)
 */
export const CreateReview = async (reviewData) => {
    if (!reviewData || typeof reviewData !== 'object' || Array.isArray(reviewData)) {
        throw new Error('reviewData must be a non-null object');
    }

    const restaurantId = checkNonEmptyString(reviewData.restaurantId, 'restaurantId');
    const userId = checkNonEmptyString(reviewData.userId, 'userId');

    const rating = validateRating(reviewData.rating);
    const title = checkNonEmptyString(reviewData.title, 'title');
    const reviewText = checkNonEmptyString(reviewData.reviewText, 'reviewText');
    const visitDate = normalizeVisitDate(reviewData.visitDate);

    const restaurantsCol = await restaurantsCollection();
    const usersCol = await usersCollection();
    const reviewsCol = await reviewsCollection();

    const restaurant = await restaurantsCol.findOne({ _id: restaurantId });
    if (!restaurant) {
        throw new Error(`Restaurant with id ${restaurantId} not found`);
    }

    const user = await usersCol.findOne({ _id: new ObjectId(userId) });
    if (!user) {
        throw new Error(`User with id ${userId} not found`);
    }
    const username = checkNonEmptyString(user.username, 'username');

    const today = new Date().toISOString().split('T')[0];

    const newReview = {
        _id: new ObjectId().toString(),
        restaurantId,
        userId,
        username,
        rating,
        title,
        reviewText,
        visitDate,
        createdAt: today,
        updatedAt: today,
        helpfulCount: 0,
        reportCount: 0
    };

    const insertInfo = await reviewsCol.insertOne(newReview);
    if (!insertInfo.acknowledged) {
        throw new Error('Could not create review');
    }

    await usersCol.updateOne(
        { _id: userId },
        {
            $push: {
                reviewIds: newReview._id
            }
        }
    );

    await updateRestaurantReviewDetails(restaurantId);

    return newReview;
};

/**
 * GetReviewsByRestaurantId - gets all the reviews for that restaurant
 */
export const GetReviewsByRestaurantId = async (restaurantId) => {
    const restaurantIdStr = checkNonEmptyString(restaurantId, 'restaurantId');

    const restaurantsCol = await restaurantsCollection();
    const reviewsCol = await reviewsCollection();

    const restaurant = await restaurantsCol.findOne({ _id: restaurantIdStr });
    if (!restaurant) {
        throw new Error(`Restaurant with id ${restaurantIdStr} not found`);
    }

    const list = await reviewsCol
    .find({ restaurantId: restaurantIdStr })
    .sort({ createdAt: -1 })
    .toArray();
    
  // return [] if no reviews

  return list;
};

/**
 * GetReviewsByUserId - gets all the reviews of the user
 */
export const GetReviewsByUserId = async (userId) => {

    const userIdStr = checkNonEmptyString(userId, 'userId');
    const usersCol = await usersCollection();
    const reviewsCol = await reviewsCollection();

    const user = await usersCol.findOne({ _id: userIdStr });
    if (!user) {
        throw new Error(`User with id ${userIdStr} not found`);
    }

    const list = await reviewsCol
    .find({ userId: userIdStr })
    .sort({ createdAt: -1 })
    .toArray();

    return list;
};

export const GetbyReviewID = async (reviewId) => {
    const reviewIdStr = checkNonEmptyString(reviewId, 'reviewId');

    const reviewsCol = await reviewsCollection();
    const review = await reviewsCol.findOne({ _id: reviewIdStr });

    if (!review) {
        throw new Error(`Review with id ${reviewIdStr} not found`);
    }

    return review;
};

export const UpdateReviews = async (reviewData) => {
    if (!reviewData || typeof reviewData !== 'object' || Array.isArray(reviewData)) {
        throw new Error('reviewData must be a non-null object');
    }

    const reviewId = checkNonEmptyString(reviewData.reviewId, 'reviewId');

    const reviewsCol = await reviewsCollection();

    const oldReview = await reviewsCol.findOne({ _id: reviewId });
    if (!oldReview) {
        throw new Error(`Review with id ${reviewId} not found`);
    }

    let newRating = oldReview.rating;
    if (reviewData.rating !== undefined) {
        newRating = validateRating(reviewData.rating);
    }

    let newTitle = oldReview.title;
    if (reviewData.title !== undefined) {
        newTitle = checkNonEmptyString(reviewData.title, 'title');
    }

    let newReviewText = oldReview.reviewText;
    if (reviewData.reviewText !== undefined) {
        newReviewText = checkNonEmptyString(reviewData.reviewText, 'reviewText');
    }

    let newVisitDate = oldReview.visitDate;
    if (reviewData.visitDate !== undefined) {
        newVisitDate = normalizeVisitDate(reviewData.visitDate);
    }

    const today = new Date().toISOString().split('T')[0];

    const updateDoc = {
        rating: newRating,
        title: newTitle,
        reviewText: newReviewText,
        visitDate: newVisitDate,
        updatedAt: today
    };

    const updateInfo = await reviewsCol.updateOne(
        { _id: reviewId },
        { $set: updateDoc }
    );

    if (updateInfo.matchedCount === 0) {
        throw new Error(`Review with id ${reviewId} not found during update`);
    }

    await updateRestaurantReviewDetails(oldReview.restaurantId);

    return {
        ...oldReview,
        ...updateDoc
    };
};

export const DeleteReview = async (reviewId) => {
    const reviewIdStr = checkNonEmptyString(reviewId, 'reviewId');

    const reviewsCol = await reviewsCollection();
    const usersCol = await usersCollection();

    const review = await reviewsCol.findOne({ _id: reviewIdStr });
    if (!review) {
        throw new Error(`Review with id ${reviewIdStr} not found`);
    }

    const { restaurantId, userId } = review;

    const deleteInfo = await reviewsCol.deleteOne({ _id: reviewIdStr });
    if (deleteInfo.deletedCount === 0) {
        throw new Error(`Failed to delete review with id ${reviewIdStr}`);
    }

    await usersCol.updateOne(
        { _id: userId },
        {
        $pull: {
            reviewIds: reviewIdStr
        }
        }
    );

    await updateRestaurantReviewDetails(restaurantId);

    return review;
};
