# NYC Restaurant Health Inspector Dashboard - Database Proposal

## Group Members

- Royce Barboz
- Leshui Hu
- Amaan Rajguru
- Chenxin Zhang

---

## 1. RESTAURANTS Collection

The restaurants collection will store all NYC restaurant information including basic details, location data, and current health inspection status. Each restaurant will have a unique CAMIS ID from the NYC dataset and will store references to their inspection history and user reviews.

### Sample Document

```json
{
  "_id": "7b7997a2-c0d2-4f8c-b2-6a1d4b5b6310",
  "camis": "41417417",
  "name": "EL PALO RESTAURANT",
  "borough": "Queens",
  "building": "19625",
  "street": "JAMAICA AVENUE",
  "zipcode": "11423",
  "phone": "7184541148",
  "cuisineType": "Mexican",
  "currentGrade": "A",
  "currentScore": 12,
  "gradeDate": "2024-05-15",
  "location": {
    "latitude": 40.713364495757,
    "longitude": -73.763177200264
  },
  "communityBoard": "412",
  "councilDistrict": "23",
  "censusTract": "048400",
  "bin": "4222440",
  "bbl": "4104640038",
  "nta": "QN07",
  "inspectionIds": [
    "7b7997a2-c0d2-4f8c-b27a-6a1d4b5b6310",
    "8c8897b3-d1e3-5g9d-c38b-7b2e5c6c7421"
  ],
  "reviewIds": [
    "9d9998c4-e2f4-6h0e-d49c-8c3f6d7d8532",
    "0e0009d5-f3g5-7i1f-e50d-9d4g7e8e9643"
  ],
  "averageUserRating": 4.5,
  "totalReviews": 23,
  "createdAt": "2024-01-15",
  "updatedAt": "2024-11-05"
}
```

### Schema

| Name | Type | Description |
|------|------|-------------|
| `_id` | string | A globally unique identifier for the restaurant. |
| `camis` | string | The CAMIS ID from the NYC restaurant dataset (unique). |
| `name` | string | The name of the restaurant. |
| `borough` | string | The NYC borough where the restaurant is located (Queens, Manhattan, Brooklyn, Bronx, Staten Island). |
| `building` | string | The building number of the restaurant address. |
| `street` | string | The street name of the restaurant address. |
| `zipcode` | string | The ZIP code of the restaurant location. |
| `phone` | string | The restaurant's contact phone number. |
| `cuisineType` | string | The type of cuisine served (e.g., Mexican, Italian, Chinese, Japanese). |
| `currentGrade` | string | The most recent health inspection grade (A, B, C, P, Z, or null if pending). |
| `currentScore` | number | The most recent health inspection score (lower is better; 0-13 = A, 14-27 = B, 28+ = C). |
| `gradeDate` | string | The date when the current grade was officially issued (ISO 8601 format). |
| `location` | object | Subdocument containing latitude and longitude coordinates for map display. |
| `communityBoard` | string | NYC community board identifier. |
| `councilDistrict` | string | NYC council district identifier. |
| `censusTract` | string | Census tract identifier for demographic analysis. |
| `bin` | string | Building Identification Number from NYC dataset. |
| `bbl` | string | Borough, Block, and Lot number (NYC property identifier). |
| `nta` | string | Neighborhood Tabulation Area code for neighborhood classification. |
| `inspectionIds` | array | Array of inspection document IDs for this restaurant's inspection history. |
| `reviewIds` | array | Array of review document IDs for all user reviews of this restaurant. |
| `averageUserRating` | number | Average rating from all user reviews (1.0–5.0 scale, denormalized for performance). |
| `totalReviews` | number | Total count of reviews for this restaurant (denormalized for performance). |
| `createdAt` | string | Timestamp when the restaurant was added to the database (ISO 8601 format). |
| `updatedAt` | string | Timestamp when the restaurant record was last updated (ISO 8601 format). |

---

## 2. MENU Collection (Additional Feature)

The menu_items collection would store restaurant menu offerings, daily specials, and pricing information. This feature is referenced in wireframes but is not required for the initial launch.

### Sample Document

```json
{
  "_id": "3h3443g8-i6j8-0l4i-h83g-2g7j0h1h2976",
  "restaurantId": "5a5887a1-b0c1-3e7b-a16a-5a0d3a4a5209",
  "category": "Main Course",
  "name": "Carnitas Plate",
  "description": "Slow-cooked pork with rice, beans, and tortillas",
  "price": 16.99,
  "isSpecial": false,
  "specialDate": null,
  "isAvailable": true,
  "allergens": ["Gluten"],
  "createdAt": "2024-01-20",
  "updatedAt": "2024-10-15"
}
```

### Schema

| Name | Type | Description |
|------|------|-------------|
| `_id` | string | A globally unique identifier for the menu item. |
| `restaurantId` | string | Reference to the restaurant this item belongs to. |
| `category` | string | Menu category (e.g., Appetizer, Main Course, Dessert, Special). |
| `name` | string | Name of the menu item. |
| `description` | string | Detailed description of the dish. |
| `price` | number | Price in USD. |
| `isSpecial` | boolean | Whether this is a daily/weekly special. |
| `specialDate` | string | Date for the special (null if regular menu item). |
| `isAvailable` | boolean | Whether the item is currently available. |
| `allergens` | array | Array of strings listing common allergens in the dish (optional). |
| `createdAt` | string | Timestamp when the item was added. |
| `updatedAt` | string | Timestamp when the item was last modified. |

---

## 3. LOCATION (Subdocument)

**Note:** This is a subdocument within the RESTAURANTS collection, not a separate collection.

It stores the geographical coordinates of a restaurant for map display and distance calculations.

### Sample Document

```json
{
  "latitude": 40.713364495757,
  "longitude": -73.763177200264
}
```

### Schema

| Name | Type | Description |
|------|------|-------------|
| `latitude` | number | The latitude coordinate of the restaurant location. |
| `longitude` | number | The longitude coordinate of the restaurant location. |

---

## 4. INSPECTIONS Collection

The inspections collection will store detailed records of all health inspections conducted at NYC restaurants, including violations, scores, and inspection types. Each inspection is linked to a restaurant via the restaurant's ID.

### Sample Document

```json
{
  "_id": "7b7997a2-c0d2-4f8c-b27a-6a1d4b5b6310",
  "restaurantId": "5a5887a1-b0c1-3e7b-a16a-5a0d3a4a5209",
  "camis": "41417417",
  "inspectionDate": "2024-04-26",
  "inspectionType": "Cycle Inspection / Initial Inspection",
  "action": "Violations were cited in the following area(s).",
  "score": 24,
  "grade": "B",
  "gradeDate": "2024-05-10",
  "recordDate": "2024-11-03",
  "violations": [
    {
      "violationCode": "02B",
      "violationDescription": "Hot TCS food item not held at or above 140°F.",
      "criticalFlag": "Critical"
    },
    {
      "violationCode": "10F",
      "violationDescription": "Non-food contact surface improperly constructed.",
      "criticalFlag": "Not Critical"
    }
  ],
  "createdAt": "2024-04-26"
}
```

### Schema

| Name | Type | Description |
|------|------|-------------|
| `_id` | string | A globally unique identifier for the inspection. |
| `restaurantId` | string | Reference to the restaurant document ID. |
| `camis` | string | The CAMIS ID linking to the restaurant in the NYC dataset. |
| `inspectionDate` | string | The date when the inspection was conducted (ISO 8601 format). |
| `inspectionType` | string | The type of inspection (e.g., Initial, Re-inspection, Cycle Inspection). |
| `action` | string | The action taken during the inspection. |
| `score` | number | The numerical score assigned during the inspection (lower is better). |
| `grade` | string | The letter grade assigned (A, B, C, P, Z, or null if pending). |
| `gradeDate` | string | The date when the grade was officially issued. |
| `recordDate` | string | The date when the record was last updated in the NYC system. |
| `violations` | array | Array of violation subdocuments found during this inspection. |
| `createdAt` | string | Timestamp when the inspection was added to the database. |

---

## 5. VIOLATIONS (Subdocument)

**Note:** This is a subdocument within the INSPECTIONS collection, not a separate collection.

The violations subdocument stores individual violation details found during a health inspection.

### Sample Document

```json
{
  "violationCode": "02B",
  "violationDescription": "Hot TCS food item not held at or above 140°F.",
  "criticalFlag": "Critical"
}
```

### Schema

| Name | Type | Description |
|------|------|-------------|
| `violationCode` | string | The official NYC violation code identifier. |
| `violationDescription` | string | Detailed description of the violation found. |
| `criticalFlag` | string | Indicates severity: "Critical", "Not Critical", or "Not Applicable". |

---

## 6. USERS Collection

The users collection will store all user account information including authentication credentials, profile details, and references to their activities (reviews and favorites). Users must register and login to leave reviews and mark favorite restaurants.

### Sample Document

```json
{
  "_id": "9d9998c4-e2f4-6h0e-d49c-8c3f6d7d8532",
  "username": "johndoe2024",
  "email": "john.doe@email.com",
  "hashedPassword": "$2a$10$XdvNkfdNIL8F8xsuIUeSbNOFgK0M0iV5HOskfVn7.PWncShU.O",
  "profile": {
    "firstName": "John",
    "lastName": "Doe",
    "age": 28
  },
  "reviewIds": [
    "1f1110e6-g4h6-8j2g-f61e-0e5h8f9f0754",
    "2g2221f7-h5i7-9k3h-g72f-1f6i9g0g1865"
  ],
  "favoriteRestaurantIds": [
    "5a5887a1-b0c1-3e7b-a16a-5a0d3a4a5209",
    "6b6998b2-c1d2-4f8c-b27b-6b1e4b5b6310"
  ],
  "createdAt": "2024-01-15",
  "lastLogin": "2024-11-05"
}
```

### Schema

| Name | Type | Description |
|------|------|-------------|
| `_id` | string | A globally unique identifier for the user. |
| `username` | string | Unique username for login (case-insensitive). |
| `email` | string | User's email address (unique, case-insensitive). |
| `hashedPassword` | string | Bcrypt hashed password for authentication. |
| `profile` | object | Subdocument containing user profile information. |
| `reviewIds` | array | Array of review document IDs created by this user. |
| `favoriteRestaurantIds` | array | Array of restaurant IDs marked as favorites by the user. |
| `createdAt` | string | Timestamp when the user account was created. |
| `lastLogin` | string | Timestamp of the user's most recent login. |

---

## 7. PROFILE (Subdocument)

**Note:** This is a subdocument within the USERS collection, not a separate collection.

The profile subdocument stores personal information and preferences for a user.

### Sample Document

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "age": 28
}
```

### Schema

| Name | Type | Description |
|------|------|-------------|
| `firstName` | string | User's first name. |
| `lastName` | string | User's last name. |
| `age` | number | User's age (optional). |

---

## 8. REVIEWS Collection

The reviews collection stores user-submitted reviews and ratings for restaurants. Each review is linked to both a restaurant and a user, allowing users to share their dining experiences and help others make informed decisions about where to eat.

### Sample Document

```json
{
  "_id": "1f1110e6-g4h6-8j2g-f61e-0e5h8f9f0754",
  "restaurantId": "5a5887a1-b0c1-3e7b-a16a-5a0d3a4a5209",
  "userId": "9d9998c4-e2f4-6h0e-d49c-8c3f6d7d8532",
  "username": "johndoe2024",
  "rating": 4.5,
  "title": "Great Mexican food!",
  "reviewText": "The tacos were delicious and the service was excellent. The restaurant was very clean and the staff was friendly. I noticed they had an A rating which made me feel confident about the hygiene standards.",
  "visitDate": "2024-10-28",
  "createdAt": "2024-10-29",
  "updatedAt": "2024-10-29",
  "helpfulCount": 12,
  "reportCount": 0
}
```

### Schema

| Name | Type | Description |
|------|------|-------------|
| `_id` | string | A globally unique identifier for the review. |
| `restaurantId` | string | Reference to the restaurant being reviewed. |
| `userId` | string | Reference to the user who wrote the review. |
| `username` | string | Username of the reviewer (for display purposes). |
| `rating` | number | User's rating on a scale of 1.0 to 5.0 (in 0.5 increments). |
| `title` | string | Brief title/summary of the review. |
| `reviewText` | string | The full text content of the user's review. |
| `visitDate` | string | The date when the user visited the restaurant (optional). |
| `createdAt` | string | Timestamp when the review was created. |
| `updatedAt` | string | Timestamp when the review was last edited. |
| `helpfulCount` | number | Count of users who found this review helpful. |
| `reportCount` | number | Count of times the review was reported (for moderation). |

---

## Database Structure Summary

### Collections (5)
1. **RESTAURANTS** - Main collection storing restaurant information
2. **MENU** - Additional feature for menu items (optional)
3. **INSPECTIONS** - Health inspection records
4. **USERS** - User account information
5. **REVIEWS** - User-submitted reviews and ratings

### Subdocuments (3)
1. **LOCATION** - Within RESTAURANTS (latitude/longitude)
2. **VIOLATIONS** - Within INSPECTIONS (violation details)
3. **PROFILE** - Within USERS (personal information)

### Relationships
- **RESTAURANTS ↔ INSPECTIONS**: One-to-Many (via `inspectionIds` and `restaurantId`)
- **RESTAURANTS ↔ REVIEWS**: One-to-Many (via `reviewIds` and `restaurantId`)
- **RESTAURANTS ↔ MENU**: One-to-Many (via `restaurantId`)
- **USERS ↔ REVIEWS**: One-to-Many (via `reviewIds` and `userId`)
- **USERS ↔ RESTAURANTS**: Many-to-Many (via `favoriteRestaurantIds`)

