# MICE Trip Planning System - Complete Workflow Documentation

## 🎯 System Overview
This is a B2B trip planning platform for MICE (Meetings, Incentives, Conferences, Events) where customers submit trip requirements, admins review and recommend hotels, and customers accept/reject recommendations.

---

## 👥 User Roles

### 1. **Customer (Client/Company)**
- Submits trip planning requests
- Views their trip history
- Accepts or rejects hotel recommendations from admin

### 2. **Admin (MICE Expert/Travel Planner)**
- Reviews all incoming trip requests
- Recommends hotels based on customer requirements
- Can modify recommendations if customer rejects

---

## 📊 Complete Data Structure

### **TRIPS TABLE** (Main Database)

```javascript
{
  // SYSTEM FIELDS
  id: string,                    // Unique trip ID (auto-generated)
  email: string,                 // Customer email (from login)
  status: string,                // 'pending' | 'recommended' | 'accepted' | 'rejected'
  submittedAt: string,           // ISO timestamp of submission
  
  // PAGE 1: BASIC DETAILS (Lead Capture)
  name: string,                  // Customer name
  contact: string,               // Phone number
  location: string,              // Desired trip location
  
  // PAGE 2: EVENT PLANNING DETAILS
  
  // Event Purpose
  eventPurpose: string,          // Dropdown selection:
                                 // - Annual General Meeting (AGM) / Leadership Meet
                                 // - Product Launch / Corporate Roadshow
                                 // - Team Building / Employee Motivation Programs
                                 // - Training, Workshops & Certifications
                                 // - Channel Partner / Dealer Meets
                                 // - Award Functions / Employee Recognition Events
                                 // - Corporate Offsites / Board Meetings
                                 // - Trade Shows / Exhibitions / Business Conferences
                                 // - Customer / Client Appreciation Events
                                 // - Seminars, Panel Discussions & Networking Events
  
  // Destination Preferences
  preferredCities: string,       // Text input for preferred cities
  locationsNearby: string[],     // Multi-select checkboxes:
                                 // - Beachside
                                 // - Mountains
                                 // - City
                                 // - Forest / Nature
                                 // - Lake / Riverside
                                 // - Desert
                                 // - Historical / Cultural Sites
  
  // Accommodation Preferences
  stayType: string[],            // Multi-select checkboxes:
                                 // - Hotels
                                 // - Resorts
                                 // - Villas / Farmhouses
                                 // - Homestays / Boutique Properties
                                 // - Corporate Guest Houses
  
  starCategory: string[],        // Multi-select checkboxes:
                                 // - 3-star
                                 // - 4-star
                                 // - 5-star
                                 // - Luxury / Heritage Properties
  
  // Guest Details
  numberOfPeople: number,        // Total number of attendees
  duration: number,              // Trip duration in days
  
  // Room Requirements (Stepper controls)
  singleRooms: number,           // Number of single occupancy rooms
  doubleRooms: number,           // Number of double occupancy rooms
  tripleRooms: number,           // Number of triple occupancy rooms
  quadRooms: number,             // Number of quad occupancy rooms
  
  // Travel Dates
  checkIn: string | null,        // ISO date string
  checkOut: string | null,       // ISO date string
  
  // Event Space Requirements
  requiresEventHall: boolean,    // Toggle for event hall requirement
  hallSetup: string[],           // Multi-select (if requiresEventHall = true):
                                 // - Theatre Style
                                 // - U-Shape
                                 // - Classroom Style
                                 // - Boardroom
                                 // - Round Table
                                 // - Banquet / Gala Setup
                                 // - Cocktail / Open Layout
                                 // - Outdoor / Garden Setup
  
  // Audio-Visual Requirements
  avRequirements: string[],      // Multi-select checkboxes:
                                 // - Projector
                                 // - LED Screen / Display
                                 // - Sound System & Speakers
                                 // - Handheld Microphones
                                 // - Lapel / Collar Microphones
                                 // - Podium with Mic
                                 // - Whiteboard / Flipchart
                                 // - Video Conferencing Setup
                                 // - High-Speed Internet / Wi-Fi
  
  // Event Services
  eventServices: string[],       // Multi-select checkboxes:
                                 // - Event Coordinator / On-site Support
                                 // - Stage & Backdrop Setup
                                 // - Lighting (Basic / Decorative / Stage Lighting)
                                 // - Event Decoration & Branding
                                 // - Photography & Videography
                                 // - Live Streaming Services
                                 // - Master of Ceremonies (MC / Anchor)
                                 // - Entertainment (DJ, Band, Cultural Program)
                                 // - Team Building Activities
                                 // - Transport / Airport Transfers
                                 // - Registration & Badge Printing
  
  // Meals & Refreshments
  meals: string[],               // Multi-select checkboxes:
                                 // - Welcome Drink
                                 // - Breakfast
                                 // - Morning Tea / Coffee
                                 // - Lunch
                                 // - Evening Tea / Coffee
                                 // - Dinner
                                 // - Gala Dinner / Special Banquet
  
  mealType: string[],            // Multi-select checkboxes:
                                 // - Vegetarian
                                 // - Non-Vegetarian
                                 // - Vegan
                                 // - Both
  
  serviceStyle: string[],        // Multi-select checkboxes:
                                 // - Buffet
                                 // - Set Menu
                                 // - Live Counters
                                 // - Packed Meals / Boxed Lunch
  
  // ADMIN RECOMMENDATION (Added by Admin)
  recommendation: {
    hotelName: string,           // Name of recommended hotel
    hotelLocation: string,       // Specific location/address
    starRating: number,          // 3, 4, 5 stars
    pricePerNight: string,       // e.g., "$250 per room per night"
    amenities: string[],         // Array of amenities
    description: string,         // Why this hotel is perfect for their needs
    imageUrl?: string,           // Optional hotel image URL
    totalEstimatedCost?: string, // Optional total package cost
    adminNotes?: string          // Optional internal notes
  } | undefined
}
```

---

## 🔄 Status Lifecycle & Workflow

### **STATUS 1: PENDING** 🟠
**When:** Customer submits the trip planning form

**What Happens:**
1. Customer fills Page 1 (Basic Details) and Page 2 (Event Requirements)
2. System creates new trip record with status = "pending"
3. Trip is saved to database
4. Customer sees success message: "Thank you for submission! Waiting for admin recommendation"
5. Trip appears in customer dashboard with "Pending" badge

**Customer View:**
- See trip card with "Pending" status
- Message: "Waiting for admin to recommend a hotel..."
- Cannot take any action yet

**Admin View (Admin Dashboard):**
- See this trip in "Pending Requests" section
- Can view all customer requirements
- Has button: "Recommend Hotel"
- Admin clicks "Recommend Hotel" to move to next status

**Admin Action Required:**
- Review all customer requirements
- Research suitable hotels
- Add hotel recommendation details
- Change status to "recommended"

---

### **STATUS 2: RECOMMENDED** 🟣
**When:** Admin recommends a hotel for the trip

**What Happens:**
1. Admin reviews the pending trip request
2. Admin fills in recommendation form:
   - Hotel Name
   - Hotel Location
   - Star Rating
   - Price per Night
   - List of Amenities
   - Description (why this hotel fits their needs)
   - Optional: Total estimated cost
   - Optional: Admin notes
3. System updates trip record with recommendation object
4. Status changes to "recommended"
5. Customer is notified (email/notification - future feature)

**Customer View:**
- Trip card shows "Recommended" badge in purple
- Displays beautiful hotel recommendation card with:
  - Hotel name with star rating
  - Location
  - Price per night
  - Description
  - Amenities as tags
  - Two action buttons: **ACCEPT** and **REJECT**
  
**Customer Actions Available:**
1. **ACCEPT** - Customer likes the recommendation
   - Status changes to "accepted"
   - Booking can proceed
   
2. **REJECT** - Customer doesn't like the recommendation
   - Status changes to "rejected"
   - Admin should review and provide alternative

**Admin View:**
- See this trip in "Recommended" section
- Wait for customer response
- Can edit recommendation if needed
- Can see when customer views the recommendation

---

### **STATUS 3: ACCEPTED** ✅
**When:** Customer accepts the hotel recommendation

**What Happens:**
1. Customer clicks "Accept" button on recommended trip
2. Status changes to "accepted"
3. Admin is notified of acceptance
4. Booking process can begin (next phase)

**Customer View:**
- Trip card shows "Accepted" badge in green
- Displays hotel info with message: "You accepted this recommendation"
- No action buttons (already decided)
- May have "View Details" or "Contact Admin" option

**Admin View:**
- Trip moves to "Accepted Bookings" section
- Admin can proceed with actual hotel booking
- Can generate quotation/invoice
- Can share booking confirmation with customer

**Next Steps (Future Features):**
- Admin sends formal quotation
- Customer makes payment
- Admin confirms booking
- Admin shares booking vouchers and itinerary

---

### **STATUS 4: REJECTED** ❌
**When:** Customer rejects the hotel recommendation

**What Happens:**
1. Customer clicks "Reject" button on recommended trip
2. Status changes to "rejected"
3. Admin is notified that customer rejected the recommendation
4. Admin should review and provide alternative recommendation

**Customer View:**
- Trip card shows "Rejected" badge in red
- Displays rejected hotel info with message: "You rejected this recommendation"
- Message: "Admin will recommend an alternative hotel soon"
- No action buttons

**Admin View:**
- Trip appears in "Rejected Recommendations" section
- Admin can see which hotel was rejected
- Admin should:
  - Contact customer to understand concerns
  - Find alternative hotel
  - Add new recommendation
  - Change status back to "recommended"
  
**Admin Actions:**
1. Review rejection
2. Research alternative hotels
3. Add new recommendation
4. Status changes back to "recommended"
5. Customer sees new recommendation and can accept/reject again

---

## 🔁 Status Flow Diagram

```
[Customer Submits Form]
         ↓
    [PENDING] 🟠
         ↓
   (Admin reviews & recommends hotel)
         ↓
  [RECOMMENDED] 🟣
         ↓
    (Customer decides)
         ↓
    ┌─────────┴─────────┐
    ↓                   ↓
[ACCEPTED] ✅      [REJECTED] ❌
    ↓                   ↓
(Proceed to        (Admin finds
 booking)           alternative)
                        ↓
                  [RECOMMENDED] 🟣
                   (again with new hotel)
```

---

## 👨‍💼 Admin Dashboard Requirements

### **Dashboard Sections:**

#### 1. **Statistics Overview**
- Total Trips
- Pending Requests (need action)
- Recommended (waiting for customer)
- Accepted Bookings
- Rejected (need alternative)

#### 2. **Pending Requests Tab** 🟠
**Show all trips with status = "pending"**

For each trip, display:
- Customer name, email, contact
- Destination (location)
- Event purpose
- Number of people
- Duration and dates
- Stay type and star category preferences
- All event requirements (halls, AV, services, meals)
- Submission date

**Actions:**
- "View Details" - See full requirements
- "Recommend Hotel" - Open form to add recommendation

#### 3. **Recommended Tab** 🟣
**Show all trips with status = "recommended"**

Display:
- Customer info
- Recommended hotel details
- Status: "Waiting for customer response"
- Days since recommendation sent

**Actions:**
- "View Details"
- "Edit Recommendation" - Modify hotel details
- "Withdraw Recommendation" - Remove and go back to pending

#### 4. **Accepted Tab** ✅
**Show all trips with status = "accepted"**

Display:
- Customer info
- Accepted hotel details
- Acceptance date
- Next steps status

**Actions:**
- "Generate Quotation"
- "Send Booking Confirmation"
- "Mark as Completed"

#### 5. **Rejected Tab** ❌
**Show all trips with status = "rejected"**

Display:
- Customer info
- Previously rejected hotel
- Rejection reason (if provided)

**Actions:**
- "Recommend Alternative" - Add new recommendation
- "Contact Customer" - Get more details

---

## 📝 Admin Recommendation Form

**When admin clicks "Recommend Hotel", show form:**

```
Hotel Recommendation Form
─────────────────────────

Basic Details:
├─ Hotel Name: [text input] *required
├─ Hotel Location: [text input] *required
├─ Star Rating: [dropdown: 3/4/5 star] *required
└─ Price per Night: [text input] *required
    Example: "$250 per room per night"

Description: [textarea] *required
Write why this hotel is perfect for their needs
(Consider their event type, number of people, requirements)

Amenities: [multi-select or tag input]
Examples:
☑ Conference Hall
☑ Beachfront
☑ Swimming Pool
☑ Spa & Wellness
☑ High-Speed WiFi
☑ Business Center
☑ Restaurant
☑ Parking
☑ Airport Transfer
☑ Event Coordination Team
[+ Add Custom Amenity]

Optional Details:
├─ Total Estimated Cost: [text input]
│   Example: "$15,000 for 3 days (50 people)"
├─ Hotel Image URL: [text input]
└─ Internal Admin Notes: [textarea]
    (Not visible to customer)

[Cancel] [Save as Draft] [Submit Recommendation]
```

---

## 🎬 Complete User Journey Examples

### **Journey 1: Happy Path (Customer Accepts)**

1. **Customer logs in** → Sees dashboard
2. **Customer clicks "Plan New Trip"** → Goes to Form Page 1
3. **Fills basic details** (name, email, contact, location) → Next
4. **Fills event details** (purpose, dates, rooms, requirements) → Submit
5. **Sees success message** → Status: PENDING
6. **Returns to dashboard** → Sees trip card with "Pending" status
7. **Admin receives notification** → Reviews requirements
8. **Admin recommends "Taj Exotica Resort"** → Status: RECOMMENDED
9. **Customer refreshes dashboard** → Sees hotel recommendation card
10. **Customer likes the hotel** → Clicks "Accept" → Status: ACCEPTED
11. **Admin proceeds with booking** → Trip completed

### **Journey 2: Customer Rejects, Then Accepts Alternative**

1. **Steps 1-8 same as above** → Status: RECOMMENDED
2. **Customer doesn't like the hotel** → Clicks "Reject" → Status: REJECTED
3. **Admin sees rejection** → Researches alternative
4. **Admin recommends "Oberoi Resort"** instead → Status: RECOMMENDED
5. **Customer sees new recommendation** → Likes it → Clicks "Accept"
6. **Status: ACCEPTED** → Booking proceeds

---

## 🗄️ Database Tables Summary

### **Main Tables Needed:**

#### **1. users**
```javascript
{
  id: string,
  email: string,
  password: string (hashed),
  name: string,
  role: 'customer' | 'admin',
  createdAt: timestamp
}
```

#### **2. trips** (Main table - shown in detail above)
```javascript
{
  id: string,
  userId: string (foreign key to users),
  email: string,
  status: 'pending' | 'recommended' | 'accepted' | 'rejected',
  ...all form fields...,
  recommendation: object | null,
  submittedAt: timestamp,
  lastUpdated: timestamp
}
```

#### **3. recommendations_history** (Optional - for tracking)
```javascript
{
  id: string,
  tripId: string (foreign key),
  hotelName: string,
  hotelDetails: object,
  recommendedAt: timestamp,
  recommendedBy: string (admin id),
  customerAction: 'accepted' | 'rejected' | 'pending',
  customerActionAt: timestamp | null
}
```

#### **4. notifications** (Future feature)
```javascript
{
  id: string,
  userId: string,
  tripId: string,
  message: string,
  read: boolean,
  createdAt: timestamp
}
```

---

## 🔐 Access Control

### **Customer Can:**
- ✅ Create new trips
- ✅ View their own trips only
- ✅ Accept/Reject recommendations
- ✅ View trip history
- ❌ Cannot see other customers' trips
- ❌ Cannot edit submitted trips (admin does modifications)

### **Admin Can:**
- ✅ View ALL trips from all customers
- ✅ Filter trips by status
- ✅ Add recommendations to pending trips
- ✅ Edit existing recommendations
- ✅ View customer contact details
- ✅ Export trip data
- ✅ Manage user accounts (if needed)

---

## 📧 Email Notifications (Future Feature)

### **Customer Receives Email When:**
1. Trip submitted successfully (confirmation)
2. Admin recommends a hotel (with hotel details)
3. Admin updates recommendation after rejection

### **Admin Receives Email When:**
1. New trip submitted (pending review)
2. Customer accepts recommendation
3. Customer rejects recommendation

---

## 💡 Business Logic Rules

1. **A trip must have status** at all times (default: "pending")
2. **Only trips with status "recommended"** can be accepted/rejected
3. **Customer can only see their own trips** (filtered by email/userId)
4. **Admin can only add recommendation to "pending" or "rejected" trips**
5. **When customer rejects, admin should provide alternative** (status goes pending → recommended again)
6. **Accepted trips should have recommendation data** (cannot be null)
7. **Room numbers must add up logically** with numberOfPeople
8. **Check-out date must be after check-in date**
9. **Duration should match** date range (auto-calculate or validate)

---

## 🚀 Future Enhancements

1. **Payment Integration** - Collect deposits after acceptance
2. **Document Management** - Share quotations, invoices, vouchers
3. **Chat/Messaging** - Direct communication between customer and admin
4. **Multi-Hotel Options** - Admin can recommend 2-3 hotels, customer picks one
5. **Booking Calendar** - Visual calendar showing all bookings
6. **Review System** - Customer reviews after trip completion
7. **Analytics Dashboard** - Conversion rates, popular destinations
8. **Mobile App** - Native apps for customers and admins
9. **WhatsApp Integration** - Notifications via WhatsApp
10. **CRM Integration** - Sync with Salesforce, HubSpot, etc.

---

## 📱 Admin Dashboard Pages Structure

```
Admin Dashboard
├─ Overview (Stats & Charts)
├─ Trips
│  ├─ All Trips
│  ├─ Pending Requests 🟠
│  ├─ Recommended 🟣
│  ├─ Accepted ✅
│  └─ Rejected ❌
├─ Customers
│  ├─ All Customers
│  └─ Customer Details
├─ Hotels (Database)
│  ├─ All Hotels
│  └─ Add New Hotel
├─ Reports
│  ├─ Monthly Report
│  └─ Revenue Report
└─ Settings
   ├─ Profile
   └─ Notifications
```

---

## ✅ Summary for Admin Dashboard Development

**What Admin Dashboard Needs to Do:**

1. **View all trips** across all customers
2. **Filter by status** (Pending, Recommended, Accepted, Rejected)
3. **See detailed requirements** for each trip
4. **Add hotel recommendations** with full details
5. **Edit recommendations** if needed
6. **Track which trips need action** (pending & rejected)
7. **Monitor accepted bookings** for follow-up
8. **Search/filter** by customer, destination, dates
9. **Export data** to Excel/CSV
10. **Send notifications** to customers (future)

**Key Admin Actions:**
- ➡️ Review pending trip
- ➡️ Add recommendation (pending → recommended)
- ➡️ Edit recommendation
- ➡️ Provide alternative (rejected → recommended)
- ➡️ Mark as completed (accepted → completed)

---

This is your complete system workflow! Use this to create your admin dashboard prompt for ChatGPT. 🚀
