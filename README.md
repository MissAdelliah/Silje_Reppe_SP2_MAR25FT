# Second Story

Semester Project 2 - Auction website built with Vanilla JavaScript and Tailwind CSS.

Second Story is a student-only auction marketplace created for the Noroff Semester Project 2. The application allows visitors to browse and search active auction listings, while authenticated Noroff students can create listings, manage their profile, bid with virtual credits, and manage their own auctions.

Features:

-Visitors
-Browse active auction listings
-Search, sort, and filter listings
-Open a single listing and view its details
-View listing images and bid history
-View auction status and time remaining
-Registered users
-Register with a @stud.noroff.no email address
-Log in and log out
-View current credit balance in the shared navigation
-Create auction listings
-Preview a listing before publishing
-Add multiple image URLs to a listing
-Edit owned listings
-Preview listing changes before updating
-Delete owned listings with confirmation
-Place bids on listings created by other users
-Review a bid before confirming it
-View bidding activity
-Edit profile bio, avatar, and banner
-View active listings on a profile
-View listings the current user has bid on

Built with:

-HTML5
-Vanilla JavaScript / ES6 modules
-Tailwind CSS 4.3.3 CLI
-Vite
-Noroff API v2
-Google Fonts
-Material Symbols Google

API

This project uses the Noroff API v2 Auction endpoints for:

Authentication
Auction listings
Bidding
Profiles
Credit balances

API documentation:
https://docs.noroff.dev/docs/v2

This project was developed with Node.js 22.

Installation

Clone the repository:
git clone
Move into the project folder:
cd
Install dependencies:
npm install
Environment variables
Create a .env file in the project root.
Add your Noroff API key:
VITE_NOROFF_API_KEY=your_api_key_here
The real .env file should not be committed to GitHub.
An .env.example file should be included in the repository to document the required variable without exposing the real key.
Run locally
Start Vite and the Tailwind CSS watcher:
npm run dev
Vite will print the local development URL in the terminal.

Project structure:

.
├── assets/
│ └── images/
├── css/
│ ├── input.css
│ └── style.css
├── js/
│ ├── api/
│ │ ├── apiClient.js
│ │ ├── auth.js
│ │ ├── config.js
│ │ ├── listings.js
│ │ └── profiles.js
│ ├── components/
│ │ ├── drawer.js
│ │ ├── footer.js
│ │ ├── header.js
│ │ ├── listingCard.js
│ │ └── listingPreview.js
│ ├── pages/
│ │ ├── auth.js
│ │ ├── createListing.js
│ │ ├── editListing.js
│ │ ├── home.js
│ │ ├── listing.js
│ │ └── profile.js
│ └── utils/
│ ├── dates.js
│ ├── filters.js
│ ├── storage.js
│ └── validation.js
├── auth.html
├── create.html
├── edit.html
├── index.html
├── listing.html
├── profile.html
├── .env.example
├── package.json
└── README.md

Design and project decisions:

The project was intentionally scoped around active auction activity.
The original concept included a larger digital wardrobe with sold items, purchases, and transaction history. The supplied auction API does not provide the broader transaction functionality required for that experience, so the profile focuses on active listings and bidding activity instead.

Testing:

Before submission, the application should be manually tested for:
Registration validation
Login and logout
Search, sort, and filters
Listing creation
Listing preview
Listing editing
Edit ownership protection
Listing deletion
Bidding validation
Credit balance updates
Profile editing
Responsive behaviour
Keyboard navigation
Broken links
Console errors
Production deployment
Lighthouse test

Author: Silje Reppe

Semester Project 2
