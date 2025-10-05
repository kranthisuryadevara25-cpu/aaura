
# Firestore Query Examples for Aaura App Feed

This document provides JavaScript/TypeScript examples of Firestore queries for fetching data for the various content cards in the Aaura app's main feed. It also includes the necessary index definitions for optimal performance.

**Note:** For these queries to work efficiently, you must add the specified composite indexes to your `firestore.indexes.json` file and deploy them.

---

### 1. TempleCard Feed (Paginated by Rating)

Fetch the top 20 temples, ordered by their average rating, with support for pagination.

**Query Structure:**

```javascript
import { collection, query, orderBy, limit, startAfter, getDocs } from 'firebase/firestore';

async function fetchTopTemples(db, lastVisibleTemple) {
  const templesRef = collection(db, 'temples');
  let q;

  if (lastVisibleTemple) {
    // Fetch the next page
    q = query(
      templesRef,
      orderBy('rating', 'desc'),
      startAfter(lastVisibleTemple),
      limit(20)
    );
  } else {
    // Fetch the first page
    q = query(
      templesRef,
      orderBy('rating', 'desc'),
      limit(20)
    );
  }

  const documentSnapshots = await getDocs(q);

  // Get the last visible document for pagination
  const newLastVisible = documentSnapshots.docs[documentSnapshots.docs.length - 1];

  const temples = documentSnapshots.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  return { temples, newLastVisible };
}
```

**Required Index:**

To perform this query, you need an index on the `rating` field in the `temples` collection.

```json
{
  "collectionGroup": "temples",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "rating", "order": "DESCENDING" }
  ]
}
```

---

### 2. DeityCard Feed (Latest Added)

Fetch the 10 most recently added deities. This assumes you add a `createdAt` timestamp field when creating deity documents.

**Query Structure:**

```javascript
import { collection, query, orderBy, limit } from 'firebase/firestore';

// Assumes 'deities' documents have a 'createdAt' timestamp field.
const deitiesRef = collection(db, 'deities');
const q = query(deitiesRef, orderBy('createdAt', 'desc'), limit(10));

const querySnapshot = await getDocs(q);
const deities = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
```

**Required Index:**

```json
{
  "collectionGroup": "deities",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "createdAt", "order": "DESCENDING" }
  ]
}
```

---

### 3. StoryCard Feed (Latest Stories)

Fetch the 15 most recent mythological stories.

**Query Structure:**

```javascript
import { collection, query, orderBy, limit } from 'firebase/firestore';

const storiesRef = collection(db, 'stories');
const q = query(storiesRef, orderBy('createdAt', 'desc'), limit(15));
```

**Required Index:**

```json
{
  "collectionGroup": "stories",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "createdAt", "order": "DESCENDING" }
  ]
}
```

---

### 4. FestivalCard Feed (Upcoming Festivals)

Fetch all festivals starting from today onwards.

**Query Structure:**

```javascript
import { collection, query, where, orderBy } from 'firebase/firestore';

const festivalsRef = collection(db, 'festivals');
const today = new Date();

const q = query(
  festivalsRef,
  where('date', '>=', today),
  orderBy('date', 'asc')
);
```

**Required Index:**

```json
{
  "collectionGroup": "festivals",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "date", "order": "ASCENDING" }
  ]
}
```

---

### 5. PanchangCard (Today's Panchang)

Fetch the panchang data for a specific date. The document ID should be the date in `YYYY-MM-DD` format.

**Query Structure:**

```javascript
import { doc, getDoc } from 'firebase/firestore';

// Get today's date in YYYY-MM-DD format
const today = new Date().toISOString().split('T')[0];
const panchangDocRef = doc(db, 'panchang', today);

const docSnap = await getDoc(panchangDocRef);

if (docSnap.exists()) {
  const panchangData = docSnap.data();
} else {
  console.log("No panchang data for today!");
}
```

**Required Index:**

No index is required for fetching a document by its ID.

---

### 6. MediaCard Feed (Latest Media)

Fetch the 10 latest videos or audio files.

**Query Structure:**

```javascript
import { collection, query, orderBy, limit } from 'firebase/firestore';

const mediaRef = collection(db, 'media');
const q = query(mediaRef, orderBy('uploadDate', 'desc'), limit(10));
```

**Required Index:**

```json
{
  "collectionGroup": "media",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "uploadDate", "order": "DESCENDING" }
  ]
}
```

---

### 7. ForumPostCard Feed (Latest Posts)

Fetch the 10 most recent forum posts.

**Query Structure:**

```javascript
import { collection, query, orderBy, limit } from 'firebase/firestore';

const postsRef = collection(db, 'posts');
const q = query(postsRef, orderBy('createdAt', 'desc'), limit(10));
```

**Required Index:**

```json
{
  "collectionGroup": "posts",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "createdAt", "order": "DESCENDING" }
  ]
}
```

---

### 8. ShopItemCard Feed (By Popularity)

Fetch available shop items, sorted by a `popularity` score. This assumes you have a `popularity` field (e.g., number of sales or views) and an `inventory` field.

**Query Structure:**

```javascript
import { collection, query, where, orderBy, limit } from 'firebase/firestore';

const productsRef = collection(db, 'products');

const q = query(
  productsRef,
  where('inventory', '>', 0),
  orderBy('inventory', 'asc'), // Firestore requires the first orderBy to match the inequality
  orderBy('popularity', 'desc'),
  limit(20)
);
```

**Required Index:**

```json
{
  "collectionGroup": "products",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "inventory", "order": "ASCENDING" },
    { "fieldPath": "popularity", "order": "DESCENDING" }
  ]
}
```
