# STEX — Student Skill Exchange Platform

## Product Requirements Document (PRD)

**Product Name:** STEX  
**Full Name:** Student Skill Exchange Platform  
**Product Type:** Student-to-student skill exchange and collaboration platform  
**Target Users:** College/University Students  
**Primary Platform:** Web Application  
**Future Platform:** Android / iOS Application  
**Version:** 1.0 MVP  
**Document Status:** Product Definition  

---

# 1. Product Overview

STEX is a student-focused skill exchange platform that allows college students to **teach, learn, connect, and collaborate with other students**.

Many students possess useful skills but do not have an easy way to find other students who want to learn those skills. At the same time, students often want to learn skills but cannot afford paid courses or do not know whom to approach.

STEX solves this problem by creating a peer-to-peer learning ecosystem.

A student can:

* Create a profile.
* List skills they know.
* List skills they want to learn.
* Discover students who can teach those skills.
* Connect with other students.
* Exchange knowledge without requiring monetary payment.
* Chat with other students.
* Share learning resources.
* Create or join project teams.
* Find students with specific skills required for a project.
* Share project requirements and collaborate.

### Core Concept

> **"I teach what I know, you teach what you know."**

STEX turns students from only **learners** into both **learners and teachers**.

---

# 2. Problem Statement

College students frequently face the following problems:

### Problem 1 — Difficulty finding peers with specific skills

A student may want to learn:

* Python
* C++
* Web Development
* UI/UX
* Video Editing
* Photoshop
* Blender
* Public Speaking
* Guitar
* Photography
* Digital Marketing

But they may not know which students around them possess these skills.

### Problem 2 — Expensive learning resources

Professional courses and private tutoring can be expensive, particularly for students.

### Problem 3 — Underutilized student skills

Many students already have valuable skills but do not have a platform to share them with their peers.

### Problem 4 — Difficulty forming project teams

Students working on projects often need people with specific skills.

For example:

> "I know Python and need someone who knows UI/UX and someone who knows machine learning."

Finding those people manually can be difficult.

### Problem 5 — Fragmented student communities

Students often depend on:

* WhatsApp groups
* Instagram
* Telegram
* Discord
* Personal contacts

for finding collaborators and learning partners.

These platforms are not specifically designed around student skill exchange.

---

# 3. Product Vision

STEX aims to build a student community where **knowledge can be exchanged freely and students can discover collaborators based on skills rather than popularity or social connections.**

The long-term vision is to create a platform where students can:

**Learn → Teach → Connect → Build → Grow**

---

# 4. Product Goals

## Primary Goals

1. Create a centralized platform for student skill exchange.
2. Help students discover peers based on skills.
3. Encourage peer-to-peer learning.
4. Make basic knowledge exchange accessible without requiring paid courses.
5. Help students find project collaborators.
6. Build a student-oriented professional/learning network.
7. Encourage students to showcase their skills.

## Secondary Goals

* Build student communities around common interests.
* Encourage collaborative projects.
* Help students discover new skills.
* Create opportunities for students to gain practical experience.
* Eventually expand the platform across universities.

---

# 5. Target Users

## Persona 1 — The Learner

**Example:**

A first-year CSE student wants to learn Python.

### Needs

* Find someone who knows Python.
* Ask questions.
* Learn through direct interaction.
* Find resources.
* Practice together.

### STEX Solution

The student searches for **Python**, finds students who teach Python, and sends a connection request.

---

# 6. Persona 2 — The Skill Sharer

A student knows:

* Photoshop
* Video Editing
* Canva
* UI/UX

but has no platform to teach other students.

### STEX Solution

The student lists those skills on their profile and becomes discoverable to students looking for them.

---

# 7. Persona 3 — The Project Builder

A student wants to build a college project.

### Project:

AI-based attendance system.

### Required skills:

* Python
* Machine Learning
* Frontend
* UI/UX

The student can create a project requirement and find students with the required skills.

---

# 8. Persona 4 — The Multi-Skilled Student

A student knows:

* C++
* Java
* Web Development

and wants to learn:

* React
* UI/UX

STEX allows this student to simultaneously act as:

**Teacher + Learner**

This is the fundamental model of the platform.

---

# 9. Core Value Proposition

### For Students

> Find people who know what you want to learn and people who want to learn what you know.

### For Colleges

> Build a stronger student learning and collaboration ecosystem.

### For Projects

> Find teammates based on actual skills and project requirements.

---

# 10. Core Product Modules

The STEX MVP will consist of the following modules:

1. Authentication
2. Student Profile
3. Skill Management
4. Skill Discovery
5. Student Discovery
6. Matching System
7. Connection Requests
8. Messaging
9. Resource Sharing
10. Project Collaboration
11. Notifications
12. Search and Filters
13. Reviews / Feedback
14. Safety and Reporting
15. Dashboard

---

# 11. User Registration & Authentication

## Requirements

Users should be able to create an account using:

* Email
* Password
* College/university
* Student name

### Optional future authentication

* Google login
* College email verification
* Student ID verification

---

## Registration Fields

| Field           | Required                   |
| --------------- | -------------------------- |
| Full Name       | Yes                        |
| Email           | Yes                        |
| Password        | Yes                        |
| College         | Yes                        |
| Course          | Yes                        |
| Year/Semester   | Yes                        |
| Profile Picture | Optional                   |
| Bio             | Optional                   |
| Skills          | Optional during onboarding |

---

# 12. Onboarding

After registration, STEX should guide the user through a simple onboarding process.

### Step 1

"What skills do you know?"

Example:

* C++
* Python
* Photoshop

### Step 2

"What skills do you want to learn?"

Example:

* React
* UI/UX
* Machine Learning

### Step 3

"What are you interested in?"

Example:

* Coding
* Design
* Entrepreneurship
* Music
* Photography

### Step 4

"What are you looking for?"

Options:

* Learn a skill
* Teach a skill
* Find project teammates
* Collaborate
* All of the above

---

# 13. User Profile

Each student receives a public STEX profile.

## Profile Structure

### Header

* Profile picture
* Name
* College
* Course
* Year
* Short bio

### Skills I Know

Example:

**Skills I Can Teach**

* C++
* Python
* HTML/CSS
* Video Editing

### Skills I Want to Learn

* React
* UI/UX
* Machine Learning

### Interests

* Web Development
* AI
* Startups
* Gaming

### Projects

Display projects the student has participated in.

### Achievements

Optional future feature.

### Availability

Students can optionally indicate:

* Available
* Busy
* Weekends only

---

# 14. Skill System

STEX should maintain a standardized skill database.

## Skill Categories

### Programming

* C
* C++
* Java
* Python
* JavaScript
* PHP
* SQL

### Web Development

* HTML
* CSS
* React
* Node.js
* Backend Development

### Design

* UI/UX
* Figma
* Photoshop
* Illustrator
* Canva

### Creative

* Photography
* Video Editing
* Animation
* Blender
* Sketching

### Business

* Marketing
* Entrepreneurship
* Finance
* Presentation
* Public Speaking

### Other

The system should allow users to suggest new skills.

---

# 15. Skill Discovery

The user should be able to search for a skill.

Example:

> Search: "Python"

The platform should display students who have listed Python under:

**Skills I Can Teach**

Each result should display:

* Name
* Profile picture
* College
* Skill
* Experience level
* Rating
* Availability
* Connect button

---

# 16. Search & Filtering

Users should be able to filter results using:

### Filters

* Skill
* College
* Course
* Year
* Experience level
* Availability
* Rating
* Location/campus
* Online/offline
* Interests

---

# 17. Matching System

STEX should provide intelligent recommendations based on the user's profile.

### Example

User knows:

> Python, C++

User wants:

> UI/UX, React

The system can recommend students who:

**Teach:**

UI/UX / React

and potentially:

**Want to learn:**

Python / C++

This creates a two-way skill exchange.

---

# 18. Match Score

The system can calculate a basic compatibility score.

Example:

```text
Skill Match
+
Learning Match
+
Interest Match
+
Project Match
+
Availability Match
```

The exact scoring algorithm can be improved later.

### Example

Student A:

**Can teach:** Python  
**Wants:** UI/UX  

Student B:

**Can teach:** UI/UX  
**Wants:** Python  

This represents a strong reciprocal match.

---

# 19. Connection System

Users should not automatically gain access to another student's private communication.

Instead:

### Flow

```text
Search Student
      ↓
View Profile
      ↓
Send Connection Request
      ↓
Student Accepts
      ↓
Connection Created
      ↓
Chat Enabled
```

Connection requests should include an optional message.

Example:

> "Hey! I noticed you know UI/UX. I'm currently learning it and would love to exchange knowledge."

---

# 20. Messaging System

Connected students should be able to communicate.

## Features

* One-to-one chat
* Text messages
* Image sharing
* File/resource sharing
* Links
* Basic emoji support

### Future Features

* Voice calls
* Video calls
* Screen sharing
* Group chats

These are not required for the MVP.

---

# 21. Learning Sessions

A future feature can allow students to organize learning sessions.

Example:

### Python Basics Session

**Teacher:** Rahul  
**Topic:** Python Basics  
**Duration:** 1 hour  
**Mode:** Online  
**Participants:** 5  

Students can request to join.

---

# 22. Resource Sharing

Students should be able to share useful resources.

Examples:

* YouTube videos
* PDFs
* Websites
* GitHub repositories
* Notes
* Presentations
* Practice problems

Resources can be attached to:

* Profiles
* Chats
* Learning sessions
* Projects

---

# 23. Project Collaboration Module

This is one of STEX's major differentiating features.

Students should be able to create project listings.

### Example

**Project Name:**

AI Attendance System

**Description:**

"We are building an AI-based attendance system for our college project."

### Required Skills

* Python
* Machine Learning
* HTML/CSS
* UI/UX

### Team Size

4

### Current Team

2/4

### Looking For

* ML Developer
* UI/UX Designer

Students can apply to join.

---

# 24. Project Creation Flow

```text
Create Project
      ↓
Enter Project Details
      ↓
Add Required Skills
      ↓
Set Team Size
      ↓
Publish Project
      ↓
Students Discover Project
      ↓
Students Apply
      ↓
Project Owner Reviews
      ↓
Accept / Reject
      ↓
Team Created
```

---

# 25. Project Dashboard

Once a student joins a project, the project dashboard can contain:

* Project description
* Team members
* Required skills
* Tasks
* Resources
* Progress
* Messages
* Files

### MVP

Only basic team/member information is required.

Advanced task management can be added later.

---

# 26. Community / Feed

STEX may include a student community feed.

Users can post:

* Learning questions
* Project ideas
* Skill-sharing offers
* Collaboration requests
* Achievements
* Resources

Example:

> "Looking for someone who knows Blender to collaborate on a 3D animation project."

Other students can respond or connect.

---

# 27. Reviews & Feedback

After completing a learning interaction, users can optionally provide feedback.

### Example

**Rating:** 5/5

**Feedback:**

> "Very helpful and explained Python concepts clearly."

The system should prevent users from repeatedly rating the same interaction.

---

# 28. Notifications

Users should receive notifications for:

* Connection requests
* Accepted requests
* New messages
* Project applications
* Project invitations
* Learning session invitations
* Resource interactions

### Notification Example

> 🔔 Ananya wants to connect with you.

---

# 29. Dashboard

The dashboard should provide a quick overview.

### Dashboard Sections

**Welcome back, Yuvraj 👋**

### Your Skills

* C++
* Python
* Web Development

### You Want to Learn

* React
* UI/UX

### Recommended Students

3–5 relevant profiles.

### Recommended Projects

Projects requiring the user's skills.

### Pending Requests

Connection requests awaiting action.

---

# 30. Home Page

The landing page should clearly explain STEX.

## Hero Section

### Headline

> **Learn. Teach. Connect. Build.**

### Subheadline

> Exchange skills with students, discover collaborators, and build projects together.

### CTA

**Get Started**

Secondary CTA:

**Explore Skills**

---

# 31. Main Navigation

Recommended navigation:

```text
STEX Logo

Home
Explore
Projects
Messages
Community

----------------

Notifications
Profile
Settings
```

---

# 32. Explore Page

The Explore page should have tabs:

### Students

Find students based on skills.

### Skills

Browse available skills.

### Projects

Find projects looking for collaborators.

### Resources

Discover shared learning resources.

---

# 33. Database Structure

A basic backend database can contain the following entities.

## Users

```text
User
----------------
user_id
name
email
password
college
course
year
bio
profile_image
created_at
```

## Skills

```text
Skill
----------------
skill_id
skill_name
category
```

## User Skills

```text
UserSkill
----------------
user_id
skill_id
type
level
```

Where:

```text
type =
TEACH
or
LEARN
```

---

# 34. Connections

```text
Connection
----------------
connection_id
sender_id
receiver_id
status
created_at
```

Status:

```text
Pending
Accepted
Rejected
Blocked
```

---

# 35. Messages

```text
Message
----------------
message_id
sender_id
receiver_id
message
attachment
created_at
read_status
```

---

# 36. Projects

```text
Project
----------------
project_id
owner_id
title
description
team_size
status
created_at
```

---

# 37. Project Skills

```text
ProjectSkill
----------------
project_id
skill_id
required_level
```

---

# 38. Project Members

```text
ProjectMember
----------------
project_id
user_id
role
status
joined_at
```

---

# 39. Reviews

```text
Review
----------------
review_id
reviewer_id
reviewed_user_id
rating
comment
created_at
```

---

# 40. Functional Requirements

## FR-01 — User Registration

The system shall allow students to create accounts.

## FR-02 — Authentication

The system shall authenticate registered users securely.

## FR-03 — Profile Management

Users shall be able to create and edit profiles.

## FR-04 — Skill Management

Users shall be able to add skills they know and skills they want to learn.

## FR-05 — Skill Search

Users shall be able to search for students by skill.

## FR-06 — Student Discovery

Users shall be able to browse student profiles.

## FR-07 — Connections

Users shall be able to send, accept, reject, and remove connections.

## FR-08 — Messaging

Connected users shall be able to communicate.

## FR-09 — Projects

Users shall be able to create and discover projects.

## FR-10 — Project Applications

Users shall be able to apply to join projects.

## FR-11 — Notifications

The system shall notify users about important activities.

## FR-12 — Reviews

Users shall be able to submit feedback after interactions.

## FR-13 — Reporting

Users shall be able to report inappropriate content or users.

---

# 41. Non-Functional Requirements

## Performance

Pages should load quickly under normal network conditions.

Target:

**< 3 seconds** for standard page loads.

## Scalability

The architecture should allow expansion from:

```text
100 students
↓
1,000 students
↓
1,0000 students
↓
Multiple colleges
```

## Security

The platform should:

* Hash passwords.
* Protect user sessions.
* Validate inputs.
* Restrict unauthorized access.
* Secure file uploads.
* Prevent basic SQL injection/XSS attacks.

## Privacy

Users should have control over:

* Profile visibility
* Contact information
* Messages
* Project participation

---

# 42. Safety Features

Because STEX involves student-to-student communication, safety should be part of the product.

### Required MVP features

* Block user
* Report user
* Report message
* Report project
* Basic content moderation
* Account deletion

### Future

* Automated moderation
* Suspicious-account detection
* Verified college accounts

---

# 43. Admin Panel

An administrator should be able to manage:

### Users

* View users
* Suspend accounts
* Delete accounts
* Handle reports

### Skills

* Add skills
* Remove duplicate skills
* Categorize skills

### Projects

* Review reported projects
* Remove inappropriate projects

### Reports

Dashboard showing:

```text
Total Users
Active Users
New Users
Projects
Connections
Reports
```

---

# 44. MVP Scope

The first version should remain simple.

## MVP Features

### Authentication

✓ Register  
✓ Login  
✓ Logout  

### Profile

✓ Student profile  
✓ Bio  
✓ College  
✓ Skills I Know  
✓ Skills I Want  

### Discovery

✓ Search students  
✓ Search skills  
✓ Filters  

### Connections

✓ Send request  
✓ Accept/reject request  

### Communication

✓ Basic messaging  

### Projects

✓ Create project  
✓ Browse projects  
✓ Apply to project  

### Notifications

✓ Connection notifications  
✓ Message notifications  
✓ Project notifications  

### Safety

✓ Report  
✓ Block  

---

# 45. Features NOT Required in MVP

The following should be considered future features:

* Video calls
* Voice calls
* AI tutor
* AI-generated learning plans
* Gamification
* Certificates
* Payments
* Advanced recommendation algorithms
* Live classes
* College-wide analytics
* Mobile application
* Advanced project management
* Skill verification

This prevents the first version from becoming unnecessarily complicated.

---

# 46. Future Features

## AI Skill Matching

AI could analyze:

* Skills
* Learning goals
* Projects
* Interests
* Experience

and recommend suitable students.

---

## AI Learning Assistant

Students could ask:

> "I want to learn React from scratch."

STEX could generate a learning roadmap and recommend students who teach React.

---

## Skill Verification

Students could optionally verify skills through:

* Mini quizzes
* Projects
* Peer endorsements
* Certificates
* Portfolio links

---

## Gamification

Users could earn:

* XP
* Badges
* Skill points
* Contribution levels

Example:

```text
Beginner
↓
Contributor
↓
Mentor
↓
Expert
```

---

# 47. Business Model

STEX's core student-to-student knowledge exchange can remain free.

Potential future revenue sources include:

### College Partnerships

Universities could pay for:

* Private student communities
* Analytics
* Project collaboration systems
* Skill dashboards

### Premium Features

Optional premium features could include:

* Advanced matching
* Portfolio enhancement
* AI learning assistant
* Verified profiles

### Sponsorships

Companies could sponsor:

* Hackathons
* Challenges
* Student projects

The basic skill exchange should remain accessible to students.

---

# 48. Key Metrics / KPIs

STEX should measure:

### User Growth

* Total registered students
* Daily active users
* Monthly active users

### Skill Exchange

* Skills listed
* Learning requests
* Successful connections
* Learning sessions

### Collaboration

* Projects created
* Project applications
* Teams formed
* Projects completed

### Engagement

* Messages sent
* Profiles viewed
* Connections made
* Resources shared

### Retention

* 7-day retention
* 30-day retention
* Returning users

---

# 49. Success Criteria for MVP

The MVP can be considered successful if students can complete the following journey:

```text
Register
   ↓
Create Profile
   ↓
Add Skills
   ↓
Find Student
   ↓
Send Connection
   ↓
Connect
   ↓
Chat
   ↓
Exchange Knowledge
```

And:

```text
Create Project
   ↓
Specify Required Skills
   ↓
Students Discover Project
   ↓
Student Applies
   ↓
Owner Accepts
   ↓
Team Created
```

---

# 50. Example User Journey

### User

Yuvraj

### Skills

Knows:

* C++
* HTML
* CSS

Wants to learn:

* React
* UI/UX

### Step 1

Yuvraj creates a STEX account.

### Step 2

He adds his skills.

### Step 3

He searches:

> UI/UX

### Step 4

STEX displays students who teach UI/UX.

### Step 5

Yuvraj views a student's profile.

### Step 6

He sends a connection request.

### Step 7

The student accepts.

### Step 8

They start chatting.

### Step 9

Yuvraj helps the student with C++.

### Step 10

The other student teaches Yuvraj UI/UX.

### Result

A successful peer-to-peer skill exchange occurs.

---

# 51. Project User Journey

### Student wants to build:

"College Event Management Website"

### Required skills:

* HTML/CSS
* JavaScript
* UI/UX
* Backend

The student creates the project on STEX.

Another student searches projects and finds it.

They apply because they know UI/UX.

The project owner accepts them.

A team is created.

The students collaborate through STEX.

---

# 52. Suggested Technology Stack

For the web MVP:

## Frontend

* HTML
* CSS
* JavaScript

or preferably:

* React.js

## Backend

Possible options:

* Node.js + Express
* Firebase
* Supabase

For a student project, Firebase/Supabase can significantly simplify authentication and database implementation.

## Database

* PostgreSQL
* Firebase Firestore

## Authentication

* Firebase Authentication
* Supabase Auth

## Hosting

* Vercel
* Netlify
* Firebase Hosting

---

# 53. Recommended MVP Architecture

```text
                STEX
                  |
        ----------------------
        |                    |
     Frontend              Backend
        |                    |
      React              Node/Firebase
        |                    |
        -------- Database ---
                  |
              PostgreSQL
```

For the initial college prototype, a simpler architecture can be used.

---

# 54. UI/UX Principles

STEX should feel:

* Student-friendly
* Modern
* Clean
* Simple
* Collaborative
* Professional

Avoid making the interface feel like a traditional educational portal.

The platform should feel closer to a combination of:

**Student Community + Skill Marketplace + Collaboration Platform**

without requiring monetary transactions.

---

# 55. Design System

### Primary Navigation

Simple sidebar/navbar.

### Cards

Student cards should display:

```text
[Profile Photo]

Rahul Patel
CSE • Semester 3

Can Teach:
Python • ML

Wants:
UI/UX • Figma

[View Profile]
[Connect]
```

### Project Card

```text
AI Attendance System

Looking for:
Python • ML • UI/UX

Team: 2/4

[View Project]
[Apply]
```

---

# 56. Accessibility

The application should support:

* Keyboard navigation
* Readable typography
* Adequate contrast
* Responsive design
* Mobile-friendly layout
* Clear error messages
* Accessible form labels

---

# 57. Responsive Design

STEX should work on:

* Desktop
* Laptop
* Tablet
* Mobile

The mobile layout should prioritize:

```text
Home
Explore
Projects
Messages
Profile
```

---

# 58. Edge Cases

The system should handle:

### Duplicate skills

Prevent duplicate entries such as:

```text
JavaScript
Javascript
javascript
```

### Duplicate connection requests

A user should not be able to send multiple pending requests to the same student.

### Blocked users

Blocked users should not be able to:

* Message
* Send connection requests
* Interact with the blocker

### Deleted account

The system should appropriately handle the user's:

* Profile
* Connections
* Messages
* Projects

---

# 59. Product Roadmap

## Phase 1 — Prototype

```text
UI Design
↓
Landing Page
↓
Login/Register
↓
Profile
↓
Skill Listing
↓
Student Search
```

## Phase 2 — MVP

```text
Authentication
+
Database
+
Connections
+
Messaging
+
Projects
+
Notifications
```

## Phase 3 — Community

```text
Feed
+
Resources
+
Learning Sessions
+
Reviews
```

## Phase 4 — Intelligence

```text
AI Matching
+
AI Learning Assistant
+
Skill Recommendations
```

## Phase 5 — Expansion

```text
Multiple Colleges
+
College Verification
+
Mobile App
+
College Partnerships
```

---

# 60. Product Differentiation

STEX focuses specifically on **student-to-student skill exchange**.

Its key differentiator is the combination of:

```text
Skills
   +
Learning
   +
Teaching
   +
Networking
   +
Projects
```

A student is not simply consuming educational content.

They become part of the learning ecosystem.

---

# 61. One-Line Product Description

> **STEX is a student skill exchange platform where students can teach what they know, learn what they want, find like-minded peers, and build projects together.**

---

# 62. Elevator Pitch

> **"STEX is a peer-to-peer skill exchange platform designed for college students. Students can showcase the skills they know, discover skills they want to learn, connect with peers who can teach them, and find teammates for projects. Instead of relying entirely on expensive courses or random social-media groups, STEX creates a dedicated student ecosystem for learning, teaching, networking, and collaboration."**

---

# 63. Core Product Loop

The central STEX growth loop is:

```text
Student joins
      ↓
Adds skills
      ↓
Discovers other students
      ↓
Connects
      ↓
Exchanges knowledge
      ↓
Builds relationships
      ↓
Creates/joins projects
      ↓
Gains experience
      ↓
Adds more skills
      ↓
Attracts more students
```

This creates a self-reinforcing student community.

---

# 64. Final Product Definition

STEX is not intended to replace traditional educational platforms.

It complements them by solving a different problem:

### Traditional platform

```text
Expert → Student
```

### STEX

```text
Student ↔ Student
```

The platform's fundamental idea is that **every student can be both a learner and a contributor.**

The ultimate goal is to create a collaborative ecosystem where students can discover people, exchange knowledge, form teams, work on projects, and develop practical skills together.

---

## STEX Product Philosophy

### Learn from students.

### Teach other students.

### Build with students.

**STEX — Learn. Teach. Connect. Build.**
